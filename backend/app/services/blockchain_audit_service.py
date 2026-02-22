"""
Blockchain Audit Service
Logs immutable hashes for policies, violations, and clawbacks to blockchain
Backend makes API calls only - no smart contract implementation
"""

import hashlib
import json
from typing import Dict, Any, Optional
from datetime import datetime
from uuid import UUID
import httpx

from app.utils.logger import get_logger
from app.config import settings

logger = get_logger(__name__)


class BlockchainAuditService:
    """
    Service for logging audit trails to blockchain via API calls
    Designed for easy integration with various blockchain providers
    """
    
    def __init__(self):
        # Blockchain API configuration (mock for demo - replace with real API)
        self.blockchain_api_url = getattr(settings, 'BLOCKCHAIN_API_URL', 'https://blockchain-api.example.com')
        self.blockchain_api_key = getattr(settings, 'BLOCKCHAIN_API_KEY', 'demo-api-key')
        
        # Local audit log for tracking
        self.audit_log: list[Dict[str, Any]] = []
        
        # Chain configuration
        self.chain_id = "intentforge-audit-chain"
        self.network = "testnet"  # testnet, mainnet
        
        logger.info(f"BlockchainAuditService initialized - Network: {self.network}")
    
    async def log_policy_creation(
        self,
        policy_id: UUID,
        policy_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Log policy creation to blockchain
        
        Args:
            policy_id: Policy identifier
            policy_data: Policy details
            
        Returns:
            Blockchain transaction receipt
        """
        logger.info(f"Logging policy creation to blockchain: {policy_id}")
        
        # Prepare audit data
        audit_data = {
            "event_type": "POLICY_CREATED",
            "policy_id": str(policy_id),
            "policy_name": policy_data.get("name"),
            "policy_type": policy_data.get("policy_type"),
            "wallet_id": str(policy_data.get("wallet_id")) if policy_data.get("wallet_id") else None,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Generate hash
        data_hash = self._generate_hash(audit_data)
        
        # Log to blockchain
        receipt = await self._submit_to_blockchain(
            event_type="POLICY_CREATED",
            data_hash=data_hash,
            metadata=audit_data
        )
        
        return receipt

    async def log_transaction_approved(
        self,
        transaction_id: str,
        wallet_id: UUID,
        transaction_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Log an approved transaction to the blockchain audit trail"""
        logger.info(f"Logging approved transaction to blockchain: {transaction_id}")
        audit_data = {
            "event_type": "TRANSACTION_APPROVED",
            "transaction_id": transaction_id,
            "wallet_id": str(wallet_id),
            "amount": transaction_details.get("amount"),
            "category": transaction_details.get("category"),
            "merchant": transaction_details.get("merchant"),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        data_hash = self._generate_hash(audit_data)
        return await self._submit_to_blockchain(
            event_type="TRANSACTION_APPROVED",
            data_hash=data_hash,
            metadata=audit_data
        )

    async def log_transaction_violation(
        self,
        transaction_id: str,
        wallet_id: UUID,
        violation_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Log transaction violation to blockchain
        
        Args:
            transaction_id: Transaction identifier
            wallet_id: Wallet identifier
            violation_details: Violation information
            
        Returns:
            Blockchain transaction receipt
        """
        logger.info(f"Logging transaction violation to blockchain: {transaction_id}")
        
        # Prepare audit data
        audit_data = {
            "event_type": "TRANSACTION_VIOLATED",
            "transaction_id": transaction_id,
            "wallet_id": str(wallet_id),
            "violation_type": violation_details.get("violation_type"),
            "policy_id": str(violation_details.get("policy_id")) if violation_details.get("policy_id") else None,
            "amount": violation_details.get("amount"),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Generate hash
        data_hash = self._generate_hash(audit_data)
        
        # Log to blockchain
        receipt = await self._submit_to_blockchain(
            event_type="TRANSACTION_VIOLATED",
            data_hash=data_hash,
            metadata=audit_data
        )
        
        return receipt
    
    async def log_clawback_execution(
        self,
        clawback_id: UUID,
        clawback_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Log clawback execution to blockchain
        
        Args:
            clawback_id: Clawback identifier
            clawback_data: Clawback details
            
        Returns:
            Blockchain transaction receipt
        """
        logger.info(f"Logging clawback execution to blockchain: {clawback_id}")
        
        # Prepare audit data
        audit_data = {
            "event_type": "CLAWBACK_EXECUTED",
            "clawback_id": str(clawback_id),
            "wallet_id": str(clawback_data.get("wallet_id")),
            "amount": clawback_data.get("amount"),
            "reason": clawback_data.get("reason"),
            "transaction_id": clawback_data.get("transaction_id"),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Generate hash
        data_hash = self._generate_hash(audit_data)
        
        # Log to blockchain
        receipt = await self._submit_to_blockchain(
            event_type="CLAWBACK_EXECUTED",
            data_hash=data_hash,
            metadata=audit_data
        )
        
        return receipt
    
    async def log_policy_update(
        self,
        policy_id: UUID,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Log policy update to blockchain
        
        Args:
            policy_id: Policy identifier
            update_data: Update details
            
        Returns:
            Blockchain transaction receipt
        """
        logger.info(f"Logging policy update to blockchain: {policy_id}")
        
        audit_data = {
            "event_type": "POLICY_UPDATED",
            "policy_id": str(policy_id),
            "updates": update_data,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        data_hash = self._generate_hash(audit_data)
        
        receipt = await self._submit_to_blockchain(
            event_type="POLICY_UPDATED",
            data_hash=data_hash,
            metadata=audit_data
        )
        
        return receipt
    
    def _generate_hash(self, data: Dict[str, Any]) -> str:
        """
        Generate SHA-256 hash of data
        
        Args:
            data: Data to hash
            
        Returns:
            Hex-encoded hash string
        """
        # Convert to deterministic JSON (sorted keys)
        json_str = json.dumps(data, sort_keys=True)
        
        # Generate SHA-256 hash
        hash_obj = hashlib.sha256(json_str.encode('utf-8'))
        data_hash = hash_obj.hexdigest()
        
        return data_hash
    
    async def _submit_to_blockchain(
        self,
        event_type: str,
        data_hash: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submit audit log to blockchain via API
        
        Args:
            event_type: Type of event
            data_hash: Hash of the data
            metadata: Additional metadata
            
        Returns:
            Blockchain transaction receipt
        """
        try:
            # Prepare blockchain transaction payload
            payload = {
                "chain_id": self.chain_id,
                "network": self.network,
                "event_type": event_type,
                "data_hash": data_hash,
                "metadata": metadata,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            # In production, this would make actual API call to blockchain provider
            # For demo/development, we simulate the response
            if settings.ENVIRONMENT == "production":
                # Make actual blockchain API call
                receipt = await self._make_blockchain_api_call(payload)
            else:
                # Simulate blockchain response
                receipt = self._simulate_blockchain_response(payload)
            
            # Store in local audit log
            audit_record = {
                "blockchain_tx_id": receipt["transaction_id"],
                "blockchain_hash": receipt["block_hash"],
                "event_type": event_type,
                "data_hash": data_hash,
                "metadata": metadata,
                "timestamp": receipt["timestamp"],
                "status": receipt["status"]
            }
            self.audit_log.append(audit_record)
            
            logger.info(f"Blockchain audit logged: {event_type} - TX: {receipt['transaction_id']}")
            
            return receipt
            
        except Exception as e:
            logger.error(f"Failed to log to blockchain: {str(e)}")
            
            # Return error receipt
            return {
                "transaction_id": "ERROR",
                "block_hash": None,
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
    
    async def _make_blockchain_api_call(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make actual API call to blockchain provider
        Replace this with real blockchain API integration
        
        Args:
            payload: Transaction payload
            
        Returns:
            API response
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.blockchain_api_url}/audit/log",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.blockchain_api_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=10.0
                )
                
                response.raise_for_status()
                return response.json()
                
            except Exception as e:
                logger.error(f"Blockchain API call failed: {str(e)}")
                raise
    
    def _simulate_blockchain_response(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate blockchain API response for development/demo
        
        Args:
            payload: Transaction payload
            
        Returns:
            Simulated response
        """
        import random
        
        # Generate mock blockchain transaction ID
        tx_id = f"0x{hashlib.sha256(str(random.random()).encode()).hexdigest()[:16]}"
        
        # Generate mock block hash
        block_hash = f"0x{hashlib.sha256(str(random.random()).encode()).hexdigest()}"
        
        return {
            "transaction_id": tx_id,
            "block_hash": block_hash,
            "block_number": random.randint(1000000, 9999999),
            "status": "confirmed",
            "confirmations": 12,
            "gas_used": random.randint(50000, 200000),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "network": self.network,
            "chain_id": self.chain_id
        }
    
    def get_audit_log(self, limit: int = 50, event_type: Optional[str] = None) -> list[Dict[str, Any]]:
        """
        Get recent audit log entries
        
        Args:
            limit: Maximum number of entries to return
            event_type: Filter by event type
            
        Returns:
            List of audit log entries
        """
        logs = self.audit_log
        
        if event_type:
            logs = [log for log in logs if log["event_type"] == event_type]
        
        return logs[-limit:]
    
    async def verify_hash(self, data_hash: str) -> Optional[Dict[str, Any]]:
        """
        Verify if a hash exists in blockchain
        
        Args:
            data_hash: Hash to verify
            
        Returns:
            Blockchain record if found, None otherwise
        """
        # Search local audit log
        for record in self.audit_log:
            if record["data_hash"] == data_hash:
                return record
        
        return None


# Singleton instance
blockchain_audit_service = BlockchainAuditService()
