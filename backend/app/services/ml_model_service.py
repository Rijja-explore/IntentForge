"""
ML Model Service — trains and serves fraud-detection models.

Models
------
1. RandomForestClassifier  — fraud probability per transaction  (supervised)
2. IsolationForest         — anomaly score per transaction       (unsupervised)

Both are trained on PaySim (or synthetic) data by scripts/train_models.py
and persisted to backend/models/.  On startup this service attempts to load
the saved files; if they are absent it falls back to heuristics gracefully.
"""

import os
import json
import time
import numpy as np
import joblib
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    average_precision_score,
)

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MLModelService:
    """Manages fraud-detection and anomaly models."""

    def __init__(self):
        self.fraud_model:   Optional[RandomForestClassifier] = None
        self.anomaly_model: Optional[IsolationForest]        = None
        self.scaler        = None   # StandardScaler
        self.label_encoder = None   # LabelEncoder

        self.is_trained:   bool = False
        self.trained_at:   Optional[str] = None
        self.model_version: str = settings.ML_MODEL_VERSION

        # Last evaluation metrics (populated after train / load)
        self.eval_metrics: Dict[str, Any] = {}

        self._try_load_models()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict_fraud_score(self, feature_vector: np.ndarray) -> float:
        """
        Return fraud probability in [0, 1].
        Raises RuntimeError if models are not loaded.
        """
        if not self.is_trained or self.fraud_model is None:
            raise RuntimeError("Fraud model not loaded — run train_models.py first")
        proba = self.fraud_model.predict_proba(feature_vector)[0]
        # index 1 = probability of class 1 (fraud)
        return float(proba[1])

    def predict_anomaly_score(self, feature_vector: np.ndarray) -> float:
        """
        Return anomaly score normalised to [0, 1].
        IsolationForest.score_samples() returns negative values;
        lower (more negative) = more anomalous.
        We invert and rescale to [0, 1] using the training distribution.
        """
        if not self.is_trained or self.anomaly_model is None:
            raise RuntimeError("Anomaly model not loaded — run train_models.py first")
        raw = self.anomaly_model.score_samples(feature_vector)[0]
        # Raw range is roughly [-0.7, 0.1] for IsolationForest on numeric data.
        # Clamp and normalize to [0, 1] (1 = most anomalous).
        normalised = float(np.clip((-raw - 0.1) / 0.6, 0.0, 1.0))
        return normalised

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_test:  np.ndarray,
        y_test:  np.ndarray,
        label_encoder,
        scaler,
    ) -> Dict[str, Any]:
        """
        Train both models, evaluate, save to disk.

        Returns evaluation metrics dict.
        """
        logger.info("Starting model training …")
        t0 = time.time()

        self.label_encoder = label_encoder
        self.scaler        = scaler

        # --- RandomForest fraud classifier ---
        logger.info("Training RandomForestClassifier …")
        fraud_clf = RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            class_weight="balanced",   # handles imbalanced fraud labels
            n_jobs=-1,
            random_state=42,
        )
        fraud_clf.fit(X_train, y_train)

        # --- IsolationForest anomaly detector (unsupervised — train on all) ---
        logger.info("Training IsolationForest …")
        X_all = np.vstack([X_train, X_test])
        iso = IsolationForest(
            n_estimators=200,
            contamination=settings.ML_ANOMALY_CONTAMINATION,
            random_state=42,
            n_jobs=-1,
        )
        iso.fit(X_all)

        # --- Evaluate ---
        metrics = self._evaluate(fraud_clf, X_test, y_test)
        elapsed = time.time() - t0
        metrics["training_time_seconds"] = round(elapsed, 2)
        metrics["train_samples"] = int(len(X_train))
        metrics["test_samples"]  = int(len(X_test))

        # --- Persist ---
        self._save_models(fraud_clf, iso, label_encoder, scaler, metrics)

        self.fraud_model   = fraud_clf
        self.anomaly_model = iso
        self.is_trained    = True
        self.trained_at    = datetime.utcnow().isoformat() + "Z"
        self.eval_metrics  = metrics

        logger.info(
            f"Training complete in {elapsed:.1f}s — "
            f"AUC-ROC: {metrics.get('roc_auc', 'N/A')}, "
            f"Avg-Precision: {metrics.get('avg_precision', 'N/A')}"
        )
        return metrics

    def get_model_info(self) -> Dict[str, Any]:
        """Return a status dict for the /ml/status endpoint."""
        return {
            "is_trained":     self.is_trained,
            "model_version":  self.model_version,
            "trained_at":     self.trained_at,
            "fraud_model":    type(self.fraud_model).__name__ if self.fraud_model else None,
            "anomaly_model":  type(self.anomaly_model).__name__ if self.anomaly_model else None,
            "eval_metrics":   self.eval_metrics,
            "model_paths": {
                "fraud":   settings.ML_FRAUD_MODEL_PATH,
                "anomaly": settings.ML_ANOMALY_MODEL_PATH,
                "scaler":  settings.ML_SCALER_PATH,
            },
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _try_load_models(self) -> None:
        """Attempt to load pre-trained models from disk. Silent on failure."""
        paths = [
            settings.ML_FRAUD_MODEL_PATH,
            settings.ML_ANOMALY_MODEL_PATH,
            settings.ML_SCALER_PATH,
            settings.ML_LABEL_ENCODER_PATH,
        ]
        if not all(os.path.isfile(p) for p in paths):
            logger.warning(
                "Pre-trained model files not found — running in heuristic fallback mode. "
                "Run 'python scripts/train_models.py' inside backend/ to train real models."
            )
            return

        try:
            self.fraud_model   = joblib.load(settings.ML_FRAUD_MODEL_PATH)
            self.anomaly_model = joblib.load(settings.ML_ANOMALY_MODEL_PATH)
            self.scaler        = joblib.load(settings.ML_SCALER_PATH)
            self.label_encoder = joblib.load(settings.ML_LABEL_ENCODER_PATH)
            self.is_trained    = True
            self.trained_at    = datetime.utcfromtimestamp(
                os.path.getmtime(settings.ML_FRAUD_MODEL_PATH)
            ).isoformat() + "Z"
            # Load persisted evaluation metrics if available
            metrics_path = os.path.join(settings.ML_MODELS_DIR, "eval_metrics.json")
            if os.path.isfile(metrics_path):
                with open(metrics_path) as f:
                    self.eval_metrics = json.load(f)
            logger.info("Pre-trained ML models loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load ML models: {exc}")
            self.is_trained = False

    def _evaluate(
        self,
        model: RandomForestClassifier,
        X_test: np.ndarray,
        y_test: np.ndarray,
    ) -> Dict[str, Any]:
        """Compute key classification metrics."""
        y_pred  = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]

        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

        metrics: Dict[str, Any] = {
            "roc_auc":       round(roc_auc_score(y_test, y_proba), 4),
            "avg_precision": round(average_precision_score(y_test, y_proba), 4),
        }

        for label_key in ["0", "1", "macro avg", "weighted avg"]:
            if label_key in report:
                clean = label_key.replace(" ", "_")
                metrics[f"class_{clean}_precision"] = round(report[label_key]["precision"], 4)
                metrics[f"class_{clean}_recall"]    = round(report[label_key]["recall"], 4)
                metrics[f"class_{clean}_f1"]        = round(report[label_key]["f1-score"], 4)

        return metrics

    def _save_models(
        self,
        fraud_model,
        anomaly_model,
        label_encoder,
        scaler,
        metrics: Dict[str, Any] = None,
    ) -> None:
        """Persist all artefacts to configured paths."""
        os.makedirs(settings.ML_MODELS_DIR, exist_ok=True)
        joblib.dump(fraud_model,   settings.ML_FRAUD_MODEL_PATH)
        joblib.dump(anomaly_model, settings.ML_ANOMALY_MODEL_PATH)
        joblib.dump(scaler,        settings.ML_SCALER_PATH)
        joblib.dump(label_encoder, settings.ML_LABEL_ENCODER_PATH)
        if metrics:
            metrics_path = os.path.join(settings.ML_MODELS_DIR, "eval_metrics.json")
            with open(metrics_path, "w") as f:
                json.dump(metrics, f, indent=2)
        logger.info(f"Models saved to {settings.ML_MODELS_DIR}/")


# ---------------------------------------------------------------------------
# Global singleton — imported by compliance_ml_service and routes
# ---------------------------------------------------------------------------
ml_model_service = MLModelService()
