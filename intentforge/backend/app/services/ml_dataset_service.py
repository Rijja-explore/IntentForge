"""
ML Dataset Service — PaySim / SAML-D loader and feature engineering.

PaySim columns (kaggle.com/ntnu-testimon/paysim1):
  step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig,
  nameDest, oldbalanceDest, newbalanceDest, isFraud, isFlaggedFraud

SAML-D columns (anti-money-laundering transaction graph dataset):
  Detected automatically — falls back to PaySim-compatible schema if absent.

When neither dataset file is present this module generates a synthetic
dataframe that mirrors PaySim statistics so the rest of the pipeline
always has data to train on.
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Transaction-type labels used in PaySim
PAYSIM_TYPES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]

# High-risk types (most fraud happens here in PaySim)
HIGH_RISK_TYPES = {"CASH_OUT", "TRANSFER"}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_training_data(
    test_size: float = 0.2,
    random_state: int = 42,
    max_rows: int = 200_000,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, LabelEncoder, StandardScaler]:
    """
    Load (or synthesise), engineer features, and split into train/test.

    Returns
    -------
    X_train, X_test, y_train, y_test, label_encoder, scaler
    """
    df = _load_dataset(max_rows)
    X, y, le, scaler = engineer_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    logger.info(
        f"Training data ready — {len(X_train)} train / {len(X_test)} test | "
        f"fraud rate: {y.mean():.3f}"
    )
    return X_train, X_test, y_train, y_test, le, scaler


def engineer_features(
    df: pd.DataFrame,
) -> Tuple[np.ndarray, np.ndarray, LabelEncoder, StandardScaler]:
    """
    Build feature matrix and label vector from a raw dataframe.

    Works with PaySim, SAML-D (if column-mapped), and synthetic frames.
    Returns X (float64 ndarray), y (int ndarray), fitted LabelEncoder, fitted StandardScaler.
    """
    df = df.copy()

    # --- type encoding ---
    le = LabelEncoder()
    if "type" in df.columns:
        df["type_enc"] = le.fit_transform(df["type"].astype(str))
    else:
        le.fit(PAYSIM_TYPES)
        df["type_enc"] = 0

    # --- derived features ---
    eps = 1e-9  # avoid division by zero

    df["log_amount"] = np.log1p(df.get("amount", pd.Series(np.zeros(len(df)), index=df.index)))

    old_orig = df.get("oldbalanceOrg", pd.Series(np.zeros(len(df)), index=df.index))
    new_orig = df.get("newbalanceOrig", pd.Series(np.zeros(len(df)), index=df.index))
    old_dest = df.get("oldbalanceDest", pd.Series(np.zeros(len(df)), index=df.index))
    new_dest = df.get("newbalanceDest", pd.Series(np.zeros(len(df)), index=df.index))
    amount   = df.get("amount", pd.Series(np.zeros(len(df)), index=df.index))

    df["balance_diff_orig"]    = old_orig - new_orig
    df["balance_diff_dest"]    = new_dest - old_dest
    df["amount_to_orig_ratio"] = amount / (old_orig + eps)
    df["balance_error_orig"]   = (old_orig - new_orig - amount).abs()
    df["balance_error_dest"]   = (new_dest - old_dest - amount).abs()
    df["is_high_risk_type"]    = df["type"].isin(HIGH_RISK_TYPES).astype(int) if "type" in df.columns else 0

    feature_cols = [
        "type_enc",
        "log_amount",
        "balance_diff_orig",
        "balance_diff_dest",
        "amount_to_orig_ratio",
        "balance_error_orig",
        "balance_error_dest",
        "is_high_risk_type",
    ]
    # Optional PaySim column
    if "step" in df.columns:
        df["step_mod_24"] = df["step"] % 24  # hour-of-cycle proxy
        feature_cols.append("step_mod_24")

    X_raw = df[feature_cols].fillna(0).values.astype(np.float64)

    # Scale
    scaler = StandardScaler()
    X = scaler.fit_transform(X_raw)

    # Labels
    label_col = _detect_label_col(df)
    y = df[label_col].astype(int).values if label_col else np.zeros(len(df), dtype=int)

    return X, y, le, scaler


def transform_transaction(
    txn: dict,
    le: LabelEncoder,
    scaler: StandardScaler,
) -> np.ndarray:
    """
    Convert a single API transaction dict into the same feature vector used
    during training.  Returns shape (1, n_features).
    """
    txn_type = txn.get("type", "PAYMENT")
    try:
        type_enc = le.transform([txn_type])[0]
    except ValueError:
        type_enc = 0  # unseen label

    amount        = float(txn.get("amount", 0))
    old_orig      = float(txn.get("oldbalanceOrg", 0))
    new_orig      = float(txn.get("newbalanceOrig", old_orig - amount))
    old_dest      = float(txn.get("oldbalanceDest", 0))
    new_dest      = float(txn.get("newbalanceDest", old_dest + amount))
    eps           = 1e-9

    features = [
        type_enc,
        np.log1p(amount),
        old_orig - new_orig,
        new_dest - old_dest,
        amount / (old_orig + eps),
        abs(old_orig - new_orig - amount),
        abs(new_dest - old_dest - amount),
        int(txn_type in HIGH_RISK_TYPES),
    ]

    # Pad step_mod_24 if scaler was trained with it
    if scaler.n_features_in_ == 9:
        features.append(0)  # unknown step

    return scaler.transform([features])


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _load_dataset(max_rows: int) -> pd.DataFrame:
    """Try PaySim -> SAML-D -> synthetic, in that order."""
    datasets_dir = settings.ML_DATASETS_DIR

    # PaySim — match any file whose name starts with "paysim" (case-insensitive)
    paysim_path = _find_csv(datasets_dir, prefix="paysim")
    if paysim_path:
        logger.info(f"Loading PaySim dataset from {paysim_path}")
        df = pd.read_csv(paysim_path, nrows=max_rows)
        df = _normalise_paysim(df)
        logger.info(f"PaySim loaded: {len(df)} rows, fraud rate {df['isFraud'].mean():.4f}")
        return df

    # SAML-D — match any file whose name starts with "saml"
    saml_path = _find_csv(datasets_dir, prefix="saml")
    if saml_path:
        logger.info(f"Loading SAML-D dataset from {saml_path}")
        df = pd.read_csv(saml_path, nrows=max_rows)
        df = _normalise_saml(df)
        logger.info(f"SAML-D loaded: {len(df)} rows")
        return df

    logger.warning(
        "No dataset found in '%s'. Generating synthetic training data. "
        "Download PaySim.csv from Kaggle and place it in backend/datasets/ "
        "then re-run scripts/train_models.py for real model quality.",
        datasets_dir,
    )
    return _generate_synthetic(n_rows=50_000)


def _find_csv(directory: str, prefix: str) -> str | None:
    """
    Return the first CSV file in `directory` whose name starts with `prefix`
    (case-insensitive).  Returns None if nothing matches.
    """
    if not os.path.isdir(directory):
        return None
    for fname in os.listdir(directory):
        if fname.lower().startswith(prefix) and fname.lower().endswith(".csv"):
            return os.path.join(directory, fname)
    return None


def _normalise_paysim(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure expected column names exist."""
    rename = {}
    # tolerate both camelCase and lower variants
    for col in df.columns:
        if col.lower() == "oldbalanceorig":
            rename[col] = "oldbalanceOrg"
        elif col.lower() == "newbalanceorig":
            rename[col] = "newbalanceOrig"
    if rename:
        df = df.rename(columns=rename)
    return df


