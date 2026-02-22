"""
Response Models
Generic API response envelope and health response shapes
"""

from typing import TypeVar, Generic, Optional, Any
from datetime import datetime
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Generic JSON envelope: { success, message, data }"""
    success: bool = True
    message: str = ""
    data: Optional[T] = None


class HealthResponse(BaseModel):
    """Standard health-check response"""
    status: str
    version: str = "1.0.0"
    timestamp: Optional[Any] = None
    environment: Optional[str] = None
    services: Optional[dict] = None
