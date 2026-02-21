"""
Test configuration and fixtures
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """
    FastAPI test client fixture
    """
    return TestClient(app)


@pytest.fixture
def sample_wallet_data():
    """
    Sample wallet creation data for testing
    """
    return {
        "owner_id": "test_user_123",
        "currency": "INR",
        "initial_balance": 10000.0
    }


@pytest.fixture
def sample_policy_data():
    """
    Sample policy creation data for testing
    """
    return {
        "name": "Test Education Policy",
        "policy_type": "category_restriction",
        "rules": {
            "allowed_categories": ["education", "books"],
            "monthly_limit": 5000.0
        },
        "description": "Test policy for education spending"
    }


@pytest.fixture
def sample_transaction_data():
    """
    Sample transaction data for testing
    """
    return {
        "wallet_id": "123e4567-e89b-12d3-a456-426614174000",
        "amount": 500.0,
        "category": "education",
        "merchant": "Udemy",
        "location": "IN-DL",
        "metadata": {"course": "Python Fundamentals"}
    }
