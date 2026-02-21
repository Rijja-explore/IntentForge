"""
Wallet API Tests
Test suite for wallet creation and retrieval endpoints
"""

import pytest
from fastapi.testclient import TestClient
from uuid import UUID

from app.main import app

client = TestClient(app)


class TestWalletCreation:
    """Test wallet creation endpoint"""
    
    def test_create_wallet_success(self):
        """Test successful wallet creation"""
        payload = {
            "owner_id": "test_user_001",
            "currency": "INR",
            "initial_balance": 10000.0
        }
        
        response = client.post("/api/v1/wallet/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["success"] is True
        assert data["message"] == "Wallet created successfully"
        assert data["wallet"] is not None
        
        wallet = data["wallet"]
        assert wallet["owner_id"] == "test_user_001"
        assert wallet["currency"] == "INR"
        assert wallet["balance"] == 10000.0
        assert wallet["compliance_score"] == 1.0
        assert wallet["is_active"] is True
        assert wallet["is_locked"] is False
        assert len(wallet["attached_policies"]) == 0
        
        # Validate UUID format
        wallet_id = wallet["wallet_id"]
        assert UUID(wallet_id)
    
    def test_create_wallet_default_values(self):
        """Test wallet creation with default values"""
        payload = {
            "owner_id": "test_user_002"
        }
        
        response = client.post("/api/v1/wallet/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        wallet = data["wallet"]
        assert wallet["currency"] == "INR"  # Default
        assert wallet["balance"] == 0.0  # Default
    
    def test_create_wallet_missing_owner_id(self):
        """Test wallet creation fails without owner_id"""
        payload = {
            "currency": "INR",
            "initial_balance": 5000.0
        }
        
        response = client.post("/api/v1/wallet/create", json=payload)
        
        assert response.status_code == 422  # Validation error
    
    def test_create_wallet_negative_balance(self):
        """Test wallet creation fails with negative balance"""
        payload = {
            "owner_id": "test_user_003",
            "initial_balance": -1000.0
        }
        
        response = client.post("/api/v1/wallet/create", json=payload)
        
        assert response.status_code == 422  # Validation error


class TestWalletRetrieval:
    """Test wallet retrieval endpoints"""
    
    @pytest.fixture
    def created_wallet(self):
        """Create a wallet for testing retrieval"""
        payload = {
            "owner_id": "test_user_retrieval",
            "currency": "INR",
            "initial_balance": 5000.0
        }
        response = client.post("/api/v1/wallet/create", json=payload)
        return response.json()["wallet"]
    
    def test_get_wallet_by_id_success(self, created_wallet):
        """Test successful wallet retrieval by ID"""
        wallet_id = created_wallet["wallet_id"]
        
        response = client.get(f"/api/v1/wallet/{wallet_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["wallet_id"] == wallet_id
        assert data["owner_id"] == "test_user_retrieval"
        assert data["balance"] == 5000.0
        assert data["currency"] == "INR"
    
    def test_get_wallet_not_found(self):
        """Test wallet retrieval with non-existent ID"""
        fake_id = "123e4567-e89b-12d3-a456-426614174999"
        
        response = client.get(f"/api/v1/wallet/{fake_id}")
        
        assert response.status_code == 404
    
    def test_get_wallet_invalid_uuid(self):
        """Test wallet retrieval with invalid UUID format"""
        invalid_id = "not-a-valid-uuid"
        
        response = client.get(f"/api/v1/wallet/{invalid_id}")
        
        assert response.status_code == 422  # Validation error
    
    def test_get_wallet_balance(self, created_wallet):
        """Test wallet balance retrieval"""
        wallet_id = created_wallet["wallet_id"]
        
        response = client.get(f"/api/v1/wallet/{wallet_id}/balance")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["wallet_id"] == wallet_id
        assert data["balance"] == 5000.0
        assert data["currency"] == "INR"
        assert "is_locked" in data


class TestWalletListing:
    """Test wallet listing endpoint"""
    
    @pytest.fixture
    def multiple_wallets(self):
        """Create multiple wallets for testing"""
        wallets = []
        for i in range(3):
            payload = {
                "owner_id": f"test_user_{i}",
                "initial_balance": 1000.0 * (i + 1)
            }
            response = client.post("/api/v1/wallet/create", json=payload)
            wallets.append(response.json()["wallet"])
        return wallets
    
    def test_list_all_wallets(self, multiple_wallets):
        """Test listing all wallets"""
        response = client.get("/api/v1/wallet/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 3  # At least our test wallets
    
    def test_list_wallets_by_owner(self, multiple_wallets):
        """Test listing wallets filtered by owner"""
        owner_id = "test_user_0"
        
        response = client.get(f"/api/v1/wallet/?owner_id={owner_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # All returned wallets should belong to the specified owner
        for wallet in data:
            assert wallet["owner_id"] == owner_id


class TestWalletResponseFormat:
    """Test response format and determinism"""
    
    def test_response_is_deterministic(self):
        """Test that responses are consistent and deterministic"""
        payload = {
            "owner_id": "determinism_test_user",
            "initial_balance": 10000.0
        }
        
        # Create wallet twice with same data (different instances)
        response1 = client.post("/api/v1/wallet/create", json=payload)
        response2 = client.post("/api/v1/wallet/create", json=payload)
        
        wallet1 = response1.json()["wallet"]
        wallet2 = response2.json()["wallet"]
        
        # Different wallet IDs (expected)
        assert wallet1["wallet_id"] != wallet2["wallet_id"]
        
        # But same deterministic properties
        assert wallet1["compliance_score"] == wallet2["compliance_score"]
        assert wallet1["is_active"] == wallet2["is_active"]
        assert wallet1["is_locked"] == wallet2["is_locked"]
        assert wallet1["currency"] == wallet2["currency"]
    
    def test_response_schema_completeness(self):
        """Test that response includes all required fields"""
        payload = {
            "owner_id": "schema_test_user",
            "initial_balance": 5000.0
        }
        
        response = client.post("/api/v1/wallet/create", json=payload)
        wallet = response.json()["wallet"]
        
        required_fields = [
            "wallet_id", "owner_id", "balance", "currency",
            "compliance_score", "attached_policies", "is_active",
            "is_locked", "created_at", "updated_at"
        ]
        
        for field in required_fields:
            assert field in wallet, f"Missing required field: {field}"
    
    def test_processing_time_header(self):
        """Test that responses include performance tracking"""
        payload = {"owner_id": "perf_test_user"}
        
        response = client.post("/api/v1/wallet/create", json=payload)
        
        assert "X-Process-Time-MS" in response.headers
        process_time = float(response.headers["X-Process-Time-MS"])
        assert process_time >= 0
        assert process_time < 200  # Should be under 200ms
