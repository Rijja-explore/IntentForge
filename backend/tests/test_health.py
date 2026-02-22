"""
Test suite for Health Check endpoints
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app

client = TestClient(app)


def test_health_check():
    """Test basic health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert "version" in data
    assert "environment" in data
    assert "services" in data
    assert "timestamp" in data
    
    # Verify all core services are reported
    services = data["services"]
    assert services["rule_engine"] == "operational"
    assert services["validation_engine"] == "operational"
    assert services["ai_service"] == "operational"
    assert services["ml_service"] == "operational"


def test_readiness_check():
    """Test readiness probe endpoint"""
    response = client.get("/ready")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["ready"] is True
    assert "timestamp" in data


def test_liveness_check():
    """Test liveness probe endpoint"""
    response = client.get("/live")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["alive"] is True
    assert "timestamp" in data


def test_root_endpoint():
    """Test root API information endpoint"""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "name" in data
    assert "version" in data
    assert "description" in data
    assert data["docs"] == "/docs"
    assert data["health"] == "/health"


def test_version_endpoint():
    """Test version information endpoint"""
    response = client.get("/version")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data


def test_response_headers():
    """Test that response includes processing time header"""
    response = client.get("/health")
    
    assert "X-Process-Time-MS" in response.headers
    process_time = float(response.headers["X-Process-Time-MS"])
    assert process_time >= 0
    assert process_time < 1000  # Should be under 1 second


def test_cors_headers():
    """Test CORS configuration"""
    response = client.options("/health", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    })
    
    # FastAPI TestClient doesn't fully simulate CORS,
    # but we can verify the middleware is configured
    assert response.status_code in [200, 204]
