"""
Health Check Endpoint
System status monitoring and readiness checks
"""

from fastapi import APIRouter, status
from datetime import datetime

from app.models.response import HealthResponse
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Returns system health status and component availability"
)
async def health_check() -> HealthResponse:
    """
    Health Check Endpoint
    
    Returns:
        HealthResponse: System health status with component details
        
    This endpoint is critical for:
    - Load balancer health checks
    - Monitoring systems
    - Demo readiness validation
    - Service discovery
    """
    logger.info("Health check requested")
    
    # In production, these would be actual service checks
    # For demo, we return operational status
    service_status = {
        "rule_engine": "operational",
        "validation_engine": "operational",
        "ai_service": "operational",
        "ml_service": "operational",
        "clawback_engine": "operational",
        "blockchain_interface": "ready"
    }
    
    response = HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        services=service_status
    )
    
    logger.info(f"Health check passed - Environment: {settings.ENVIRONMENT}")
    
    return response


@router.get(
    "/ready",
    status_code=status.HTTP_200_OK,
    summary="Readiness Check",
    description="Returns whether the service is ready to accept requests"
)
async def readiness_check():
    """
    Readiness Check Endpoint
    
    Returns:
        dict: Readiness status
        
    Used by orchestration systems to determine if the service
    is ready to receive traffic
    """
    return {
        "ready": True,
        "timestamp": datetime.utcnow()
    }


@router.get(
    "/live",
    status_code=status.HTTP_200_OK,
    summary="Liveness Check",
    description="Returns whether the service is alive"
)
async def liveness_check():
    """
    Liveness Check Endpoint
    
    Returns:
        dict: Liveness status
        
    Used by orchestration systems to determine if the service
    needs to be restarted
    """
    return {
        "alive": True,
        "timestamp": datetime.utcnow()
    }
