"""
Validation Service
Real-time transaction validation and policy enforcement
"""

from typing import List, Optional
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
from app.services.explanation_generator_service import explanation_generator
from app.services.blockchain_audit_service import blockchain_audit_service

logger = get_logger(__name__)


class ValidationService:
    """
    Transaction Validation Service
    Deterministic rule-based validation engine with AI explanations
    """
    
    def __init__(self):
        """
        Initialize validation service
        """
        self.explanation_generator = explanation_generator
        # In-memory transaction log (keyed by transaction_id)
        self.transaction_history: dict = {}
        logger.info("ValidationService initialized with AI explanations")
    
    @log_execution_time(logger)
    async def validate_transaction(
        self, 
        transaction: Transaction, 
        policies: List[Policy]
    ) -> ValidationResult:
        """
        Validate transaction against active policies with AI-generated explanations
        
        Args:
            transaction: Transaction to validate
            policies: List of applicable policies
            
        Returns:
            ValidationResult with decision, reasoning, and AI explanation
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
        
        # Generate basic reasoning
        basic_reasoning = self._generate_reasoning(
            transaction, 
            status, 
            violations, 
            len(policies_evaluated)
        )
        
        # Generate AI explanation
        transaction_dict = {
            "amount": transaction.amount,
            "category": transaction.category,
            "merchant": transaction.merchant,
            "location": transaction.location
        }
        
        ai_explanation = self.explanation_generator.generate_explanation(
            validation_result=ValidationResult(
                transaction_id=transaction.transaction_id,
                status=status,
                decision=status.value,
                violations=violations,
                policies_evaluated=policies_evaluated,
                reasoning=basic_reasoning,
                confidence_score=0.95,
                processing_time_ms=0.0,
                requires_clawback=False
            ),
            transaction=transaction_dict,
            evaluated_policies=sorted_policies
        )
        
        # Combine basic reasoning with AI explanation
        full_reasoning = f"{basic_reasoning}\n\n--- AI Detailed Explanation ---\n{ai_explanation}"
        
        # Calculate confidence (simplified heuristic)
        confidence = 0.98 if not violations else 0.95
        
        processing_time = (time.perf_counter() - start_time) * 1000
        
        result = ValidationResult(
            transaction_id=transaction.transaction_id,
            status=status,
            decision=status.value,
            violations=violations,
            policies_evaluated=policies_evaluated,
            reasoning=full_reasoning,
            confidence_score=confidence,
            processing_time_ms=processing_time,
            requires_clawback=False
        )
        
        logger.info(
            f"Transaction {transaction.transaction_id} validated: "
            f"{status.value} in {processing_time:.2f}ms with AI explanation"
        )
        
        # Log to blockchain
        if violations and status == TransactionStatus.BLOCKED:
            try:
                await blockchain_audit_service.log_transaction_violation(
                    transaction_id=str(transaction.transaction_id),
                    wallet_id=transaction.wallet_id,
                    violation_details={
                        "violation_type": "POLICY_VIOLATION",
                        "policy_id": policies_evaluated[0] if policies_evaluated else None,
                        "amount": transaction.amount,
                        "violations": violations
                    }
                )
                logger.info(f"Transaction violation logged to blockchain: {transaction.transaction_id}")
            except Exception as e:
                logger.warning(f"Failed to log violation to blockchain: {e}")
        elif status == TransactionStatus.APPROVED:
            try:
                await blockchain_audit_service.log_transaction_approved(
                    transaction_id=str(transaction.transaction_id),
                    wallet_id=transaction.wallet_id,
                    transaction_details={
                        "amount": transaction.amount,
                        "category": transaction.category,
                        "merchant": transaction.merchant,
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to log approved transaction to blockchain: {e}")
        
        # Persist for history/lookup
        self.transaction_history[transaction.transaction_id] = {
            "transaction": transaction,
            "result": result,
        }

        return result

    async def get_transaction(self, tx_id: UUID) -> Optional[dict]:
        """Return stored validation result by transaction_id"""
        return self.transaction_history.get(tx_id)

    async def get_wallet_history(self, wallet_id: UUID) -> list:
        """Return all validation results for a given wallet_id"""
        return [
            entry for entry in self.transaction_history.values()
            if entry["transaction"].wallet_id == wallet_id
        ]
    
    async def _evaluate_policy(
        self, 
        transaction: Transaction, 
        policy: Policy
    ) -> Optional[str]:
        """
        Evaluate a single policy against transaction with deterministic rules
        
        This method implements a comprehensive rule engine that checks:
        - Category restrictions
        - Amount limits (max_amount)
        - Per-transaction caps
        - Expiry validation
        - GeoFence validation
        - Merchant whitelist/blacklist
        
        Args:
            transaction: Transaction to evaluate
            policy: Policy to check
            
        Returns:
            Violation description if violated, None otherwise
        """
        rules = policy.rules
        
        # 1. EXPIRY VALIDATION (checked first for all policy types)
        if policy.is_expired():
            # Expired policies are automatically treated as inactive
            logger.debug(f"Policy {policy.policy_id} is expired, skipping evaluation")
            return None
        
        # 2. CATEGORY MATCH VALIDATION
        if rules.allowed_categories:
            if transaction.category not in rules.allowed_categories:
                return (
                    f"Policy '{policy.name}': Category '{transaction.category}' "
                    f"not in allowed list {rules.allowed_categories}"
                )
        
        # 3. AMOUNT LIMITS VALIDATION (max_amount - cumulative spending limit)
        if rules.max_amount is not None:
            if transaction.amount > rules.max_amount:
                return (
                    f"Policy '{policy.name}': Amount {transaction.amount} "
                    f"exceeds maximum limit {rules.max_amount}"
                )
        
        # 4. PER-TRANSACTION CAP VALIDATION
        if rules.per_transaction_cap is not None:
            if transaction.amount > rules.per_transaction_cap:
                return (
                    f"Policy '{policy.name}': Transaction amount {transaction.amount} "
                    f"exceeds per-transaction cap {rules.per_transaction_cap}"
                )
        
        # 5. GEOFENCE VALIDATION
        if rules.geo_fence:
            if not transaction.location:
                return (
                    f"Policy '{policy.name}': Transaction location required but not provided. "
                    f"Allowed regions: {rules.geo_fence}"
                )
            if transaction.location not in rules.geo_fence:
                return (
                    f"Policy '{policy.name}': Location '{transaction.location}' "
                    f"not in allowed geo-fence {rules.geo_fence}"
                )
        
        # 6. MERCHANT WHITELIST VALIDATION
        if rules.merchant_whitelist:
            if not transaction.merchant:
                return (
                    f"Policy '{policy.name}': Merchant information required. "
                    f"Allowed merchants: {rules.merchant_whitelist}"
                )
            if transaction.merchant not in rules.merchant_whitelist:
                return (
                    f"Policy '{policy.name}': Merchant '{transaction.merchant}' "
                    f"not in whitelist {rules.merchant_whitelist}"
                )
        
        # 7. MERCHANT BLACKLIST VALIDATION
        if rules.merchant_blacklist:
            if transaction.merchant and transaction.merchant in rules.merchant_blacklist:
                return (
                    f"Policy '{policy.name}': Merchant '{transaction.merchant}' "
                    f"is blacklisted"
                )
        
        # All checks passed
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
            location_info = f" at location {transaction.location}" if transaction.location else ""
            merchant_info = f" with merchant '{transaction.merchant}'" if transaction.merchant else ""
            
            return (
                f"[APPROVED] APPROVED: Transaction of {transaction.amount} INR "
                f"for category '{transaction.category}'{merchant_info}{location_info} "
                f"complies with all {policies_count} active policy/policies. "
                f"All validation checks passed: category match, amount limits, "
                f"per-transaction caps, expiry, and geo-fence validations."
            )
        else:
            violations_text = " | ".join(violations)
            return (
                f"[BLOCKED] BLOCKED: Transaction rejected after evaluating {policies_count} policy/policies. "
                f"Violation(s) detected: {violations_text}"
            )


# Global service instance
validation_service = ValidationService()
