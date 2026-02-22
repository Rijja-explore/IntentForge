"""
ML API Routes

GET  /api/v1/ml/status   — model version, is_trained, evaluation metrics
POST /api/v1/ml/train    — trigger training (loads dataset, trains, saves)
GET  /api/v1/ml/metrics  — last evaluation report (precision / recall / AUC)
"""

import asyncio
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse

from app.utils.logger import get_logger
from app.services.ml_model_service import ml_model_service

logger = get_logger(__name__)
router = APIRouter(prefix="/ml", tags=["ML"])

# Simple in-memory training state
_training_state = {
    "running": False,
    "started_at": None,
    "last_error": None,
}


# ---------------------------------------------------------------------------
# GET /ml/status
# ---------------------------------------------------------------------------

@router.get("/status")
async def ml_status():
    """Return model version, whether models are loaded, and last eval metrics."""
    info = ml_model_service.get_model_info()
    return {
        "status": "ok",
        "scoring_engine": "ml" if info["is_trained"] else "heuristic",
        "training_in_progress": _training_state["running"],
        **info,
    }


# ---------------------------------------------------------------------------
# GET /ml/metrics
# ---------------------------------------------------------------------------

@router.get("/metrics")
async def ml_metrics():
    """Return the evaluation metrics from the last training run."""
    if not ml_model_service.is_trained:
        return JSONResponse(
            status_code=200,
            content={
                "status": "not_trained",
                "message": (
                    "Models have not been trained yet. "
                    "Run POST /api/v1/ml/train or execute scripts/train_models.py."
                ),
                "metrics": {},
            },
        )
    return {
        "status": "ok",
        "model_version": ml_model_service.model_version,
        "trained_at":    ml_model_service.trained_at,
        "metrics":       ml_model_service.eval_metrics,
    }


# ---------------------------------------------------------------------------
# POST /ml/train
# ---------------------------------------------------------------------------

@router.post("/train")
async def trigger_training(background_tasks: BackgroundTasks):
    """
    Kick off model training in the background.

    Loads the dataset (PaySim.csv or synthetic fallback), trains
    RandomForest + IsolationForest, evaluates, and saves artefacts.
    Returns immediately; poll GET /ml/status to check progress.
    """
    if _training_state["running"]:
        raise HTTPException(
            status_code=409,
            detail="Training is already in progress.",
        )

    background_tasks.add_task(_run_training)
    return {
        "status": "accepted",
        "message": "Training started in background. Poll GET /api/v1/ml/status to check progress.",
        "started_at": datetime.utcnow().isoformat() + "Z",
    }


# ---------------------------------------------------------------------------
# Background training task
# ---------------------------------------------------------------------------

async def _run_training():
    _training_state["running"]    = True
    _training_state["started_at"] = datetime.utcnow().isoformat() + "Z"
    _training_state["last_error"] = None
    try:
        # Run the blocking sklearn training in a thread pool
        await asyncio.get_event_loop().run_in_executor(None, _blocking_train)
    except Exception as exc:
        logger.error(f"Background training failed: {exc}")
        _training_state["last_error"] = str(exc)
    finally:
        _training_state["running"] = False


def _blocking_train():
    """Runs in thread-pool — all sklearn operations are synchronous."""
    from app.services.ml_dataset_service import get_training_data
    X_train, X_test, y_train, y_test, le, scaler = get_training_data()
    ml_model_service.train(X_train, y_train, X_test, y_test, le, scaler)
    logger.info("Background training completed successfully.")
