"""
Clawback Models
Pydantic schemas for transaction reversal and audit records
"""

from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ClawbackStatus(str, Enum):
    PENDING = "PENDING"
    EXECUTED = "EXECUTED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class ClawbackReason(str, Enum):
    POLICY_VIOLATION = "POLICY_VIOLATION"
    EXPIRED_POLICY = "EXPIRED_POLICY"
    FRAUD_DETECTION = "FRAUD_DETECTION"
    COMPLIANCE_BREACH = "COMPLIANCE_BREACH"
    MANUAL_REVERSAL = "MANUAL_REVERSAL"


class ClawbackRequest(BaseModel):
    """Payload for POST /clawback/execute"""
    transaction_id: UUID
    wallet_id: UUID
    reason: ClawbackReason = ClawbackReason.POLICY_VIOLATION
    force: bool = False


class ClawbackRecord(BaseModel):
    """Stored clawback record"""
    clawback_id: UUID = Field(default_factory=uuid4)
    transaction_id: UUID
    wallet_id: UUID
    amount: float
    reason: ClawbackReason
    status: ClawbackStatus = ClawbackStatus.PENDING
    explanation: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ClawbackResult(BaseModel):
    """Response from POST /clawback/execute"""
    clawback_id: UUID
    transaction_id: UUID
    wallet_id: UUID
    status: ClawbackStatus
    reason: ClawbackReason
    amount_reversed: float
    previous_balance: float
    new_balance: float
    processing_time_ms: float = 0.0
    explanation: str = ""
    violations: List[str] = Field(default_factory=list)
