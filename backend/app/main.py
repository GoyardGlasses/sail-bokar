"""
FastAPI main application.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.utils import app_logger
from app.routers import forecast, delay, throughput, cost, mode, optimize, meta
from app.routers import blockchain, ai_forecast, advanced_optimization, visualization, scenario_analysis
from app.schemas import BaseResponse

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="ML-powered logistics optimization backend for SAIL Bokaro",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ============================================================================
# MIDDLEWARE
# ============================================================================

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# ============================================================================
# ROUTERS
# ============================================================================

app.include_router(forecast.router)
app.include_router(delay.router)
app.include_router(throughput.router)
app.include_router(cost.router)
app.include_router(mode.router)
app.include_router(optimize.router)
app.include_router(meta.router)

# Advanced features routers
app.include_router(blockchain.router)
app.include_router(ai_forecast.router)
app.include_router(advanced_optimization.router)
app.include_router(visualization.router)
app.include_router(scenario_analysis.router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/", response_model=BaseResponse)
async def root():
    """Root endpoint."""
    return BaseResponse(
        status="success",
        timestamp=datetime.utcnow(),
        message=f"Welcome to {settings.APP_NAME} v{settings.APP_VERSION}",
        data={
            "api_docs": "/api/docs",
            "health": "/meta/health",
            "models": "/meta/models",
        }
    )

@app.get("/api", response_model=BaseResponse)
async def api_info():
    """API information endpoint."""
    return BaseResponse(
        status="success",
        timestamp=datetime.utcnow(),
        message="SAIL Bokaro Logistics Optimization API",
        data={
            "version": settings.APP_VERSION,
            "endpoints": {
                "forecasting": [
                    "POST /predict/demand",
                    "POST /predict/rake-availability",
                ],
                "predictions": [
                    "POST /predict/delay",
                    "POST /predict/throughput",
                    "POST /predict/cost",
                    "POST /predict/mode",
                ],
                "optimization": [
                    "POST /optimize/dispatch",
                ],
                "metadata": [
                    "GET /meta/health",
                    "GET /meta/models",
                    "GET /meta/config",
                ],
            }
        }
    )

# ============================================================================
# EXCEPTION HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "message": exc.detail,
            "error_code": exc.status_code,
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler."""
    app_logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Internal server error",
            "error_code": 500,
        }
    )

# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Startup event."""
    app_logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    app_logger.info(f"Debug mode: {settings.DEBUG}")
    app_logger.info(f"Models directory: {settings.MODELS_DIR}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event."""
    app_logger.info(f"Shutting down {settings.APP_NAME}")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower(),
    )
