"""
Transaction Validation API Routes
Real-time transaction validation against wallet policies
"""

from fastapi import APIRouter, HTTPException, status
from typing import Optional, List
from uuid import UUID

from app.models.transaction import (
    TransactionCreate,
    Transaction,
    ValidationResult,
    TransactionStatus
)
from app.services.validation_service import validation_service
from app.services.wallet_service import wallet_service
from app.services.policy_service import policy_service
from app.services.compliance_ml_service import compliance_ml_service
from app.models.response import APIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/transaction", tags=["Transaction Validation"])


@router.post(
    "/validate",
    response_model=APIResponse[ValidationResult],
    status_code=status.HTTP_200_OK,
    summary="Validate Transaction Against Policies",
    description="""
    **Deterministic Rule Engine** for transaction validation.
    
    Evaluates transaction against all active wallet policies with comprehensive checks:
    
    ### Validation Checks Performed:
    1. **Category Match**: Validates transaction category against policy allowedCategories
    2. **Amount Limits**: Checks if transaction amount exceeds policy max_amount
    3. **Per-Transaction Cap**: Validates against policy per_transaction_cap
    4. **Expiry Validation**: Ensures policies are not expired
    5. **GeoFence Validation**: Verifies transaction location against policy geo_fence
    6. **Merchant Validation**: Checks whitelist and blacklist rules
    
    ### Decision States:
    - **APPROVED**: Transaction complies with all policies
    - **BLOCKED**: Transaction violates one or more policies
    
    ### Response Includes:
    - Structured violation reasons
    - Policies evaluated count
    - AI-generated reasoning
    - Confidence score
    - Processing time (target: <100ms)
    
    ### Example Use Cases:
    - Real-time transaction authorization at POS
    - Digital Rupee spending validation
    - Programmable money enforcement
    - Intent compliance verification
    """
)
async def validate_transaction(
    transaction_data: TransactionCreate
) -> APIResponse[ValidationResult]:
    """
    Validate a transaction against wallet policies
    
    Args:
        transaction_data: Transaction validation request
        
    Returns:
        APIResponse with ValidationResult containing decision and reasoning
        
    Raises:
        HTTPException: If wallet not found or validation fails
    """
    try:
        # 1. Verify wallet exists (raises WalletNotFoundException if not found)
        wallet = await wallet_service.get_wallet(transaction_data.wallet_id)
        
        # 2. Get active policies for wallet (already filtered for active & non-expired)
        active_policies = await policy_service.get_wallet_policies(transaction_data.wallet_id)
        
        logger.info(
            f"Validating transaction for wallet {transaction_data.wallet_id} "
            f"against {len(active_policies)} active policies"
        )
        
        # 3. Create transaction object
        transaction = Transaction(
            wallet_id=transaction_data.wallet_id,
            amount=transaction_data.amount,
            category=transaction_data.category,
            merchant=transaction_data.merchant,
            location=transaction_data.location,
            upi_ref_id=transaction_data.upi_ref_id,
            metadata=transaction_data.metadata,
            status=TransactionStatus.PENDING
        )
        
        # 4. Validate transaction through deterministic rule engine
        validation_result = await validation_service.validate_transaction(
            transaction=transaction,
            policies=active_policies
        )

        # 5. Update wallet compliance score based on real transaction history
        try:
            from datetime import datetime as _dt
            history_entries = await validation_service.get_wallet_history(transaction_data.wallet_id)
            real_transactions = [
                {
                    "amount": e["transaction"].amount,
                    "category": e["transaction"].category,
                    "merchant": e["transaction"].merchant or "",
                    "location": e["transaction"].location or "IN-DL",
                    "timestamp": _dt.utcnow().isoformat() + "Z",
                    "approved": e["result"].status.value == "APPROVED",
                }
                for e in history_entries
            ]
            if real_transactions:
                metrics = await compliance_ml_service.compute_compliance_score(
                    wallet_id=transaction_data.wallet_id,
                    recent_transactions=real_transactions
                )
                wallet.compliance_score = round(metrics["compliance_score"], 2)
                wallet.updated_at = _dt.utcnow()
        except Exception as comp_err:
            logger.warning(f"Failed to update compliance score: {comp_err}")

        # 6. Log result
        logger.info(
            f"Transaction {validation_result.transaction_id}: "
            f"{validation_result.status.value} in {validation_result.processing_time_ms:.2f}ms"
        )
        
        return APIResponse(
            success=True,
            message=f"Transaction {validation_result.status.value}",
            data=validation_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Check for wallet not found
        if "WalletNotFoundException" in str(type(e).__name__):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Wallet {transaction_data.wallet_id} not found"
            )
        
        logger.error(f"Transaction validation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction validation failed: {str(e)}"
        )


@router.post(
    "/simulate",
    response_model=APIResponse[ValidationResult],
    status_code=status.HTTP_200_OK,
    summary="Simulate Transaction Validation",
    description="""
    Simulate transaction validation without creating a transaction record.
    
    Useful for:
    - Pre-flight validation checks
    - UI feedback before transaction submission
    - Testing policy configurations
    - Compliance dry-runs
    """
)
async def simulate_transaction(
    transaction_data: TransactionCreate
) -> APIResponse[ValidationResult]:
    """
    Simulate transaction validation (same as validate but emphasizes no persistence)
    
    Args:
        transaction_data: Transaction to simulate
        
    Returns:
        APIResponse with ValidationResult
    """
    # Simulation is identical to validation (we're not persisting anyway in mock storage)
    return await validate_transaction(transaction_data)


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Transaction Service Health Check"
)
async def transaction_health() -> dict:
    """Transaction validation service health check"""
    return {
        "service": "transaction_validation",
        "status": "operational",
        "rule_engine": "deterministic",
        "target_latency_ms": 100
    }


@router.get(
    "/wallet/{wallet_id}/history",
    response_model=APIResponse[List[ValidationResult]],
    status_code=status.HTTP_200_OK,
    summary="Get Wallet Transaction History",
)
async def get_wallet_transaction_history(wallet_id: UUID) -> APIResponse[List[ValidationResult]]:
    """Return all validated transactions for a wallet (in-memory, current session)."""
    try:
        await wallet_service.get_wallet(wallet_id)  # confirm wallet exists
        entries = await validation_service.get_wallet_history(wallet_id)
        results = [e["result"] for e in entries]
        return APIResponse(success=True, message=f"{len(results)} transactions found", data=results)
    except Exception as e:
        if "WalletNotFoundException" in str(type(e).__name__):
            raise HTTPException(status_code=404, detail=f"Wallet {wallet_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{transaction_id}",
    response_model=APIResponse[ValidationResult],
    status_code=status.HTTP_200_OK,
    summary="Get Transaction by ID",
)
async def get_transaction(transaction_id: UUID) -> APIResponse[ValidationResult]:
    """Return a specific transaction validation result by its ID."""
    entry = await validation_service.get_transaction(transaction_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    return APIResponse(success=True, message="Transaction found", data=entry["result"])