def _normalise_saml(df: pd.DataFrame) -> pd.DataFrame:
    """
    Map SAML-D columns to PaySim-compatible schema where possible.
    SAML-D has: TransactionId, Timestamp, FromBank, Account, ToBank,
                Account.1, AmountReceived, ReceivingCurrency,
                AmountPaid, PaymentCurrency, PaymentFormat, IsLaundering
    """
    col_map = {}
    cols_lower = {c.lower(): c for c in df.columns}

    if "amountpaid" in cols_lower:
        col_map[cols_lower["amountpaid"]] = "amount"
    if "islaundering" in cols_lower:
        col_map[cols_lower["islaundering"]] = "isFraud"
    if "paymentformat" in cols_lower:
        col_map[cols_lower["paymentformat"]] = "type"

    df = df.rename(columns=col_map)

    # Fill in missing PaySim-style columns with zeros
    for c in ["oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"]:
        if c not in df.columns:
            df[c] = 0.0

    if "type" not in df.columns:
        df["type"] = "TRANSFER"
    if "isFraud" not in df.columns:
        df["isFraud"] = 0

    return df


def _generate_synthetic(n_rows: int = 50_000) -> pd.DataFrame:
    """
    Generate a synthetic dataframe that approximates PaySim statistics.
    Fraud rate ~0.13 % (mirroring PaySim).
    """
    rng = np.random.default_rng(42)

    n_fraud   = max(int(n_rows * 0.0013), 200)
    n_legit   = n_rows - n_fraud
    types     = rng.choice(PAYSIM_TYPES, size=n_rows, p=[0.22, 0.35, 0.04, 0.34, 0.05])

    amount    = np.concatenate([
        rng.lognormal(mean=5.0, sigma=1.8, size=n_legit),
        rng.lognormal(mean=8.5, sigma=1.2, size=n_fraud),  # fraud = higher amounts
    ])
    old_orig  = rng.lognormal(mean=7.0, sigma=2.0, size=n_rows)
    new_orig  = np.maximum(old_orig - amount, 0)
    old_dest  = rng.lognormal(mean=6.0, sigma=2.0, size=n_rows)
    new_dest  = old_dest + amount

    # Fraudulent rows have zeroed-out destination balance after transfer
    fraud_idx     = rng.choice(n_rows, size=n_fraud, replace=False)
    is_fraud      = np.zeros(n_rows, dtype=int)
    is_fraud[fraud_idx] = 1

    # Introduce the characteristic PaySim pattern: new balance is 0 for fraud
    new_orig[fraud_idx] = 0.0
    new_dest[fraud_idx] = 0.0

    steps = rng.integers(1, 743, size=n_rows)

    df = pd.DataFrame({
        "step":           steps,
        "type":           types,
        "amount":         amount,
        "oldbalanceOrg":  old_orig,
        "newbalanceOrig": new_orig,
        "oldbalanceDest": old_dest,
        "newbalanceDest": new_dest,
        "isFraud":        is_fraud,
        "isFlaggedFraud": np.zeros(n_rows, dtype=int),
    })

    return df


def _detect_label_col(df: pd.DataFrame) -> str | None:
    """Return the fraud label column name if present."""
    for candidate in ["isFraud", "IsLaundering", "is_fraud", "label", "fraud"]:
        if candidate in df.columns:
            return candidate
    return None
