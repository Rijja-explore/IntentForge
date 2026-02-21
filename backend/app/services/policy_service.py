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
        policy = Policy(
            name=policy_data.name,
            policy_type=policy_data.policy_type,
            rules=policy_data.rules,
            description=policy_data.description,
            is_active=True,
            priority=100,
            created_at=datetime.utcnow()
        )
        
        # Check for conflicts (placeholder - will be implemented in conflict service)
        conflicts = await self._detect_conflicts(policy)
        
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
