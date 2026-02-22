"""
Wallet Models
Pydantic schemas for wallet creation, retrieval, and responses
"""

from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class WalletCreate(BaseModel):
    """Payload for POST /wallet/create"""
    owner_id: str = Field(..., description="Owner identifier (user ID or username)")
    currency: str = Field("INR", description="Wallet currency code")
    initial_balance: float = Field(0.0, ge=0, description="Starting balance")


class Wallet(BaseModel):
    """Full wallet representation stored in-memory / returned from GET"""
    wallet_id: UUID = Field(default_factory=uuid4)
    owner_id: str
    balance: float = 0.0
    currency: str = "INR"
    compliance_score: float = Field(1.0, ge=0.0, le=1.0)
    attached_policies: List[UUID] = Field(default_factory=list)
    is_active: bool = True
    is_locked: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WalletResponse(BaseModel):
    """Response wrapper for wallet operations"""
    success: bool = True
    message: str = "Wallet operation successful"
    wallet: Wallet
