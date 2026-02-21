"""
AI Service
Natural language intent parsing and explainable decision reasoning
"""

from typing import Dict, Any, List
import re

from app.models.response import DecisionResponse
from app.models.policy import PolicyType
from app.utils.logger import get_logger, log_execution_time

logger = get_logger(__name__)


class AIService:
    """
    AI Intent Interpretation Service
    Lightweight NLP for intent parsing and decision explanation
    """
    
    def __init__(self):
        """
        Initialize AI service with rule-based NLP patterns
        Deterministic, no heavy ML models required
        """
        self._intent_patterns = self._initialize_patterns()
        logger.info("AIService initialized with deterministic NLP patterns")
    
    def _initialize_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Initialize intent recognition patterns
        Pattern-based approach for reliability
        """
        return {
            "category_restriction": [
                {
                    "pattern": r"(only|just|restrict|limit).*(spend|use|pay).*(on|for)\s+(\w+)",
                    "example": "Only spend on education"
                },
                {
                    "pattern": r"(can|should|want).*(only|just).*(buy|purchase)\s+(\w+)",
                    "example": "I can only buy groceries"
                }
            ],
            "spending_limit": [
                {
                    "pattern": r"(spend|use).*(no more than|maximum|max|limit)\s+(\d+)",
                    "example": "Spend no more than 5000 per month"
                },
                {
                    "pattern": r"(budget|limit).*(of|is|at)\s+(\d+)",
                    "example": "My budget is 10000"
                }
            ],
            "transaction_cap": [
                {
                    "pattern": r"(single|per|each).*(transaction|payment).*(limit|max|cap)\s+(\d+)",
                    "example": "Single transaction limit of 1000"
                }
            ]
        }
    
    @log_execution_time(logger)
    async def parse_intent(self, natural_language: str) -> Dict[str, Any]:
        """
        Parse natural language into structured policy intent
        
        Args:
            natural_language: User's intent in natural language
            
        Returns:
            Structured intent with policy type and rules
        """
        natural_language = natural_language.lower().strip()
        
        # Try to match patterns
        for policy_type, patterns in self._intent_patterns.items():
            for pattern_data in patterns:
                match = re.search(pattern_data["pattern"], natural_language, re.IGNORECASE)
                if match:
                    rules = self._extract_rules(policy_type, match, natural_language)
                    
                    result = {
                        "policy_type": policy_type,
                        "rules": rules,
                        "confidence": 0.85,
                        "original_text": natural_language,
                        "interpretation": self._generate_interpretation(policy_type, rules)
                    }
                    
                    logger.info(f"Intent parsed: {policy_type} with confidence 0.85")
                    return result
        
        # Fallback if no pattern matched
        logger.warning(f"Could not parse intent: {natural_language}")
        return {
            "policy_type": "unknown",
            "rules": {},
            "confidence": 0.0,
            "original_text": natural_language,
            "interpretation": "Could not interpret intent. Please be more specific."
        }
    
    def _extract_rules(
        self, 
        policy_type: str, 
        match: re.Match, 
        text: str
    ) -> Dict[str, Any]:
        """
        Extract structured rules from pattern match
        """
        if policy_type == "category_restriction":
            # Extract categories
            categories = self._extract_categories(text)
            return {
                "allowed_categories": categories,
                "strict_mode": True
            }
        
        elif policy_type == "spending_limit":
            # Extract amount
            amount_match = re.search(r'(\d+(?:\.\d+)?)', text)
            if amount_match:
                amount = float(amount_match.group(1))
                return {
                    "max_amount": amount,
                    "period": "monthly",  # Default
                    "currency": "INR"
                }
        
        elif policy_type == "transaction_cap":
            amount_match = re.search(r'(\d+(?:\.\d+)?)', text)
            if amount_match:
                amount = float(amount_match.group(1))
                return {
                    "per_transaction_limit": amount,
                    "currency": "INR"
                }
        
        return {}
    
    def _extract_categories(self, text: str) -> List[str]:
        """
        Extract category names from text
        """
        # Common categories
        common_categories = [
            "education", "groceries", "food", "entertainment", 
            "shopping", "bills", "utilities", "transport", 
            "healthcare", "travel", "books", "courses"
        ]
        
        found_categories = []
        for category in common_categories:
            if category in text.lower():
                found_categories.append(category)
        
        return found_categories if found_categories else ["general"]
    
    def _generate_interpretation(self, policy_type: str, rules: Dict[str, Any]) -> str:
        """
        Generate human-readable interpretation of parsed intent
        Note: rules parameter should be a dict (not PolicyRules Pydantic model)
        """
        # Defensive: handle both dict and Pydantic model objects
        def safe_get(obj, key, default=None):
            if hasattr(obj, key):  # Pydantic model
                return getattr(obj, key, default)
            else:  # dict
                return obj.get(key, default) if isinstance(obj, dict) else default
        
        if policy_type == "category_restriction":
            categories = safe_get(rules, "allowed_categories", [])
            return f"Restrict spending to categories: {', '.join(categories or [])}"
        
        elif policy_type == "spending_limit":
            amount = safe_get(rules, "max_amount", 0)
            period = safe_get(rules, "period", "monthly")
            return f"Set {period} spending limit to {amount} INR"
        
        elif policy_type == "transaction_cap":
            limit = safe_get(rules, "per_transaction_limit", 0)
            return f"Limit each transaction to maximum {limit} INR"
        
        return "Policy interpretation"
    
    @log_execution_time(logger)
    async def explain_decision(
        self,
        decision: str,
        factors: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> DecisionResponse:
        """
        Generate explainable reasoning for a decision
        
        Args:
            decision: Decision outcome
            factors: Contributing factors
            context: Decision context
            
        Returns:
            DecisionResponse with reasoning
        """
        reasoning = self._build_reasoning(decision, factors, context)
        confidence = self._calculate_confidence(factors)
        alternatives = self._suggest_alternatives(decision, factors, context)
        
        return DecisionResponse(
            decision=decision,
            reasoning=reasoning,
            confidence=confidence,
            factors=factors,
            alternative_actions=alternatives
        )
    
    def _build_reasoning(
        self,
        decision: str,
        factors: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> str:
        """
        Build human-readable reasoning
        """
        if decision == "approved":
            positive_factors = [f for f in factors if f.get("value")]
            factor_names = [f["name"].replace("_", " ") for f in positive_factors]
            return (
                f"Transaction approved based on: {', '.join(factor_names)}. "
                f"All policy constraints satisfied."
            )
        else:
            negative_factors = [f for f in factors if not f.get("value")]
            factor_names = [f["name"].replace("_", " ") for f in negative_factors]
            return (
                f"Transaction blocked due to: {', '.join(factor_names)}. "
                f"Policy violations detected."
            )
    
    def _calculate_confidence(self, factors: List[Dict[str, Any]]) -> float:
        """
        Calculate decision confidence score
        """
        if not factors:
            return 0.5
        
        total_weight = sum(f.get("weight", 0) for f in factors)
        positive_weight = sum(
            f.get("weight", 0) 
            for f in factors 
            if f.get("value")
        )
        
        if total_weight == 0:
            return 0.5
        
        return positive_weight / total_weight
    
    def _suggest_alternatives(
        self,
        decision: str,
        factors: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> List[str]:
        """
        Suggest alternative actions
        """
        if decision == "approved":
            return []
        
        alternatives = []
        
        # Suggest based on violated factors
        for factor in factors:
            if not factor.get("value"):
                name = factor["name"]
                
                if "amount" in name:
                    alternatives.append("Reduce transaction amount")
                elif "category" in name:
                    alternatives.append("Change spending category")
                elif "merchant" in name:
                    alternatives.append("Use different merchant")
        
        return alternatives[:3]  # Limit to top 3


# Global service instance
ai_service = AIService()
