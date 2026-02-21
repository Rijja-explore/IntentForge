"""
Clawback Service
Automated transaction reversal and recovery mechanisms
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
import time

from app.models.clawback import (
    ClawbackRequest,
    ClawbackResult,
    ClawbackRecord,
    ClawbackStatus,
    ClawbackReason
)
from app.models.transaction import Transaction
from app.utils.logger import get_logger, log_execution_time
from app.utils.exceptions import ValidationException

logger = get_logger(__name__)


class ClawbackService:
    """
    Clawback Management Service
    Handles automated transaction reversal and balance restoration
    """
    
    def __init__(self):
        """Initialize clawback service with in-memory storage"""
        self.clawbacks: dict[UUID, ClawbackRecord] = {}
        self.transactions: dict[UUID, Transaction] = {}  # Mock transaction storage
        logger.info("ClawbackService initialized")
    
    @log_execution_time(logger)
    async def execute_clawback(
        self,
        clawback_request: ClawbackRequest
    ) -> ClawbackResult:
        """
        Execute clawback - reverse transaction and restore wallet balance
        
        This is a deterministic operation:
        - Validates clawback conditions
        - Reverses transaction amount
        - Updates wallet balance
        - Records clawback for audit
        
        Args:
            clawback_request: Clawback execution request
            
        Returns:
            ClawbackResult with execution status and details
        """
        start_time = time.perf_counter()
        
        # Import wallet service
        from app.services.wallet_service import wallet_service
        
        # 1. Verify wallet exists
        wallet = await wallet_service.get_wallet(clawback_request.wallet_id)
        
        # 2. Check if transaction exists (in real system, would fetch from DB)
        transaction = self.transactions.get(clawback_request.transaction_id)
        if not transaction and not clawback_request.force:
            raise ValidationException(
                f"Transaction {clawback_request.transaction_id} not found",
                details={"transaction_id": str(clawback_request.transaction_id)}
            )
        
        # For demonstration, create a mock transaction if not found
        if not transaction:
            # Assume some default transaction details
            amount_to_reverse = 5000.0  # Mock amount
            violations = ["Transaction not found in system"]
        else:
            amount_to_reverse = transaction.amount
            violations = []
        
        # 3. Record previous balance
        previous_balance = wallet.balance
        
        # 4. Execute reversal - restore funds to wallet (credit operation)
        
        try:
            # Update wallet balance - credit the reversed amount
            await wallet_service.update_balance(
                wallet_id=clawback_request.wallet_id,
                amount=amount_to_reverse,
                operation="credit"
            )
            
            # Get updated wallet to confirm new balance
            updated_wallet = await wallet_service.get_wallet(clawback_request.wallet_id)
            new_balance = updated_wallet.balance
            
            status = ClawbackStatus.EXECUTED
            explanation = self._generate_clawback_explanation(
                reason=clawback_request.reason,
                amount=amount_to_reverse,
                status=status
            )
            
        except Exception as e:
            logger.error(f"Clawback execution failed: {str(e)}")
            status = ClawbackStatus.FAILED
            explanation = f"Clawback failed: {str(e)}"
            new_balance = previous_balance  # Rollback
        
        # 5. Record clawback
        clawback_record = ClawbackRecord(
            transaction_id=clawback_request.transaction_id,
            wallet_id=clawback_request.wallet_id,
            amount=amount_to_reverse,
            reason=clawback_request.reason,
            status=status,
            explanation=explanation
        )
        self.clawbacks[clawback_record.clawback_id] = clawback_record
        
        processing_time = (time.perf_counter() - start_time) * 1000
        
        # 6. Return result
        result = ClawbackResult(
            clawback_id=clawback_record.clawback_id,
            transaction_id=clawback_request.transaction_id,
            wallet_id=clawback_request.wallet_id,
            status=status,
            reason=clawback_request.reason,
            amount_reversed=amount_to_reverse,
            previous_balance=previous_balance,
            new_balance=new_balance,
            processing_time_ms=processing_time,
            explanation=explanation,
            violations=violations
        )
        
        logger.info(
            f"Clawback {result.clawback_id} executed: "
            f"Reversed {amount_to_reverse} INR, Status: {status.value}"
        )
        
        return result
    
    def _generate_clawback_explanation(
        self,
        reason: ClawbackReason,
        amount: float,
        status: ClawbackStatus
    ) -> str:
        """Generate human-readable clawback explanation"""
        
        reason_explanations = {
            ClawbackReason.POLICY_VIOLATION: (
                "Transaction violated wallet policy rules after execution. "
                "Automated clawback initiated to enforce compliance."
            ),
            ClawbackReason.EXPIRED_POLICY: (
                "Transaction executed under an expired policy. "
                "Funds reversed to maintain policy integrity."
            ),
            ClawbackReason.FRAUD_DETECTION: (
                "Fraudulent activity detected. "
                "Transaction reversed for security."
            ),
            ClawbackReason.COMPLIANCE_BREACH: (
                "Regulatory compliance violation detected. "
                "Mandatory reversal executed."
            ),
            ClawbackReason.MANUAL_REVERSAL: (
                "Manual reversal requested by administrator."
            )
        }
        
        base_explanation = reason_explanations.get(
            reason,
            "Transaction reversed due to system policy."
        )
        
        if status == ClawbackStatus.EXECUTED:
            return (
                f"✅ CLAWBACK EXECUTED: {base_explanation} "
                f"Amount {amount} INR restored to wallet. "
                f"Balance updated successfully."
            )
        elif status == ClawbackStatus.FAILED:
            return (
                f"❌ CLAWBACK FAILED: Unable to reverse transaction. "
                f"Manual intervention required."
            )
        else:
            return f"⏳ CLAWBACK PENDING: {base_explanation}"
    
    @log_execution_time(logger)
    async def get_clawback_history(
        self,
        wallet_id: Optional[UUID] = None,
        transaction_id: Optional[UUID] = None
    ) -> List[ClawbackRecord]:
        """
        Retrieve clawback history
        
        Args:
            wallet_id: Filter by wallet
            transaction_id: Filter by transaction
            
        Returns:
            List of clawback records
        """
        records = list(self.clawbacks.values())
        
        if wallet_id:
            records = [r for r in records if r.wallet_id == wallet_id]
        
        if transaction_id:
            records = [r for r in records if r.transaction_id == transaction_id]
        
        return records
    
    def register_transaction(self, transaction: Transaction):
        """Register transaction for potential clawback (mock implementation)"""
        self.transactions[transaction.transaction_id] = transaction


# Global service instance
clawback_service = ClawbackService()
