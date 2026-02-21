"""
Wallet Management API Routes
Endpoints for wallet creation, retrieval, and management
"""

from fastapi import APIRouter, HTTPException, status, Path, Body
from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel

from app.models.wallet import Wallet, WalletCreate, WalletResponse
from app.services.wallet_service import wallet_service
from app.utils.logger import get_logger
from app.utils.exceptions import WalletNotFoundException


class AttachPolicyRequest(BaseModel):
    policy_id: UUID

logger = get_logger(__name__)

router = APIRouter(prefix="/wallet", tags=["Wallet Management"])


@router.post(
    "/create",
    response_model=WalletResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Wallet",
    description="Create a new programmable wallet with intent-driven governance capabilities"
)
async def create_wallet(wallet_data: WalletCreate) -> WalletResponse:
    """
    Create a new programmable wallet
    
    **Request Body:**
    - `owner_id`: User identifier (required)
    - `currency`: Currency code (default: INR)
    - `initial_balance`: Starting balance (default: 0.0)
    
    **Returns:**
    - Complete wallet object with generated wallet_id
    - Compliance score initialized to 1.0
    - Empty attached policies list
    
    **Example:**
    ```json
    {
        "owner_id": "user_123",
        "currency": "INR",
        "initial_balance": 10000.0
    }
    ```
    """
    try:
        logger.info(f"Creating wallet for owner: {wallet_data.owner_id}")
        response = await wallet_service.create_wallet(wallet_data)
        logger.info(f"Wallet created successfully: {response.wallet.wallet_id}")
        return response
    except Exception as e:
        logger.error(f"Failed to create wallet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create wallet: {str(e)}"
        )


@router.get(
    "/{wallet_id}",
    response_model=Wallet,
    status_code=status.HTTP_200_OK,
    summary="Get Wallet by ID",
    description="Retrieve wallet details including balance, policies, and compliance score"
)
async def get_wallet(
    wallet_id: UUID = Path(..., description="Unique wallet identifier")
) -> Wallet:
    """
    Retrieve wallet by wallet ID
    
    **Path Parameters:**
    - `wallet_id`: UUID of the wallet to retrieve
    
    **Returns:**
    - Complete wallet object with current state
    - Attached policies
    - Compliance score
    - Lock status
    
    **Raises:**
    - 404: Wallet not found
    """
    try:
        logger.info(f"Retrieving wallet: {wallet_id}")
        wallet = await wallet_service.get_wallet(wallet_id)
        logger.info(f"Wallet retrieved: {wallet_id}")
        return wallet
    except WalletNotFoundException as e:
        logger.warning(f"Wallet not found: {wallet_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
    except Exception as e:
        logger.error(f"Failed to retrieve wallet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve wallet: {str(e)}"
        )


@router.get(
    "/",
    response_model=List[Wallet],
    status_code=status.HTTP_200_OK,
    summary="List All Wallets",
    description="Retrieve list of all wallets, optionally filtered by owner"
)
async def list_wallets(
    owner_id: Optional[str] = None
) -> List[Wallet]:
    """
    List all wallets with optional filtering
    
    **Query Parameters:**
    - `owner_id`: Optional filter by owner (default: returns all)
    
    **Returns:**
    - List of wallet objects
    
    **Example:**
    - `/wallet/` - Returns all wallets
    - `/wallet/?owner_id=user_123` - Returns wallets for specific owner
    """
    try:
        logger.info(f"Listing wallets (owner_id: {owner_id})")
        wallets = await wallet_service.list_wallets(owner_id=owner_id)
        logger.info(f"Found {len(wallets)} wallets")
        return wallets
    except Exception as e:
        logger.error(f"Failed to list wallets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list wallets: {str(e)}"
        )


@router.get(
    "/{wallet_id}/balance",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get Wallet Balance",
    description="Retrieve current balance of a wallet"
)
async def get_wallet_balance(
    wallet_id: UUID = Path(..., description="Unique wallet identifier")
) -> dict:
    """
    Get current wallet balance
    
    **Path Parameters:**
    - `wallet_id`: UUID of the wallet
    
    **Returns:**
    - Balance information with currency
    
    **Raises:**
    - 404: Wallet not found
    """
    try:
        wallet = await wallet_service.get_wallet(wallet_id)
        return {
            "wallet_id": str(wallet.wallet_id),
            "balance": wallet.balance,
            "currency": wallet.currency,
            "is_locked": wallet.is_locked
        }
    except WalletNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )


@router.post(
    "/{wallet_id}/attach-policy",
    response_model=Wallet,
    status_code=status.HTTP_200_OK,
    summary="Attach Policy to Wallet",
    description="Attach an intent/policy to control wallet behavior"
)
async def attach_policy_to_wallet(
    wallet_id: UUID = Path(..., description="Unique wallet identifier"),
    request: AttachPolicyRequest = Body(..., description="Policy to attach")
) -> Wallet:
    """
    Attach a policy to a wallet

    **Path Parameters:**
    - `wallet_id`: UUID of the wallet

    **Request Body:**
    - `policy_id`: UUID of the policy to attach

    **Returns:**
    - Updated wallet with attached policy

    **Raises:**
    - 404: Wallet not found
    """
    try:
        wallet = await wallet_service.attach_policy(wallet_id, request.policy_id)
        return wallet
    except WalletNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
