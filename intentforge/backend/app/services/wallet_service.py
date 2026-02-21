"""
Wallet Service
Business logic for wallet management and operations
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.wallet import Wallet, WalletCreate, WalletResponse
from app.utils.logger import get_logger, log_execution_time
from app.utils.exceptions import WalletNotFoundException, InsufficientBalanceException

logger = get_logger(__name__)


class WalletService:
    """
    Wallet Management Service
    Handles wallet creation, balance management, and policy attachment
    """
    
    def __init__(self):
        """
        Initialize wallet service with in-memory storage (mock)
        In production, this would connect to a database
        """
        self.wallets: dict[UUID, Wallet] = {}
        logger.info("WalletService initialized")
    
    @log_execution_time(logger)
    async def create_wallet(self, wallet_data: WalletCreate) -> WalletResponse:
        """
        Create a new programmable wallet
        
        Args:
            wallet_data: Wallet creation request
            
        Returns:
            WalletResponse with created wallet details
        """
        wallet = Wallet(
            owner_id=wallet_data.owner_id,
            balance=wallet_data.initial_balance,
            currency=wallet_data.currency,
            compliance_score=1.0,
            attached_policies=[],
            is_active=True,
            is_locked=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.wallets[wallet.wallet_id] = wallet
        
        logger.info(f"Wallet created: {wallet.wallet_id} for user {wallet.owner_id}")
        
        return WalletResponse(
            success=True,
            message="Wallet created successfully",
            wallet=wallet
        )
    
    @log_execution_time(logger)
    async def get_wallet(self, wallet_id: UUID) -> Wallet:
        """
        Retrieve wallet by ID
        
        Args:
            wallet_id: Unique wallet identifier
            
        Returns:
            Wallet object
            
        Raises:
            WalletNotFoundException: If wallet doesn't exist
        """
        wallet = self.wallets.get(wallet_id)
        if not wallet:
            raise WalletNotFoundException(str(wallet_id))
        
        return wallet
    
    @log_execution_time(logger)
    async def update_balance(
        self, 
        wallet_id: UUID, 
        amount: float, 
        operation: str = "debit"
    ) -> Wallet:
        """
        Update wallet balance (for transactions)
        
        Args:
            wallet_id: Unique wallet identifier
            amount: Amount to debit/credit
            operation: 'debit' or 'credit'
            
        Returns:
            Updated wallet
            
        Raises:
            WalletNotFoundException: If wallet doesn't exist
            InsufficientBalanceException: If insufficient funds
        """
        wallet = await self.get_wallet(wallet_id)
        
        if operation == "debit":
            if wallet.balance < amount:
                raise InsufficientBalanceException(
                    str(wallet_id), 
                    amount, 
                    wallet.balance
                )
            wallet.balance -= amount
        elif operation == "credit":
            wallet.balance += amount
        
        wallet.updated_at = datetime.utcnow()
        
        logger.info(
            f"Wallet {wallet_id} balance updated: "
            f"{operation} {amount} -> new balance: {wallet.balance}"
        )
        
        return wallet
    
    @log_execution_time(logger)
    async def attach_policy(self, wallet_id: UUID, policy_id: UUID) -> Wallet:
        """
        Attach a policy to a wallet
        
        Args:
            wallet_id: Unique wallet identifier
            policy_id: Policy to attach
            
        Returns:
            Updated wallet
        """
        wallet = await self.get_wallet(wallet_id)
        
        if policy_id not in wallet.attached_policies:
            wallet.attached_policies.append(policy_id)
            wallet.updated_at = datetime.utcnow()
            
            logger.info(f"Policy {policy_id} attached to wallet {wallet_id}")
        
        return wallet
    
    @log_execution_time(logger)
    async def list_wallets(self, owner_id: Optional[str] = None) -> List[Wallet]:
        """
        List all wallets, optionally filtered by owner
        
        Args:
            owner_id: Optional owner filter
            
        Returns:
            List of wallets
        """
        if owner_id:
            return [w for w in self.wallets.values() if w.owner_id == owner_id]
        return list(self.wallets.values())


# Global service instance
wallet_service = WalletService()
