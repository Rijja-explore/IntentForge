#!/usr/bin/env python3
"""
Offline Model Training Script
==============================
Run this from the backend/ directory:

    python scripts/train_models.py

Optional flags:
    --dataset   path to PaySim.csv (default: uses ML_DATASETS_DIR from config)
    --max-rows  max rows to load from CSV (default: 200000)
    --no-eval   skip printing evaluation report

Requirements:
    pip install -r requirements.txt

Output:
    models/fraud_rf_model.joblib
    models/anomaly_iso_forest.joblib
    models/feature_scaler.joblib
    models/label_encoder.joblib
"""

import sys
import os
import argparse
import time

# Ensure we can import from app/ when running from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def parse_args():
    parser = argparse.ArgumentParser(description="Train IntentForge ML models")
    parser.add_argument(
        "--dataset",
        default=None,
        help="Path to PaySim.csv (overrides config ML_DATASETS_DIR)",
    )
    parser.add_argument(
        "--max-rows",
        type=int,
        default=200_000,
        help="Max rows to load from CSV (default: 200000)",
    )
    parser.add_argument(
        "--no-eval",
        action="store_true",
        help="Skip printing the evaluation report",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    from app.config import settings
    from app.services.ml_dataset_service import get_training_data, _load_dataset, engineer_features
    from app.services.ml_model_service import MLModelService
    from sklearn.model_selection import train_test_split

    print("=" * 60)
    print(" IntentForge — Model Training")
    print("=" * 60)

    # Override dataset path if provided via CLI
    if args.dataset:
        if not os.path.isfile(args.dataset):
            print(f"[ERROR] Dataset file not found: {args.dataset}")
            sys.exit(1)
        settings.ML_DATASETS_DIR = os.path.dirname(args.dataset)
        print(f"[INFO]  Using custom dataset: {args.dataset}")
    else:
        print(f"[INFO]  Dataset directory: {os.path.abspath(settings.ML_DATASETS_DIR)}")

    print(f"[INFO]  Models directory:  {os.path.abspath(settings.ML_MODELS_DIR)}")
    print()

    # Load / generate data
    t0 = time.time()
    print("[1/4] Loading dataset …")
    X_train, X_test, y_train, y_test, le, scaler = get_training_data(
        max_rows=args.max_rows
    )
    print(
        f"      Train: {len(X_train):,} samples   "
        f"Test: {len(X_test):,} samples   "
        f"Fraud rate (train): {y_train.mean():.4f}"
    )

    # Train
    print("[2/4] Training RandomForest + IsolationForest …")
    svc = MLModelService.__new__(MLModelService)  # create without auto-loading
    svc.fraud_model   = None
    svc.anomaly_model = None
    svc.scaler        = None
    svc.label_encoder = None
    svc.is_trained    = False
    svc.trained_at    = None
    svc.model_version = settings.ML_MODEL_VERSION
    svc.eval_metrics  = {}

    metrics = svc.train(X_train, y_train, X_test, y_test, le, scaler)
    elapsed = time.time() - t0

    # Results
    print(f"[3/4] Training complete in {elapsed:.1f}s")
    print()

    if not args.no_eval:
        print("[4/4] Evaluation Report")
        print("-" * 40)
        for key, value in metrics.items():
            label = key.replace("_", " ").title()
            print(f"  {label:<35} {value}")
        print()

    print("[OK]  Models saved to:")
    print(f"      {os.path.abspath(settings.ML_FRAUD_MODEL_PATH)}")
    print(f"      {os.path.abspath(settings.ML_ANOMALY_MODEL_PATH)}")
    print(f"      {os.path.abspath(settings.ML_SCALER_PATH)}")
    print(f"      {os.path.abspath(settings.ML_LABEL_ENCODER_PATH)}")
    print()
    print("Restart the backend server to pick up the new models.")
    print("=" * 60)


if __name__ == "__main__":
    main()
