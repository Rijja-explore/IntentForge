"""
ML Compliance & Risk Scoring Service

When pre-trained models are available (see ml_model_service.py) this service
uses real RandomForest fraud scores and IsolationForest anomaly scores.
If no model files are found it falls back to the original heuristic approach
so the API stays functional without any offline training step.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import random
import numpy as np
from uuid import UUID

from app.config import settings
from app.utils.logger import get_logger
from app.services.ml_model_service import ml_model_service
from app.services.ml_dataset_service import transform_transaction

logger = get_logger(__name__)


class ComplianceMLService:
    """
    Compliance and risk scoring backed by ML models with heuristic fallback.
    """

    def __init__(self):
        # In-memory transaction store (demo — replace with DB in production)
        self.transaction_history: Dict[UUID, List[Dict[str, Any]]] = {}

        # Risk thresholds
        self.HIGH_RISK_THRESHOLD   = 0.7
        self.MEDIUM_RISK_THRESHOLD = 0.4

        # Heuristic anomaly params (used when models are absent)
        self.ANOMALY_AMOUNT_MULTIPLIER    = 3.0
        self.ANOMALY_FREQUENCY_THRESHOLD  = 10

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def compute_compliance_score(
        self,
        wallet_id: UUID,
        recent_transactions: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Compute comprehensive compliance score for a wallet.

        Uses real ML scoring when models are loaded; otherwise falls back to
        heuristics.  The response schema is identical in both cases.
        """
        logger.info(f"Computing compliance score for wallet: {wallet_id}")

        if recent_transactions is None:
            recent_transactions = self._get_or_generate_transaction_history(wallet_id)

        using_ml = ml_model_service.is_trained

        if using_ml:
            result = await self._score_with_ml(wallet_id, recent_transactions)
        else:
            result = await self._score_with_heuristics(wallet_id, recent_transactions)

        logger.info(
            f"Compliance score: {result['compliance_score']:.2f} "
            f"risk={result['risk_level']} "
            f"engine={'ml' if using_ml else 'heuristic'}"
        )
        return result

    # ------------------------------------------------------------------
    # ML-backed scoring
    # ------------------------------------------------------------------

    async def _score_with_ml(
        self,
        wallet_id: UUID,
        transactions: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Score using RandomForest + IsolationForest."""

        fraud_scores:   List[float] = []
        anomaly_scores: List[float] = []
        detected_anomalies: List[Dict[str, Any]] = []

        le     = ml_model_service.label_encoder
        scaler = ml_model_service.scaler

        for txn in transactions:
            try:
                fv      = transform_transaction(txn, le, scaler)
                f_score = ml_model_service.predict_fraud_score(fv)
                a_score = ml_model_service.predict_anomaly_score(fv)
            except Exception as exc:
                logger.debug(f"ML inference error (falling back to 0): {exc}")
                f_score, a_score = 0.0, 0.0

            fraud_scores.append(f_score)
            anomaly_scores.append(a_score)

            # Flag as anomaly if either score is high
            is_fraud_flag   = f_score   >= settings.ML_FRAUD_THRESHOLD
            is_anomaly_flag = a_score   >= 0.65
            if (is_fraud_flag or is_anomaly_flag) and len(detected_anomalies) < 5:
                flags = []
                if is_fraud_flag:
                    flags.append(f"fraud_probability_{f_score:.2f}")
                if is_anomaly_flag:
                    flags.append(f"anomaly_score_{a_score:.2f}")
                detected_anomalies.append({
                    "amount":    txn.get("amount", 0),
                    "category":  txn.get("category", "unknown"),
                    "timestamp": txn.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                    "flags":     flags,
                    "severity":  "high" if (is_fraud_flag and is_anomaly_flag) else "medium",
                    "fraud_score":   round(f_score, 3),
                    "anomaly_score": round(a_score, 3),
                })

        avg_fraud   = float(np.mean(fraud_scores))   if fraud_scores   else 0.0
        avg_anomaly = float(np.mean(anomaly_scores)) if anomaly_scores else 0.0

        # Compliance components
        policy_adherence   = self._calculate_policy_adherence(transactions)
        pattern_score      = self._calculate_pattern_score(transactions)

        # Incorporate ML signal: fraud/anomaly scores reduce compliance
        ml_penalty         = 0.5 * avg_fraud + 0.5 * avg_anomaly
        risk_score         = min(ml_penalty + 0.1 * (1 - policy_adherence), 1.0)

        compliance_score   = max(
            policy_adherence * 0.45
            + pattern_score  * 0.25
            + (1.0 - avg_fraud)   * 0.20
            + (1.0 - avg_anomaly) * 0.10,
            0.0,
        )

        return {
            "wallet_id":       str(wallet_id),
            "compliance_score": round(compliance_score, 3),
            "risk_level":       self._classify_risk(risk_score),
            "risk_score":       round(risk_score, 3),
            "component_scores": {
                "policy_adherence_score": round(policy_adherence, 3),
                "pattern_score":          round(pattern_score,    3),
                "risk_score":             round(risk_score,       3),
                "avg_fraud_probability":  round(avg_fraud,        3),
                "avg_anomaly_score":      round(avg_anomaly,      3),
            },
            "anomalies":       detected_anomalies,
            "transaction_count": len(transactions),
            "insights":        self._generate_behavioral_insights(
                                    transactions, detected_anomalies, compliance_score
                               ),
            "analysis_period": {
                "start": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z",
                "end":   datetime.utcnow().isoformat() + "Z",
            },
            "data_source":   "actual" if transactions else "synthetic",
            "computed_at":   datetime.utcnow().isoformat() + "Z",
            "model_version": settings.ML_MODEL_VERSION,
            "scoring_engine": "ml",
        }

    # ------------------------------------------------------------------
    # Heuristic fallback scoring (unchanged logic from original)
    # ------------------------------------------------------------------

    async def _score_with_heuristics(
        self,
        wallet_id: UUID,
        transactions: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Original heuristic scoring, used when ML models are absent."""

        policy_adherence = self._calculate_policy_adherence(transactions)
        pattern_score    = self._calculate_pattern_score(transactions)
        risk_score       = self._calculate_risk_score(transactions)
        anomalies        = self._detect_anomalies(transactions)

        compliance_score = (
            policy_adherence * 0.5
            + pattern_score  * 0.3
            + (1.0 - risk_score) * 0.2
        )

        return {
            "wallet_id":       str(wallet_id),
            "compliance_score": round(compliance_score, 2),
            "risk_level":       self._classify_risk(risk_score),
            "risk_score":       round(risk_score, 2),
            "component_scores": {
                "policy_adherence_score": round(policy_adherence, 2),
                "pattern_score":          round(pattern_score, 2),
                "risk_score":             round(risk_score, 2),
            },
            "anomalies":       anomalies,
            "transaction_count": len(transactions),
            "insights":        self._generate_behavioral_insights(
                                    transactions, anomalies, compliance_score
                               ),
            "analysis_period": {
                "start": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z",
                "end":   datetime.utcnow().isoformat() + "Z",
            },
            "data_source":   "synthetic",
            "computed_at":   datetime.utcnow().isoformat() + "Z",
            "model_version": "heuristic_v1.0",
            "scoring_engine": "heuristic",
        }

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    def _get_or_generate_transaction_history(
        self, wallet_id: UUID
    ) -> List[Dict[str, Any]]:
        if wallet_id in self.transaction_history:
            return self.transaction_history[wallet_id]

        categories = ["education", "food", "shopping", "entertainment", "transport", "utilities"]
        locations  = ["IN-DL", "IN-MH", "IN-KA", "IN-TN"]
        merchants  = ["BookStore", "CafeShop", "TechStore", "FoodMart", "GasStation"]
        txn_types  = ["PAYMENT", "CASH_OUT", "TRANSFER", "CASH_IN", "DEBIT"]

        num_tx = random.randint(20, 50)
        transactions = []
        for _ in range(num_tx):
            days_ago = random.randint(0, 30)
            amount   = round(random.uniform(100, 5000), 2)
            old_orig = round(random.uniform(amount, amount * 10), 2)
            transactions.append({
                "amount":          amount,
                "type":            random.choice(txn_types),
                "category":        random.choice(categories),
                "location":        random.choice(locations),
                "merchant":        random.choice(merchants),
                "timestamp":       (datetime.utcnow() - timedelta(days=days_ago)).isoformat() + "Z",
                "approved":        random.random() > 0.1,
                "oldbalanceOrg":   old_orig,
                "newbalanceOrig":  round(old_orig - amount, 2),
                "oldbalanceDest":  round(random.uniform(0, 10000), 2),
                "newbalanceDest":  round(random.uniform(0, 10000) + amount, 2),
            })

        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        self.transaction_history[wallet_id] = transactions
        return transactions

    def _calculate_policy_adherence(self, transactions: List[Dict[str, Any]]) -> float:
        if not transactions:
            return 1.0
        approved_count = sum(1 for t in transactions if t.get("approved", True))
        approval_rate  = approved_count / len(transactions)
        recent = transactions[:10]
        recent_rate = (
            sum(1 for t in recent if t.get("approved", True)) / len(recent)
            if recent else 1.0
        )
        return min(approval_rate * 0.6 + recent_rate * 0.4, 1.0)

    def _calculate_pattern_score(self, transactions: List[Dict[str, Any]]) -> float:
        if len(transactions) < 3:
            return 0.5
        amounts   = [t["amount"] for t in transactions]
        avg_amt   = sum(amounts) / len(amounts)
        variance  = sum((x - avg_amt) ** 2 for x in amounts) / len(amounts)
        std_dev   = variance ** 0.5
        cv        = std_dev / avg_amt if avg_amt > 0 else 0
        amount_score   = max(0, 1.0 - cv / 2)
        categories     = [t["category"] for t in transactions]
        category_score = min(len(set(categories)) / 5, 1.0)
        time_score     = self._analyze_time_patterns(transactions)
        return min(amount_score * 0.4 + category_score * 0.3 + time_score * 0.3, 1.0)

    def _calculate_risk_score(self, transactions: List[Dict[str, Any]]) -> float:
        if not transactions:
            return 0.0
        risk_factors = []
        amounts          = [t["amount"] for t in transactions]
        high_value_count = sum(1 for a in amounts if a > 10_000)
        risk_factors.append((high_value_count / len(transactions)) * 0.5)
        rejection_count  = sum(1 for t in transactions if not t.get("approved", True))
        risk_factors.append((rejection_count / len(transactions)) * 0.8)
        recent_24h = [
            t for t in transactions
            if (datetime.utcnow() - datetime.fromisoformat(
                t["timestamp"].replace("Z", "")
            )).days == 0
        ]
        if len(recent_24h) > self.ANOMALY_FREQUENCY_THRESHOLD:
            risk_factors.append(0.3)
        locations = {t["location"] for t in transactions if "location" in t}
        if len(locations) > 5:
            risk_factors.append(0.2)
        return min(sum(risk_factors), 1.0)

    def _analyze_time_patterns(self, transactions: List[Dict[str, Any]]) -> float:
        if len(transactions) < 5:
            return 0.5
        timestamps = sorted(
            datetime.fromisoformat(t["timestamp"].replace("Z", ""))
            for t in transactions[:20]
        )
        gaps = [
            (timestamps[i + 1] - timestamps[i]).total_seconds() / 3600
            for i in range(len(timestamps) - 1)
        ]
        if not gaps:
            return 0.5
        avg_gap = sum(gaps) / len(gaps)
        if 1 <= avg_gap <= 48:
            return 0.9
        elif avg_gap < 1:
            return 0.6
        elif avg_gap > 168:
            return 0.7
        return 0.8

    def _detect_anomalies(
        self, transactions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        if len(transactions) < 5:
            return []
        amounts  = [t["amount"] for t in transactions]
        avg_amt  = sum(amounts) / len(amounts)
        anomalies = []
        for txn in transactions[:20]:
            flags = []
            if txn["amount"] > avg_amt * self.ANOMALY_AMOUNT_MULTIPLIER:
                flags.append("unusually_high_amount")
            if not txn.get("approved", True):
                flags.append("transaction_rejected")
            if flags:
                anomalies.append({
                    "amount":    txn["amount"],
                    "category":  txn["category"],
                    "timestamp": txn["timestamp"],
                    "flags":     flags,
                    "severity":  "high" if len(flags) > 1 else "medium",
                })
        return anomalies[:5]

    def _classify_risk(self, risk_score: float) -> str:
        if risk_score >= self.HIGH_RISK_THRESHOLD:
            return "high"
        elif risk_score >= self.MEDIUM_RISK_THRESHOLD:
            return "medium"
        return "low"

    def _generate_behavioral_insights(
        self,
        transactions: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]],
        compliance_score: float,
    ) -> List[str]:
        insights = []
        if compliance_score >= 0.9:
            insights.append("Excellent compliance record — consistently follows policies")
        elif compliance_score >= 0.7:
            insights.append("Good compliance — minor policy violations detected")
        else:
            insights.append("Compliance needs improvement — review policy adherence")

        if transactions:
            categories   = [t["category"] for t in transactions]
            top_cat      = max(set(categories), key=categories.count)
            cat_pct      = categories.count(top_cat) / len(categories) * 100
            insights.append(
                f"Primary spending category: {top_cat} ({cat_pct:.0f}% of transactions)"
            )

        if anomalies:
            insights.append(
                f"{len(anomalies)} anomalous transaction(s) detected — review recommended"
            )
        else:
            insights.append("No anomalies detected — transaction patterns are normal")

        if len(transactions) > 30:
            insights.append(
                f"Transaction frequency: {len(transactions) / 4.3:.1f} per week"
            )

        return insights


# Global singleton
compliance_ml_service = ComplianceMLService()
