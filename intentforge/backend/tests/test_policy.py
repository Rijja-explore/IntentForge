"""
Policy API Tests
Test suite for policy creation, validation, and wallet attachment
"""

import pytest
from fastapi.testclient import TestClient
from uuid import UUID
from datetime import datetime, timedelta

from app.main import app

client = TestClient(app)


class TestPolicyCreation:
    """Test policy creation endpoint"""
    
    @pytest.fixture
    def sample_wallet(self):
        """Create a wallet for policy attachment"""
        payload = {
            "owner_id": "policy_test_user",
            "initial_balance": 50000.0
        }
        response = client.post("/api/v1/wallet/create", json=payload)
        return response.json()["wallet"]
    
    def test_create_category_restriction_policy(self):
        """Test creating a category restriction policy"""
        payload = {
            "name": "Education Budget",
            "policy_type": "category_restriction",
            "rules": {
                "allowed_categories": ["education", "books", "courses"],
                "max_amount": 50000.0
            },
            "description": "Restrict spending to education",
            "priority": 10
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["success"] is True
        assert data["policy"] is not None
        
        policy = data["policy"]
        assert policy["name"] == "Education Budget"
        assert policy["policy_type"] == "category_restriction"
        assert policy["rules"]["allowed_categories"] == ["education", "books", "courses"]
        assert policy["rules"]["max_amount"] == 50000.0
        assert policy["priority"] == 10
        assert policy["is_active"] is True
        
        # Validate UUID
        assert UUID(policy["policy_id"])
    
    def test_create_spending_limit_policy(self):
        """Test creating a spending limit policy"""
        payload = {
            "name": "Monthly Cap",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 100000.0,
                "period": "monthly"
            },
            "priority": 5
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        policy = data["policy"]
        assert policy["rules"]["max_amount"] == 100000.0
    
    def test_create_transaction_cap_policy(self):
        """Test creating a transaction cap policy"""
        payload = {
            "name": "Per Transaction Limit",
            "policy_type": "transaction_cap",
            "rules": {
                "per_transaction_cap": 10000.0
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        policy = data["policy"]
        assert policy["rules"]["per_transaction_cap"] == 10000.0
    
    def test_create_geo_restriction_policy(self):
        """Test creating a geo-fenced policy"""
        payload = {
            "name": "Local Transactions Only",
            "policy_type": "geo_restriction",
            "rules": {
                "geo_fence": ["IN-DL", "IN-MH", "IN-KA"]
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        policy = data["policy"]
        assert policy["rules"]["geo_fence"] == ["IN-DL", "IN-MH", "IN-KA"]
    
    def test_create_policy_with_expiry(self):
        """Test creating policy with expiration"""
        expiry = (datetime.utcnow() + timedelta(days=30)).isoformat()
        
        payload = {
            "name": "Temporary Budget",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 25000.0,
                "expiry": expiry
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        policy = data["policy"]
        assert policy["rules"]["expiry"] is not None
    
    def test_create_policy_with_wallet_attachment(self, sample_wallet):
        """Test creating policy and attaching to wallet"""
        wallet_id = sample_wallet["wallet_id"]
        
        payload = {
            "name": "Wallet Specific Policy",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 30000.0
            },
            "wallet_id": wallet_id
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        policy = data["policy"]
        assert wallet_id in policy["attached_wallets"]
    
    def test_create_policy_comprehensive_rules(self):
        """Test policy with all rule types"""
        payload = {
            "name": "Comprehensive Policy",
            "policy_type": "category_restriction",
            "rules": {
                "allowed_categories": ["groceries", "utilities"],
                "max_amount": 75000.0,
                "per_transaction_cap": 5000.0,
                "geo_fence": ["IN-DL"],
                "merchant_whitelist": ["BigBazaar", "DMart"]
            },
            "priority": 1
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        policy = data["policy"]
        assert len(policy["rules"]["allowed_categories"]) == 2
        assert policy["rules"]["max_amount"] == 75000.0
        assert policy["rules"]["per_transaction_cap"] == 5000.0


class TestPolicyValidation:
    """Test policy schema validation"""
    
    def test_category_restriction_missing_categories(self):
        """Test validation fails when required fields missing"""
        payload = {
            "name": "Invalid Category Policy",
            "policy_type": "category_restriction",
            "rules": {
                "max_amount": 10000.0
                # Missing allowed_categories
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 422
    
    def test_spending_limit_missing_amount(self):
        """Test spending limit validation"""
        payload = {
            "name": "Invalid Spending Limit",
            "policy_type": "spending_limit",
            "rules": {
                "period": "monthly"
                # Missing max_amount
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 422
    
    def test_transaction_cap_validation(self):
        """Test transaction cap validation"""
        payload = {
            "name": "Invalid Transaction Cap",
            "policy_type": "transaction_cap",
            "rules": {
                "max_amount": 5000.0
                # Missing per_transaction_cap
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 422
    
    def test_conflicting_caps(self):
        """Test validation catches conflicting caps"""
        payload = {
            "name": "Conflicting Caps",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 5000.0,
                "per_transaction_cap": 10000.0  # Exceeds max_amount
            }
        }
        
        response = client.post("/api/v1/policy/create", json=payload)
        
        assert response.status_code == 422


class TestPolicyRetrieval:
    """Test policy retrieval endpoints"""
    
    @pytest.fixture
    def created_policy(self):
        """Create a policy for testing retrieval"""
        payload = {
            "name": "Test Retrieval Policy",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 25000.0
            }
        }
        response = client.post("/api/v1/policy/create", json=payload)
        return response.json()["policy"]
    
    def test_get_policy_by_id(self, created_policy):
        """Test retrieving policy by ID"""
        policy_id = created_policy["policy_id"]
        
        response = client.get(f"/api/v1/policy/{policy_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["policy_id"] == policy_id
        assert data["name"] == "Test Retrieval Policy"
    
    def test_get_policy_not_found(self):
        """Test 404 for non-existent policy"""
        fake_id = "123e4567-e89b-12d3-a456-426614174999"
        
        response = client.get(f"/api/v1/policy/{fake_id}")
        
        assert response.status_code == 404
    
    def test_list_all_policies(self, created_policy):
        """Test listing all policies"""
        response = client.get("/api/v1/policy/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_list_policies_by_type(self, created_policy):
        """Test filtering policies by type"""
        response = client.get("/api/v1/policy/?policy_type=spending_limit")
        
        assert response.status_code == 200
        data = response.json()
        
        for policy in data:
            assert policy["policy_type"] == "spending_limit"


class TestPolicyWalletAttachment:
    """Test policy-wallet attachment functionality"""
    
    @pytest.fixture
    def wallet_and_policy(self):
        """Create wallet and policy for attachment tests"""
        # Create wallet
        wallet_payload = {
            "owner_id": "attachment_test_user",
            "initial_balance": 50000.0
        }
        wallet_response = client.post("/api/v1/wallet/create", json=wallet_payload)
        wallet = wallet_response.json()["wallet"]
        
        # Create policy
        policy_payload = {
            "name": "Attachment Test Policy",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 30000.0
            }
        }
        policy_response = client.post("/api/v1/policy/create", json=policy_payload)
        policy = policy_response.json()["policy"]
        
        return {"wallet": wallet, "policy": policy}
    
    def test_attach_policy_to_wallet(self, wallet_and_policy):
        """Test attaching existing policy to wallet"""
        wallet_id = wallet_and_policy["wallet"]["wallet_id"]
        policy_id = wallet_and_policy["policy"]["policy_id"]
        
        response = client.post(f"/api/v1/policy/{policy_id}/attach/{wallet_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["policy_id"] == policy_id
        assert data["wallet_id"] == wallet_id
    
    def test_get_wallet_policies(self, wallet_and_policy):
        """Test retrieving all policies for a wallet"""
        wallet_id = wallet_and_policy["wallet"]["wallet_id"]
        policy_id = wallet_and_policy["policy"]["policy_id"]
        
        # Attach policy
        client.post(f"/api/v1/policy/{policy_id}/attach/{wallet_id}")
        
        # Get wallet policies
        response = client.get(f"/api/v1/policy/wallet/{wallet_id}/policies")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check that our policy is in the list
        policy_ids = [p["policy_id"] for p in data]
        assert policy_id in policy_ids


class TestPolicySchema:
    """Test policy schema validation endpoint"""
    
    def test_validate_policy_schema(self):
        """Test policy schema validation"""
        # Create valid policy
        payload = {
            "name": "Schema Test",
            "policy_type": "spending_limit",
            "rules": {
                "max_amount": 50000.0
            }
        }
        create_response = client.post("/api/v1/policy/create", json=payload)
        policy_id = create_response.json()["policy"]["policy_id"]
        
        # Validate schema
        response = client.post(f"/api/v1/policy/{policy_id}/validate")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] is True
        assert len(data["errors"]) == 0
