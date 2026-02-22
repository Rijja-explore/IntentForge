"""
Transaction Models
Pydantic schemas for transaction validation and results
"""

from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class TransactionStatus(str, Enum):
    APPROVED = "APPROVED"
    BLOCKED = "BLOCKED"
    PENDING = "PENDING"
    VIOLATION = "VIOLATION"
    CLAWBACK_REQUIRED = "CLAWBACK_REQUIRED"


class TransactionCreate(BaseModel):
    """Payload for POST /transaction/validate and /transaction/simulate"""
    wallet_id: UUID
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    merchant: Optional[str] = None
    location: Optional[str] = None
    upi_ref_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class Transaction(BaseModel):
    """Full transaction record (internal + stored)"""
    transaction_id: UUID = Field(default_factory=uuid4)
    wallet_id: UUID
    amount: float
    category: str
    merchant: Optional[str] = None
    location: Optional[str] = None
    upi_ref_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    status: TransactionStatus = TransactionStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ValidationResult(BaseModel):
    """Returned from POST /transaction/validate and /simulate"""
    transaction_id: UUID
    status: TransactionStatus
    decision: str
    violations: List[str] = Field(default_factory=list)
    policies_evaluated: List[UUID] = Field(default_factory=list)
    # Frontend-aligned field names
    ai_reasoning: str = Field("", alias="reasoning")
    confidence: float = Field(0.0, alias="confidence_score")
    processing_time_ms: float = 0.0
    requires_clawback: bool = False

    model_config = {"populate_by_name": True}
