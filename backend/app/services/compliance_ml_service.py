"""
ML Compliance & Risk Scoring Service
Computes compliance scores, anomaly signals, and risk indicators
Uses lightweight heuristics and synthetic transaction data for demo
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import random
from uuid import UUID
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ComplianceMLService:
    """
    Lightweight ML/heuristic system for compliance and risk scoring
    """
    
    def __init__(self):
        # Mock transaction history for demo
        self.transaction_history: Dict[UUID, List[Dict[str, Any]]] = {}
        
        # Risk thresholds
        self.HIGH_RISK_THRESHOLD = 0.7
        self.MEDIUM_RISK_THRESHOLD = 0.4
        
        # Anomaly detection parameters
        self.ANOMALY_AMOUNT_MULTIPLIER = 3.0
        self.ANOMALY_FREQUENCY_THRESHOLD = 10  # transactions per hour
    
    async def compute_compliance_score(
        self,
        wallet_id: UUID,
        recent_transactions: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Compute comprehensive compliance score for a wallet
        
        Args:
            wallet_id: Wallet identifier
            recent_transactions: Optional list of recent transactions
            
        Returns:
            Compliance metrics including score, anomalies, and risk indicators
        """
        logger.info(f"Computing compliance score for wallet: {wallet_id}")
        
        # Get or generate synthetic transaction history
        if recent_transactions is None:
            recent_transactions = self._get_or_generate_transaction_history(wallet_id)
        
        # Calculate component scores
        policy_adherence_score = self._calculate_policy_adherence(recent_transactions)
        transaction_pattern_score = self._calculate_pattern_score(recent_transactions)
        risk_score = self._calculate_risk_score(recent_transactions)
        
        # Detect anomalies
        anomalies = self._detect_anomalies(recent_transactions)
        
        # Calculate overall compliance score (weighted average)
        compliance_score = (
            policy_adherence_score * 0.5 +
            transaction_pattern_score * 0.3 +
            (1.0 - risk_score) * 0.2
        )
        
        # Risk classification
        risk_level = self._classify_risk(risk_score)
        
        # Behavioral insights
        insights = self._generate_behavioral_insights(
            recent_transactions,
            anomalies,
            compliance_score
        )
        
        result = {
            "wallet_id": str(wallet_id),
            "compliance_score": round(compliance_score, 2),
            "risk_level": risk_level,
            "risk_score": round(risk_score, 2),
            "component_scores": {
                "policy_adherence_score": round(policy_adherence_score, 2),
                "pattern_score": round(transaction_pattern_score, 2),
                "risk_score": round(risk_score, 2)
            },
            "anomalies": anomalies,
            "transaction_count": len(recent_transactions),
            "insights": insights,
            "analysis_period": {
                "start": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z",
                "end": datetime.utcnow().isoformat() + "Z"
            },
            "data_source": "synthetic" if not recent_transactions else "actual",
            "computed_at": datetime.utcnow().isoformat() + "Z",
            "model_version": "heuristic_v1.0"
        }
        
        logger.info(f"Compliance score computed: {compliance_score:.2f}, Risk: {risk_level}")
        return result
    
    def _get_or_generate_transaction_history(self, wallet_id: UUID) -> List[Dict[str, Any]]:
        """Get or generate synthetic transaction history for demo"""
        
        if wallet_id in self.transaction_history:
            return self.transaction_history[wallet_id]
        
        # Generate synthetic transaction history
        transactions = []
        categories = ["education", "food", "shopping", "entertainment", "transport", "utilities"]
        locations = ["IN-DL", "IN-MH", "IN-KA", "IN-TN"]
        merchants = ["BookStore", "CafeShop", "TechStore", "FoodMart", "GasStation"]
        
        # Generate 20-50 synthetic transactions
        num_transactions = random.randint(20, 50)
        
        for i in range(num_transactions):
            days_ago = random.randint(0, 30)
            transaction = {
                "amount": round(random.uniform(100, 5000), 2),
                "category": random.choice(categories),
                "location": random.choice(locations),
                "merchant": random.choice(merchants),
                "timestamp": (datetime.utcnow() - timedelta(days=days_ago)).isoformat() + "Z",
                "approved": random.random() > 0.1  # 90% approval rate
            }
            transactions.append(transaction)
        
        # Sort by timestamp
        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        self.transaction_history[wallet_id] = transactions
        return transactions
    
    def _calculate_policy_adherence(self, transactions: List[Dict[str, Any]]) -> float:
        """Calculate how well transactions adhere to policies"""
        
        if not transactions:
            return 1.0
        
        # Calculate approval rate
        approved_count = sum(1 for t in transactions if t.get("approved", True))
        approval_rate = approved_count / len(transactions)
        
        # Bonus for consistent compliance
        recent_transactions = transactions[:10]
        recent_approved = sum(1 for t in recent_transactions if t.get("approved", True))
        recent_rate = recent_approved / len(recent_transactions) if recent_transactions else 1.0
        
        # Weighted score (recent history matters more)
        score = (approval_rate * 0.6) + (recent_rate * 0.4)
        
        return min(score, 1.0)
    
    def _calculate_pattern_score(self, transactions: List[Dict[str, Any]]) -> float:
        """Analyze transaction patterns for regularity"""
        
        if len(transactions) < 3:
            return 0.5  # Neutral score for insufficient data
        
        # Calculate pattern consistency
        amounts = [t["amount"] for t in transactions]
        categories = [t["category"] for t in transactions]
        
        # Amount consistency (lower variance = more consistent)
        avg_amount = sum(amounts) / len(amounts)
        variance = sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)
        std_dev = variance ** 0.5
        coefficient_of_variation = std_dev / avg_amount if avg_amount > 0 else 0
        
        # Lower CV = more consistent = higher score
        amount_score = max(0, 1.0 - (coefficient_of_variation / 2))
        
        # Category diversity (moderate diversity is good)
        unique_categories = len(set(categories))
        category_score = min(unique_categories / 5, 1.0)  # Optimal: 4-5 categories
        
        # Time pattern (regular intervals are good)
        time_score = self._analyze_time_patterns(transactions)
        
        pattern_score = (amount_score * 0.4 + category_score * 0.3 + time_score * 0.3)
        
        return min(pattern_score, 1.0)
    
    def _calculate_risk_score(self, transactions: List[Dict[str, Any]]) -> float:
        """Calculate risk score based on transaction characteristics"""
        
        if not transactions:
            return 0.0
        
        risk_factors = []
        
        # High-value transactions
        amounts = [t["amount"] for t in transactions]
        high_value_count = sum(1 for amt in amounts if amt > 10000)
        high_value_risk = (high_value_count / len(transactions)) * 0.5
        risk_factors.append(high_value_risk)
        
        # Rejection rate
        rejection_count = sum(1 for t in transactions if not t.get("approved", True))
        rejection_risk = (rejection_count / len(transactions)) * 0.8
        risk_factors.append(rejection_risk)
        
        # Rapid transactions (velocity)
        recent_24h = [t for t in transactions 
                     if (datetime.utcnow() - datetime.fromisoformat(t["timestamp"].replace("Z", ""))).days == 0]
        if len(recent_24h) > self.ANOMALY_FREQUENCY_THRESHOLD:
            velocity_risk = 0.3
            risk_factors.append(velocity_risk)
        
        # Location diversity (too many locations = suspicious)
        locations = set(t["location"] for t in transactions)
        if len(locations) > 5:
            location_risk = 0.2
            risk_factors.append(location_risk)
        
        # Calculate overall risk
        risk_score = min(sum(risk_factors), 1.0)
        
        return risk_score
    
    def _analyze_time_patterns(self, transactions: List[Dict[str, Any]]) -> float:
        """Analyze temporal patterns in transactions"""
        
        if len(transactions) < 5:
            return 0.5
        
        # Calculate time gaps between transactions
        timestamps = [datetime.fromisoformat(t["timestamp"].replace("Z", "")) 
                     for t in transactions[:20]]  # Last 20 transactions
        timestamps.sort()
        
        gaps = [(timestamps[i+1] - timestamps[i]).total_seconds() / 3600  # hours
                for i in range(len(timestamps)-1)]
        
        if not gaps:
            return 0.5
        
        # Consistent gaps are good (not too frequent, not too sparse)
        avg_gap = sum(gaps) / len(gaps)
        
        # Optimal: 1-48 hours between transactions
        if 1 <= avg_gap <= 48:
            return 0.9
        elif avg_gap < 1:
            return 0.6  # Too frequent
        elif avg_gap > 168:  # > 1 week
            return 0.7  # Too sparse
        else:
            return 0.8
    
    def _detect_anomalies(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect anomalous transactions"""
        
        if len(transactions) < 5:
            return []
        
        anomalies = []
        amounts = [t["amount"] for t in transactions]
        avg_amount = sum(amounts) / len(amounts)
        
        for transaction in transactions[:20]:  # Check recent 20
            anomaly_flags = []
            
            # Amount anomaly
            if transaction["amount"] > avg_amount * self.ANOMALY_AMOUNT_MULTIPLIER:
                anomaly_flags.append("unusually_high_amount")
            
            # Check if rejected
            if not transaction.get("approved", True):
                anomaly_flags.append("transaction_rejected")
            
            if anomaly_flags:
                anomalies.append({
                    "amount": transaction["amount"],
                    "category": transaction["category"],
                    "timestamp": transaction["timestamp"],
                    "flags": anomaly_flags,
                    "severity": "high" if len(anomaly_flags) > 1 else "medium"
                })
        
        return anomalies[:5]  # Return top 5 anomalies
    
    def _classify_risk(self, risk_score: float) -> str:
        """Classify risk level based on score"""
        
        if risk_score >= self.HIGH_RISK_THRESHOLD:
            return "high"
        elif risk_score >= self.MEDIUM_RISK_THRESHOLD:
            return "medium"
        else:
            return "low"
    
    def _generate_behavioral_insights(
        self,
        transactions: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]],
        compliance_score: float
    ) -> List[str]:
        """Generate actionable behavioral insights"""
        
        insights = []
        
        # Compliance insights
        if compliance_score >= 0.9:
            insights.append("Excellent compliance record - consistently follows policies")
        elif compliance_score >= 0.7:
            insights.append("Good compliance - minor policy violations detected")
        else:
            insights.append("Compliance needs improvement - review policy adherence")
        
        # Transaction pattern insights
        if transactions:
            categories = [t["category"] for t in transactions]
            top_category = max(set(categories), key=categories.count)
            category_pct = (categories.count(top_category) / len(categories)) * 100
            
            insights.append(f"Primary spending category: {top_category} ({category_pct:.0f}% of transactions)")
        
        # Anomaly insights
        if anomalies:
            insights.append(f"{len(anomalies)} anomalous transaction(s) detected - review recommended")
        else:
            insights.append("No anomalies detected - transaction patterns are normal")
        
        # Velocity insights
        if len(transactions) > 30:
            avg_per_week = len(transactions) / 4.3
            insights.append(f"Transaction frequency: {avg_per_week:.1f} per week")
        
        return insights


# Global service instance
compliance_ml_service = ComplianceMLService()
