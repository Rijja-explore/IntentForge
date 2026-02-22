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
from app.services.blockchain_audit_service import blockchain_audit_service

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
        
        # Log to blockchain
        try:
            await blockchain_audit_service.log_policy_creation(
                policy_id=policy.policy_id,
                policy_data={
                    "name": policy.name,
                    "policy_type": policy.policy_type,
                    "wallet_id": policy_data.wallet_id,
                    "priority": policy.priority
                }
            )
            logger.info(f"Policy creation logged to blockchain: {policy.policy_id}")
        except Exception as e:
            logger.warning(f"Failed to log policy creation to blockchain: {e}")
        
        return PolicyResponse(
            success=True,
            message="Policy created successfully",
            policy=policy,
            conflicts=conflicts
        )
    
    @log_execution_time(logger)
    async def get_wallet_policies(self, wallet_id: UUID) -> List[Policy]:
        """
        Retrieve policies attached to a specific wallet
        """
        return [
            policy for policy in self.policies.values()
            if wallet_id in policy.attached_wallets
            and policy.is_active
            and not policy.is_expired()
        ]

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
        Comprehensive conflict detection for contradictory or impossible rules
        
        Args:
            policy: Policy to check
            
        Returns:
            List of conflict descriptions
        """
        conflicts = []
        
        # Get all existing policies
        existing_policies = list(self.policies.values())
        
        for existing in existing_policies:
            if not existing.is_active:
                continue
            
            # 1. CONTRADICTORY CATEGORY RESTRICTIONS
            if (policy.policy_type == "category_restriction" and
                existing.policy_type == "category_restriction"):
                
                new_categories = set(policy.rules.allowed_categories or [])
                existing_categories = set(existing.rules.allowed_categories or [])
                
                # Check for complete contradiction (no overlap)
                if new_categories and existing_categories:
                    if new_categories.isdisjoint(existing_categories):
                        conflicts.append(
                            f"CONFLICT: Policy '{policy.name}' allows categories {new_categories} "
                            f"which have NO overlap with existing policy '{existing.name}' "
                            f"categories {existing_categories}. "
                            f"This creates impossible conditions - no transaction can satisfy both policies."
                        )
            
            # 2. IMPOSSIBLE AMOUNT LIMITS
            if policy.rules.max_amount and existing.rules.max_amount:
                # Check if both policies have max_amount and one is more restrictive
                if policy.rules.max_amount < existing.rules.max_amount * 0.1:
                    conflicts.append(
                        f"CONFLICT: Policy '{policy.name}' max_amount ({policy.rules.max_amount}) "
                        f"is significantly lower than '{existing.name}' ({existing.rules.max_amount}). "
                        f"Consider consolidating limits."
                    )
            
            # 3. CONTRADICTORY PER-TRANSACTION CAPS
            if policy.rules.per_transaction_cap and existing.rules.max_amount:
                if policy.rules.per_transaction_cap > existing.rules.max_amount:
                    conflicts.append(
                        f"CONFLICT: Policy '{policy.name}' per_transaction_cap "
                        f"({policy.rules.per_transaction_cap}) exceeds "
                        f"existing policy '{existing.name}' max_amount ({existing.rules.max_amount}). "
                        f"Per-transaction cap should not exceed total spending limit."
                    )
            
            # 4. CONTRADICTORY GEOFENCE RESTRICTIONS
            if (policy.rules.geo_fence and existing.rules.geo_fence):
                new_geos = set(policy.rules.geo_fence)
                existing_geos = set(existing.rules.geo_fence)
                
                # Check for no overlap
                if new_geos.isdisjoint(existing_geos):
                    conflicts.append(
                        f"CONFLICT: Policy '{policy.name}' geo_fence {new_geos} "
                        f"has NO overlap with existing policy '{existing.name}' "
                        f"geo_fence {existing_geos}. "
                        f"No location can satisfy both policies."
                    )
            
            # 5. MERCHANT WHITELIST vs BLACKLIST
            if policy.rules.merchant_whitelist and existing.rules.merchant_blacklist:
                whitelist = set(policy.rules.merchant_whitelist)
                blacklist = set(existing.rules.merchant_blacklist)
                
                overlap = whitelist.intersection(blacklist)
                if overlap:
                    conflicts.append(
                        f"CONFLICT: Policy '{policy.name}' whitelists merchants {overlap} "
                        f"but existing policy '{existing.name}' blacklists them. "
                        f"These merchants are in impossible state (both allowed and blocked)."
                    )
            
            # 6. IMPOSSIBLE TIME + EXPIRY CONFLICTS
            if policy.rules.expiry and existing.rules.expiry:
                # Check if expiries are very close (within 1 day) but different
                time_diff = abs((policy.rules.expiry - existing.rules.expiry).total_seconds())
                if 0 < time_diff < 86400:  # Less than 1 day difference
                    conflicts.append(
                        f"WARNING: Policy '{policy.name}' and '{existing.name}' "
                        f"have expiries within 24 hours of each other. "
                        f"This may cause unexpected policy cascade effects."
                    )
        
        return conflicts
    
    @log_execution_time(logger)
    async def detect_all_conflicts(self) -> dict:
        """
        Detect all conflicts across all active policies
        
        Returns:
            Dictionary with conflict analysis
        """
        all_conflicts = []
        policy_list = list(self.policies.values())
        
        # Check each policy against all others
        for i, policy_a in enumerate(policy_list):
            if not policy_a.is_active:
                continue
            
            for policy_b in policy_list[i+1:]:
                if not policy_b.is_active:
                    continue
                
                # Create temporary policy to use conflict detection
                conflicts = await self._detect_conflicts(policy_a)
                
                if conflicts:
                    for conflict in conflicts:
                        if policy_b.name in conflict:
                            all_conflicts.append({
                                "policy_a": str(policy_a.policy_id),
                                "policy_a_name": policy_a.name,
                                "policy_b": str(policy_b.policy_id),
                                "policy_b_name": policy_b.name,
                                "conflict_description": conflict,
                                "severity": self._assess_conflict_severity(conflict)
                            })
        
        return {
            "total_conflicts": len(all_conflicts),
            "conflicts": all_conflicts,
            "has_critical_conflicts": any(
                c["severity"] == "CRITICAL" for c in all_conflicts
            )
        }
    
    def _assess_conflict_severity(self, conflict_description: str) -> str:
        """Assess conflict severity based on description"""
        if "impossible" in conflict_description.lower():
            return "CRITICAL"
        elif "contradictory" in conflict_description.lower():
            return "HIGH"
        elif "warning" in conflict_description.lower():
            return "LOW"
        else:
            return "MEDIUM"

    async def update_policy(self, policy_id: UUID, updates: dict) -> Policy:
        """Partially update an existing policy."""
        policy = await self.get_policy(policy_id)
        for field, value in updates.items():
            if hasattr(policy, field) and value is not None:
                setattr(policy, field, value)
        from datetime import datetime
        policy.updated_at = datetime.utcnow()
        self.policies[policy_id] = policy
        logger.info(f"Policy updated: {policy_id}")
        return policy

    async def delete_policy(self, policy_id: UUID) -> bool:
        """Remove a policy from the store."""
        await self.get_policy(policy_id)  # raises PolicyNotFoundException if missing
        del self.policies[policy_id]
        logger.info(f"Policy deleted: {policy_id}")
        return True


# Global service instance
policy_service = PolicyService()
