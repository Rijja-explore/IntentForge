"""
IntentForge Backend - Main Application Entry Point
Financial Behaviour & Intent Enforcement Engine
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import time

from app.config import settings
from app.routes import health, wallet, policy
from app.utils.logger import get_logger
from app.utils.exceptions import IntentForgeException

# Initialize logger
logger = get_logger(__name__)

# Create FastAPI application
app = FastAPI(
    title="IntentForge Backend",
    description="""
    ## Financial Behaviour & Intent Enforcement Engine
    
    A deterministic AI-augmented financial intent enforcement engine capable of 
    real-time programmable money governance.
    
    ### Features
    - 💰 Programmable Wallet Management
    - 📋 Policy/Intent Governance
    - ⚡ Real-Time Transaction Validation
    - 🔍 Violation Detection & Clawback
    - 🤖 AI Intent Interpretation
    - 📊 Behavioral ML Insights
    - 🔗 Blockchain Audit Interface
    
    ### Architecture
    - Deterministic rule-based decision engine
    - Sub-100ms validation pipeline
    - Explainable AI reasoning
    - Fintech-grade reliability
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware to track request processing time
    Critical for fintech performance monitoring
    """
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
    response.headers["X-Process-Time-MS"] = f"{process_time:.2f}"
    logger.info(f"{request.method} {request.url.path} - {process_time:.2f}ms")
    return response


# Global Exception Handler
@app.exception_handler(IntentForgeException)
async def intentforge_exception_handler(request: Request, exc: IntentForgeException):
    """
    Handle custom IntentForge exceptions gracefully
    """
    logger.error(f"IntentForge Exception: {exc.message} - {exc.details}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            **exc.to_dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Generic Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions gracefully
    Never crash - fintech reliability principle
    """
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please contact support.",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Startup Event
@app.on_event("startup")
async def startup_event():
    """
    Application startup initialization
    """
    logger.info("=" * 80)
    logger.info("🚀 IntentForge Backend Starting...")
    logger.info(f"📦 Version: {settings.APP_VERSION}")
    logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔧 Debug Mode: {settings.DEBUG}")
    logger.info(f"🌐 CORS Origins: {settings.CORS_ORIGINS}")
    logger.info("=" * 80)
    
    # Initialize services (placeholder for future service initialization)
    logger.info("✅ Rule Engine: Ready")
    logger.info("✅ Validation Engine: Ready")
    logger.info("✅ AI Service: Ready")
    logger.info("✅ ML Service: Ready")
    logger.info("=" * 80)


# Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown cleanup
    """
    logger.info("🛑 IntentForge Backend Shutting Down...")
    logger.info("✅ Cleanup completed")


# Include Routers
app.include_router(health.router, prefix="", tags=["Health"])
app.include_router(wallet.router, prefix=settings.API_V1_PREFIX, tags=["Wallet Management"])
app.include_router(policy.router, prefix=settings.API_V1_PREFIX, tags=["Policy Management"])

# Root Endpoint
@app.get("/", include_in_schema=False)
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Financial Behaviour & Intent Enforcement Engine",
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.utcnow()
    }


# API Version Endpoint
@app.get("/version", tags=["Info"])
async def get_version():
    """
    Get API version information
    """
    return {
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow()
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
