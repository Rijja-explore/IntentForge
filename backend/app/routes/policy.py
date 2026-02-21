"""
Policy/Intent Management API Routes
Endpoints for policy creation, attachment, and management
"""

from fastapi import APIRouter, HTTPException, status, Path
from uuid import UUID
from typing import List, Optional

from app.models.policy import Policy, PolicyCreate, PolicyResponse
from app.models.response import APIResponse
from app.services.policy_service import policy_service
from app.services.wallet_service import wallet_service
from app.utils.logger import get_logger
from app.utils.exceptions import PolicyNotFoundException, WalletNotFoundException, ValidationException

logger = get_logger(__name__)

router = APIRouter(prefix="/policy", tags=["Policy Management"])


@router.post(
    "/create",
    response_model=PolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Policy/Intent",
    description="Create a programmable money rule with validation and optional wallet attachment"
)
async def create_policy(policy_data: PolicyCreate) -> PolicyResponse:
    """
    Create a new policy/intent for programmable money governance
    
    **Request Body:**
    - `name`: Human-readable policy name (required)
    - `policy_type`: Type of constraint (required)
    - `rules`: Policy-specific rules (required)
      - `allowed_categories`: List of permitted spending categories
      - `max_amount`: Maximum spending amount
      - `per_transaction_cap`: Maximum per transaction
      - `expiry`: Policy expiration datetime
      - `geo_fence`: Allowed geographic locations
    - `description`: Optional policy description
    - `wallet_id`: Optional wallet to attach policy to
    - `priority`: Execution priority (0-1000, lower = higher priority)
    
    **Returns:**
    - Complete policy object with generated policy_id
    - Schema validation results
    - Conflict detection results
    
    **Example:**
    ```json
    {
        "name": "Education Budget",
        "policy_type": "category_restriction",
        "rules": {
            "allowed_categories": ["education", "books"],
            "max_amount": 50000.0,
            "per_transaction_cap": 5000.0,
            "expiry": "2026-12-31T23:59:59Z"
        },
        "description": "Restrict to education with caps",
        "wallet_id": "123e4567-e89b-12d3-a456-426614174000",
        "priority": 10
    }
    ```
    """
    try:
        logger.info(f"Creating policy: {policy_data.name}")
        response = await policy_service.create_policy(policy_data)
        logger.info(f"Policy created successfully: {response.policy.policy_id}")
        return response
    except ValidationException as e:
        logger.error(f"Policy validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.to_dict()
        )
    except WalletNotFoundException as e:
        logger.error(f"Wallet not found for policy attachment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
    except Exception as e:
        logger.error(f"Failed to create policy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create policy: {str(e)}"
        )


@router.get(
    "/conflicts",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Detect Policy Conflicts",
    description="""
    **Policy Conflict Detection Engine**
    
    Analyzes all active policies to detect contradictory or impossible rules.
    
    ### Conflict Types Detected:
    
    1. **Contradictory Category Restrictions**
       - Policies with non-overlapping allowed categories
       - Creates impossible conditions for transactions
    
    2. **Impossible Amount Limits**
       - Conflicting max_amount across policies
       - Per-transaction cap exceeding total limit
    
    3. **Contradictory GeoFence Restrictions**
       - Policies with non-overlapping geographic regions
       - No location can satisfy all policies
    
    4. **Merchant Whitelist vs Blacklist**
       - Merchant appears in both whitelist and blacklist
       - Impossible state for merchant transactions
    
    5. **Time and Expiry Conflicts**
       - Policies with conflicting expiry windows
       - Cascade effects from policy expiration
    
    ### Severity Levels:
    - **CRITICAL**: Impossible conditions, no transaction can pass
    - **HIGH**: Contradictory rules causing unpredictable behavior
    - **MEDIUM**: Potentially conflicting rules
    - **LOW**: Warnings about policy configuration
    
    ### Response Includes:
    - Total conflict count
    - Detailed conflict descriptions
    - Policy IDs and names involved
    - Severity assessment
    - Critical conflict flag
    """
)
async def detect_policy_conflicts() -> APIResponse[dict]:
    """
    Detect conflicts across all active policies
    
    Returns:
        APIResponse with conflict analysis
    """
    try:
        logger.info("Detecting policy conflicts across all active policies")
        
        conflict_analysis = await policy_service.detect_all_conflicts()
        
        logger.info(
            f"Conflict detection complete: {conflict_analysis['total_conflicts']} conflicts found"
        )
        
        return APIResponse(
            success=True,
            message=f"Found {conflict_analysis['total_conflicts']} policy conflict(s)",
            data=conflict_analysis
        )
        
    except Exception as e:
        logger.error(f"Conflict detection failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conflict detection failed: {str(e)}"
        )


@router.get(
    "/{policy_id}",
    response_model=Policy,
    status_code=status.HTTP_200_OK,
    summary="Get Policy by ID",
    description="Retrieve policy details including rules, attached wallets, and expiry"
)
async def get_policy(
    policy_id: UUID = Path(..., description="Unique policy identifier")
) -> Policy:
    """
    Retrieve policy by policy ID
    
    **Path Parameters:**
    - `policy_id`: UUID of the policy to retrieve
    
    **Returns:**
    - Complete policy object with rules and metadata
    
    **Raises:**
    - 404: Policy not found
    """
    try:
        logger.info(f"Retrieving policy: {policy_id}")
        policy = await policy_service.get_policy(policy_id)
        logger.info(f"Policy retrieved: {policy_id}")
        return policy
    except PolicyNotFoundException as e:
        logger.warning(f"Policy not found: {policy_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
    except Exception as e:
        logger.error(f"Failed to retrieve policy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve policy: {str(e)}"
        )


@router.get(
    "/",
    response_model=List[Policy],
    status_code=status.HTTP_200_OK,
    summary="List All Policies",
    description="Retrieve list of all policies with optional filtering"
)
async def list_policies(
    active_only: bool = True,
    policy_type: Optional[str] = None
) -> List[Policy]:
    """
    List all policies with optional filtering
    
    **Query Parameters:**
    - `active_only`: Filter for active policies only (default: True)
    - `policy_type`: Optional filter by policy type
    
    **Returns:**
    - List of policy objects
    
    **Example:**
    - `/policy/` - Returns all active policies
    - `/policy/?active_only=false` - Returns all policies including inactive
    - `/policy/?policy_type=category_restriction` - Returns specific type
    """
    try:
        logger.info(f"Listing policies (active_only: {active_only}, type: {policy_type})")
        policies = await policy_service.list_policies(active_only=active_only)
        
        # Filter by type if specified
        if policy_type:
            policies = [p for p in policies if p.policy_type.value == policy_type]
        
        logger.info(f"Found {len(policies)} policies")
        return policies
    except Exception as e:
        logger.error(f"Failed to list policies: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list policies: {str(e)}"
        )


@router.post(
    "/{policy_id}/attach/{wallet_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Attach Policy to Wallet",
    description="Attach an existing policy to a wallet for enforcement"
)
async def attach_policy_to_wallet(
    policy_id: UUID = Path(..., description="Policy identifier"),
    wallet_id: UUID = Path(..., description="Wallet identifier")
) -> dict:
    """
    Attach a policy to a wallet
    
    **Path Parameters:**
    - `policy_id`: UUID of the policy
    - `wallet_id`: UUID of the wallet
    
    **Returns:**
    - Success confirmation with updated wallet and policy info
    
    **Raises:**
    - 404: Policy or wallet not found
    """
    try:
        # Get policy and wallet
        policy = await policy_service.get_policy(policy_id)
        wallet = await wallet_service.get_wallet(wallet_id)
        
        # Attach policy to wallet
        await wallet_service.attach_policy(wallet_id, policy_id)
        
        # Update policy's attached wallets list
        if wallet_id not in policy.attached_wallets:
            policy.attached_wallets.append(wallet_id)
        
        logger.info(f"Policy {policy_id} attached to wallet {wallet_id}")
        
        return {
            "success": True,
            "message": "Policy attached to wallet successfully",
            "policy_id": str(policy_id),
            "wallet_id": str(wallet_id),
            "policy_name": policy.name,
            "wallet_owner": wallet.owner_id
        }
    except (PolicyNotFoundException, WalletNotFoundException) as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
    except Exception as e:
        logger.error(f"Failed to attach policy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to attach policy: {str(e)}"
        )


@router.get(
    "/wallet/{wallet_id}/policies",
    response_model=List[Policy],
    status_code=status.HTTP_200_OK,
    summary="Get Wallet Policies",
    description="Retrieve all policies attached to a specific wallet"
)
async def get_wallet_policies(
    wallet_id: UUID = Path(..., description="Wallet identifier")
) -> List[Policy]:
    """
    Get all policies attached to a wallet
    
    **Path Parameters:**
    - `wallet_id`: UUID of the wallet
    
    **Returns:**
    - List of policies attached to the wallet
    
    **Raises:**
    - 404: Wallet not found
    """
    try:
        # Verify wallet exists
        wallet = await wallet_service.get_wallet(wallet_id)
        
        # Get all policies for this wallet
        all_policies = await policy_service.list_policies(active_only=True)
        wallet_policies = [p for p in all_policies if wallet_id in p.attached_wallets]
        
        logger.info(f"Found {len(wallet_policies)} policies for wallet {wallet_id}")
        return wallet_policies
    except WalletNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
    except Exception as e:
        logger.error(f"Failed to get wallet policies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get wallet policies: {str(e)}"
        )


@router.post(
    "/{policy_id}/validate",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Validate Policy Schema",
    description="Validate policy schema consistency without creating"
)
async def validate_policy_schema(
    policy_id: UUID = Path(..., description="Policy identifier")
) -> dict:
    """
    Validate policy schema consistency
    
    **Path Parameters:**
    - `policy_id`: UUID of the policy to validate
    
    **Returns:**
    - Validation results with any errors or warnings
    """
    try:
        policy = await policy_service.get_policy(policy_id)
        errors = policy.validate_schema()
        
        return {
            "valid": len(errors) == 0,
            "policy_id": str(policy_id),
            "policy_name": policy.name,
            "errors": errors,
            "is_expired": policy.is_expired()
        }
    except PolicyNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e.message)
        )
    except Exception as e:
        logger.error(f"Policy validation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Policy validation failed: {str(e)}"
        )


# Conflicts endpoint moved earlier in file to prevent route matching conflicts with /{policy_id}
