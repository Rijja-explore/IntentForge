"""
Custom Exceptions for IntentForge
Domain-specific exceptions for graceful error handling
"""

from typing import Optional, Dict, Any


class IntentForgeException(Exception):
    """
    Base exception for all IntentForge errors
    Ensures consistent error handling across the application
    """
    def __init__(
        self, 
        message: str, 
        error_code: str = "INTENTFORGE_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API responses"""
        return {
            "error": self.error_code,
            "message": self.message,
            "details": self.details
        }


class ValidationException(IntentForgeException):
    """
    Raised when transaction validation fails
    """
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details=details
        )


class PolicyConflictException(IntentForgeException):
    """
    Raised when policies have conflicting rules
    """
    def __init__(self, message: str, conflicts: list, details: Optional[Dict[str, Any]] = None):
        _details = details or {}
        _details["conflicts"] = conflicts
        super().__init__(
            message=message,
            error_code="POLICY_CONFLICT",
            details=_details
        )


class WalletNotFoundException(IntentForgeException):
    """
    Raised when wallet is not found
    """
    def __init__(self, wallet_id: str):
        super().__init__(
            message=f"Wallet not found: {wallet_id}",
            error_code="WALLET_NOT_FOUND",
            details={"wallet_id": wallet_id}
        )


class InsufficientBalanceException(IntentForgeException):
    """
    Raised when wallet has insufficient balance
    """
    def __init__(self, wallet_id: str, required: float, available: float):
        super().__init__(
            message=f"Insufficient balance in wallet {wallet_id}",
            error_code="INSUFFICIENT_BALANCE",
            details={
                "wallet_id": wallet_id,
                "required_amount": required,
                "available_balance": available
            }
        )


class PolicyNotFoundException(IntentForgeException):
    """
    Raised when policy is not found
    """
    def __init__(self, policy_id: str):
        super().__init__(
            message=f"Policy not found: {policy_id}",
            error_code="POLICY_NOT_FOUND",
            details={"policy_id": policy_id}
        )


class ClawbackException(IntentForgeException):
    """
    Raised when clawback operation fails
    """
    def __init__(self, message: str, transaction_id: str, details: Optional[Dict[str, Any]] = None):
        _details = details or {}
        _details["transaction_id"] = transaction_id
        super().__init__(
            message=message,
            error_code="CLAWBACK_ERROR",
            details=_details
        )


class AIServiceException(IntentForgeException):
    """
    Raised when AI service encounters an error
    """
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="AI_SERVICE_ERROR",
            details=details
        )
