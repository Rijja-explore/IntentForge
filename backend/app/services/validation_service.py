"""
Validation Service
Real-time transaction validation and policy enforcement
"""

from typing import List
from uuid import UUID
import time

from app.models.transaction import (
    Transaction, 
    TransactionCreate, 
    TransactionStatus,
    ValidationResult
)
from app.models.policy import Policy
from app.utils.logger import get_logger, log_execution_time
from app.utils.exceptions import ValidationException

logger = get_logger(__name__)


class ValidationService:
    """
    Transaction Validation Service
    Deterministic rule-based validation engine
    """
    
    def __init__(self):
        """
        Initialize validation service
        """
        logger.info("ValidationService initialized")
    
    @log_execution_time(logger)
    async def validate_transaction(
        self, 
        transaction: Transaction, 
        policies: List[Policy]
    ) -> ValidationResult:
        """
        Validate transaction against active policies
        
        Args:
            transaction: Transaction to validate
            policies: List of applicable policies
            
        Returns:
            ValidationResult with decision and reasoning
        """
        start_time = time.perf_counter()
        
        violations = []
        policies_evaluated = []
        status = TransactionStatus.APPROVED
        
        # Sort policies by priority (lower number = higher priority)
        sorted_policies = sorted(policies, key=lambda p: p.priority)
        
        for policy in sorted_policies:
            if not policy.is_active or policy.is_expired():
                continue
            
            policies_evaluated.append(policy.policy_id)
            
            # Evaluate policy rules
            violation = await self._evaluate_policy(transaction, policy)
            
            if violation:
                violations.append(violation)
                status = TransactionStatus.BLOCKED
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            transaction, 
            status, 
            violations, 
            len(policies_evaluated)
        )
        
        # Calculate confidence (simplified heuristic)
        confidence = 0.98 if not violations else 0.95
        
        processing_time = (time.perf_counter() - start_time) * 1000
        
        result = ValidationResult(
            transaction_id=transaction.transaction_id,
            status=status,
            decision=status.value,
            violations=violations,
            policies_evaluated=policies_evaluated,
            reasoning=reasoning,
            confidence_score=confidence,
            processing_time_ms=processing_time,
            requires_clawback=False
        )
        
        logger.info(
            f"Transaction {transaction.transaction_id} validated: "
            f"{status.value} in {processing_time:.2f}ms"
        )
        
        return result
    
    async def _evaluate_policy(
        self, 
        transaction: Transaction, 
        policy: Policy
    ) -> Optional[str]:
        """
        Evaluate a single policy against transaction
        
        Args:
            transaction: Transaction to evaluate
            policy: Policy to check
            
        Returns:
            Violation description if violated, None otherwise
        """
        rules = policy.rules
        
        # Category Restriction
        if policy.policy_type.value == "category_restriction":
            allowed_categories = rules.get("allowed_categories", [])
            if transaction.category not in allowed_categories:
                return f"Category '{transaction.category}' not in allowed list: {allowed_categories}"
        
        # Spending Limit
        elif policy.policy_type.value == "spending_limit":
            max_amount = rules.get("max_amount", float('inf'))
            if transaction.amount > max_amount:
                return f"Amount {transaction.amount} exceeds limit {max_amount}"
        
        # Transaction Cap
        elif policy.policy_type.value == "transaction_cap":
            per_transaction_limit = rules.get("per_transaction_limit", float('inf'))
            if transaction.amount > per_transaction_limit:
                return f"Transaction amount {transaction.amount} exceeds cap {per_transaction_limit}"
        
        # Add more policy type evaluations as needed
        
        return None
    
    def _generate_reasoning(
        self,
        transaction: Transaction,
        status: TransactionStatus,
        violations: List[str],
        policies_count: int
    ) -> str:
        """
        Generate human-readable reasoning for decision
        
        Args:
            transaction: Transaction evaluated
            status: Decision status
            violations: List of violations
            policies_count: Number of policies evaluated
            
        Returns:
            Reasoning string
        """
        if status == TransactionStatus.APPROVED:
            return (
                f"Transaction approved. Amount {transaction.amount} {transaction.currency} "
                f"for category '{transaction.category}' complies with all {policies_count} "
                f"active policies. No violations detected."
            )
        else:
            violations_text = "; ".join(violations)
            return (
                f"Transaction blocked. Evaluated {policies_count} policies. "
                f"Violations: {violations_text}"
            )


# Global service instance
validation_service = ValidationService()
