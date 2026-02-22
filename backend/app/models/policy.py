"""
Policy / Intent Models
Pydantic schemas for programmable money governance rules
"""

from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class PolicyType(str, Enum):
    CATEGORY_RESTRICTION = "category_restriction"
    SPENDING_LIMIT = "spending_limit"
    AMOUNT_LIMIT = "amount_limit"
    GEO_RESTRICTION = "geo_restriction"
    GEO_FENCE = "geo_fence"
    MERCHANT_CONTROL = "merchant_control"
    TIME_CONSTRAINT = "time_constraint"
    COMPOSITE = "composite"


class PolicyRules(BaseModel):
    """Nested rules object inside a policy"""
    allowed_categories: List[str] = Field(default_factory=list)
    max_amount: Optional[float] = Field(None, ge=0)
    per_transaction_cap: Optional[float] = Field(None, ge=0)
    geo_fence: List[str] = Field(default_factory=list)
    merchant_whitelist: List[str] = Field(default_factory=list)
    merchant_blacklist: List[str] = Field(default_factory=list)
    expiry: Optional[datetime] = None


class PolicyCreate(BaseModel):
    """Payload for POST /policy/create"""
    name: str = Field(..., min_length=1, max_length=200)
    policy_type: str = Field("category_restriction")
    rules: PolicyRules = Field(default_factory=PolicyRules)
    description: Optional[str] = None
    wallet_id: Optional[UUID] = None
    priority: int = Field(0, ge=0, le=1000)


class PolicyUpdate(BaseModel):
    """Payload for PUT /policy/{policy_id}/update"""
    name: Optional[str] = None
    rules: Optional[PolicyRules] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None


class Policy(BaseModel):
    """Full policy representation"""
    policy_id: UUID = Field(default_factory=uuid4)
    name: str
    policy_type: str = "category_restriction"
    rules: PolicyRules = Field(default_factory=PolicyRules)
    description: Optional[str] = None
    priority: int = 0
    is_active: bool = True
    expires_at: Optional[datetime] = None
    attached_wallets: List[UUID] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def validate_schema(self) -> List[str]:
        errors: List[str] = []
        if not self.name:
            errors.append("Policy name is required")
        if self.rules.max_amount is not None and self.rules.max_amount <= 0:
            errors.append("max_amount must be positive")
        if (
            self.rules.per_transaction_cap is not None
            and self.rules.max_amount is not None
            and self.rules.per_transaction_cap > self.rules.max_amount
        ):
            errors.append("per_transaction_cap cannot exceed max_amount")
        return errors

    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at


class PolicyResponse(BaseModel):
    """Response wrapper for policy creation"""
    success: bool = True
    message: str = "Policy operation successful"
    policy: Policy
    conflicts: List[str] = Field(default_factory=list)
    schema_valid: bool = True
