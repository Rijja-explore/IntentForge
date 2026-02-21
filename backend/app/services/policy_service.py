"""
Policy Service
Business logic for policy/intent management
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.policy import Policy, PolicyCreate, PolicyResponse
from app.utils.logger import get_logger, log_execution_time
from app.utils.exceptions import PolicyNotFoundException

logger = get_logger(__name__)


class PolicyService:
    """
    Policy/Intent Management Service
    Handles policy creation, validation, and conflict detection
    """
    
    def __init__(self):
        """
        Initialize policy service with in-memory storage (mock)
        """
        self.policies: dict[UUID, Policy] = {}
        logger.info("PolicyService initialized")
    
    @log_execution_time(logger)
    async def create_policy(self, policy_data: PolicyCreate) -> PolicyResponse:
        """
        Create a new policy/intent
        
        Args:
            policy_data: Policy creation request
            
        Returns:
            PolicyResponse with created policy details
        """
        # Set expiry from rules if provided
        expires_at = policy_data.rules.expiry if policy_data.rules.expiry else None
        
        policy = Policy(
            name=policy_data.name,
            policy_type=policy_data.policy_type,
            rules=policy_data.rules,
            description=policy_data.description,
            is_active=True,
            priority=policy_data.priority,
            expires_at=expires_at,
            created_at=datetime.utcnow()
        )
        
        # Validate schema consistency
        schema_errors = policy.validate_schema()
        if schema_errors:
            from app.utils.exceptions import ValidationException
            raise ValidationException(
                f"Policy schema validation failed: {', '.join(schema_errors)}",
                details={"errors": schema_errors}
            )
        
        # Check for conflicts
        conflicts = await self._detect_conflicts(policy)
        
        # Attach to wallet if specified
        if policy_data.wallet_id:
            policy.attached_wallets.append(policy_data.wallet_id)
            # Also update wallet service
            from app.services.wallet_service import wallet_service
            try:
                await wallet_service.attach_policy(policy_data.wallet_id, policy.policy_id)
            except Exception as e:
                logger.warning(f"Failed to attach policy to wallet: {e}")
        
        self.policies[policy.policy_id] = policy
        
        logger.info(f"Policy created: {policy.policy_id} - {policy.name}")
        
        return PolicyResponse(
            success=True,
            message="Policy created successfully",
            policy=policy,
            conflicts=conflicts
        )
    
    @log_execution_time(logger)
    async def get_policy(self, policy_id: UUID) -> Policy:
        """
        Retrieve policy by ID
        
        Args:
            policy_id: Unique policy identifier
            
        Returns:
            Policy object
            
        Raises:
            PolicyNotFoundException: If policy doesn't exist
        """
        policy = self.policies.get(policy_id)
        if not policy:
            raise PolicyNotFoundException(str(policy_id))
        
        return policy
    
    @log_execution_time(logger)
    async def list_policies(self, active_only: bool = True) -> List[Policy]:
        """
        List all policies
        
        Args:
            active_only: Filter for active policies only
            
        Returns:
            List of policies
        """
        policies = list(self.policies.values())
        
        if active_only:
            policies = [p for p in policies if p.is_active and not p.is_expired()]
        
        return policies
    
    async def _detect_conflicts(self, policy: Policy) -> List[str]:
        """
        Detect conflicts with existing policies
        Placeholder for conflict detection logic
        
        Args:
            policy: Policy to check
            
        Returns:
            List of conflict descriptions
        """
        # Simplified conflict detection
        conflicts = []
        
        # Example: Check for contradictory category restrictions
        if policy.policy_type.value == "category_restriction":
            # Future implementation will check for logical conflicts
            pass
        
        return conflicts


# Global service instance
policy_service = PolicyService()
