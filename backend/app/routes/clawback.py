"""
Clawback API Routes
Automated transaction reversal and recovery endpoints
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from uuid import UUID

from app.models.clawback import (
    ClawbackRequest,
    ClawbackResult,
    ClawbackRecord
)
from app.services.clawback_service import clawback_service
from app.models.response import APIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/clawback", tags=["Clawback & Recovery"])


@router.post(
    "/execute",
    response_model=APIResponse[ClawbackResult],
    status_code=status.HTTP_200_OK,
    summary="Execute Transaction Clawback",
    description="""
    **Automated Transaction Reversal Engine**
    
    Executes deterministic clawback to reverse transactions and restore wallet balance.
    
    ### Use Cases:
    - **Policy Violation**: Transaction violated rules post-execution
    - **Expired Policy**: Transaction executed under expired policy
    - **Fraud Detection**: Suspicious activity detected
    - **Compliance Breach**: Regulatory violation
    - **Manual Reversal**: Administrator-initiated reversal
    
    ### Clawback Process:
    1. Validates clawback conditions
    2. Reverses transaction amount
    3. Restores wallet balance
    4. Records clawback for audit trail
    5. Emits clawback status
    
    ### Deterministic Behavior:
    - Atomic operation (all-or-nothing)
    - Balance restoration guaranteed
    - Audit trail maintained
    - Idempotent (safe to retry)
    
    ### Response Includes:
    - Execution status (EXECUTED/FAILED)
    - Amount reversed
    - Previous and new balance
    - Processing time
    - Detailed explanation
    """
)
async def execute_clawback(
    clawback_request: ClawbackRequest
) -> APIResponse[ClawbackResult]:
    """
    Execute clawback - reverse transaction and restore balance
    
    Args:
        clawback_request: Clawback execution request
        
    Returns:
        APIResponse with ClawbackResult
        
    Raises:
        HTTPException: If wallet not found or execution fails
    """
    try:
        logger.info(
            f"Executing clawback for transaction {clawback_request.transaction_id} "
            f"on wallet {clawback_request.wallet_id}"
        )
        
        result = await clawback_service.execute_clawback(clawback_request)
        
        logger.info(
            f"Clawback {result.clawback_id} completed: "
            f"Status={result.status.value}, Amount={result.amount_reversed}"
        )
        
        return APIResponse(
            success=result.status.value == "EXECUTED",
            message=f"Clawback {result.status.value}",
            data=result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Clawback execution failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clawback execution failed: {str(e)}"
        )


@router.get(
    "/history",
    response_model=APIResponse[List[ClawbackRecord]],
    status_code=status.HTTP_200_OK,
    summary="Get Clawback History",
    description="""
    Retrieve clawback execution history with optional filters.
    
    - Filter by wallet_id to see all clawbacks for a wallet
    - Filter by transaction_id to see clawbacks for specific transaction
    - No filters returns all clawbacks (audit trail)
    """
)
async def get_clawback_history(
    wallet_id: Optional[UUID] = None,
    transaction_id: Optional[UUID] = None
) -> APIResponse[List[ClawbackRecord]]:
    """
    Get clawback history with optional filters
    
    Args:
        wallet_id: Filter by wallet
        transaction_id: Filter by transaction
        
    Returns:
        APIResponse with list of ClawbackRecords
    """
    try:
        records = await clawback_service.get_clawback_history(
            wallet_id=wallet_id,
            transaction_id=transaction_id
        )
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(records)} clawback record(s)",
            data=records
        )
        
    except Exception as e:
        logger.error(f"Failed to retrieve clawback history: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve clawback history: {str(e)}"
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Clawback Service Health Check"
)
async def clawback_health() -> dict:
    """Clawback service health check"""
    return {
        "service": "clawback_engine",
        "status": "operational",
        "behavior": "deterministic",
        "features": [
            "automated_reversal",
            "balance_restoration",
            "audit_trail"
        ]
    }
