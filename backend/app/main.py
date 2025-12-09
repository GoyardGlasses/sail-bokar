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
from app.routers import blockchain, ai_forecast, advanced_optimization, visualization, scenario_analysis, advanced_models
from app.routers import ml_routes, database, rake_formation, monte_carlo, decision_support, analytics, compliance, ml_models, auto_optimizer, auto_alerts, confidence, auto_report, live_progress, live_data, policy_execution, feedback_loop, sap_connector, model_registry, realtime_delay, data_import_pipeline, rake_optimizer
from app.schemas import BaseResponse

# ML Training Scheduler
try:
    from ml.automated_training_scheduler import start_scheduler, get_scheduler_status, trigger_manual_training, get_training_history
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    app_logger.warning("ML Training Scheduler not available")

# Rake Formation Scheduler
try:
    from app.services.rake_scheduler import start_scheduler as start_rake_scheduler, stop_scheduler as stop_rake_scheduler
    RAKE_SCHEDULER_AVAILABLE = True
except ImportError:
    RAKE_SCHEDULER_AVAILABLE = False
    app_logger.warning("Rake Formation Scheduler not available")

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
    allow_origins=settings.CORS_ORIGINS,
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
app.include_router(advanced_models.router)

# ML Infrastructure routers
app.include_router(ml_routes.router)

# All 17 ML Models routers
app.include_router(ml_models.router)

# Auto-Optimizer routers (Phase 1)
app.include_router(auto_optimizer.router)

# Auto-Alerts routers (Phase 1)
app.include_router(auto_alerts.router)

# Confidence Indicators routers (Phase 1)
app.include_router(confidence.router)

# Auto-Report & Email routers (Phase 1)
app.include_router(auto_report.router)

# Live Progress routers (Phase 1)
app.include_router(live_progress.router)

# Live Data routers (Phase 2)
app.include_router(live_data.router)

# Policy Execution routers (Phase 2)
app.include_router(policy_execution.router)

# Feedback Loop routers (Phase 2)
app.include_router(feedback_loop.router)

# SAP Connector routers (Phase 3)
app.include_router(sap_connector.router)

# Model Registry routers (Phase 3)
app.include_router(model_registry.router)

# Real-Time Delay routers (Phase 3)
app.include_router(realtime_delay.router)

# Database routers
app.include_router(database.router)

# Rake Formation routers
app.include_router(rake_formation.router)

# Global Rake & Transport Optimizer routers
app.include_router(rake_optimizer.router)

# Monte Carlo Simulation routers
app.include_router(monte_carlo.router)

# Decision Support routers
app.include_router(decision_support.router)

# Analytics routers
app.include_router(analytics.router)

# Compliance routers
app.include_router(compliance.router)

# Data Import Pipeline routers
app.include_router(data_import_pipeline.router)

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
                "ml_training": [
                    "GET /ml/training/status",
                    "POST /ml/training/trigger",
                    "GET /ml/training/history",
                ] if SCHEDULER_AVAILABLE else [],
                "database": [
                    "GET /api/database/shipments",
                    "GET /api/database/shipments/summary",
                    "GET /api/database/decisions",
                    "GET /api/database/dispatches",
                    "GET /api/database/dispatches/summary",
                    "GET /api/database/analytics/materials",
                    "GET /api/database/analytics/routes",
                    "GET /api/database/health",
                ],
                "rake_formation": [
                    "GET /api/rake-formation/orders",
                    "GET /api/rake-formation/materials",
                    "GET /api/rake-formation/rakes",
                    "POST /api/rake-formation/plans",
                    "GET /api/rake-formation/plans",
                    "GET /api/rake-formation/health",
                ],
                "rake_scheduler": [
                    "GET /api/rake-formation/scheduler/status",
                    "POST /api/rake-formation/scheduler/trigger",
                    "GET /api/rake-formation/scheduler/history",
                ] if RAKE_SCHEDULER_AVAILABLE else [],
                "monte_carlo_simulation": [
                    "POST /api/monte-carlo/simulate",
                    "POST /api/monte-carlo/sensitivity",
                    "GET /api/monte-carlo/health",
                    "GET /api/monte-carlo/config",
                ],
            }
        }
    )

# ============================================================================
# ML TRAINING SCHEDULER ENDPOINTS
# ============================================================================

@app.get("/ml/training/status", response_model=BaseResponse)
async def get_training_status():
    """Get ML training scheduler status."""
    if not SCHEDULER_AVAILABLE:
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message="ML Training Scheduler not available",
            data=None
        )
    
    try:
        status = get_scheduler_status()
        return BaseResponse(
            status="success",
            timestamp=datetime.utcnow(),
            message="ML Training Scheduler Status",
            data=status
        )
    except Exception as e:
        app_logger.error(f"Error getting scheduler status: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error: {str(e)}",
            data=None
        )

@app.post("/ml/training/trigger", response_model=BaseResponse)
async def trigger_training():
    """Manually trigger ML model training."""
    if not SCHEDULER_AVAILABLE:
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message="ML Training Scheduler not available",
            data=None
        )
    
    try:
        result = trigger_manual_training()
        return BaseResponse(
            status="success" if result.get('status') == 'success' else "error",
            timestamp=datetime.utcnow(),
            message="Manual training triggered",
            data=result
        )
    except Exception as e:
        app_logger.error(f"Error triggering training: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error: {str(e)}",
            data=None
        )

@app.get("/ml/training/history", response_model=BaseResponse)
async def get_training_history_endpoint():
    """Get ML training history."""
    if not SCHEDULER_AVAILABLE:
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message="ML Training Scheduler not available",
            data=None
        )
    
    try:
        history = get_training_history()
        return BaseResponse(
            status="success",
            timestamp=datetime.utcnow(),
            message="ML Training History",
            data=history
        )
    except Exception as e:
        app_logger.error(f"Error getting training history: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error: {str(e)}",
            data=None
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
    error_msg = str(exc)
    app_logger.error(f"Unhandled exception: {error_msg}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "message": error_msg,
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
    
    # Start ML Training Scheduler
    if SCHEDULER_AVAILABLE:
        try:
            start_scheduler()
            app_logger.info("✓ ML Training Scheduler started successfully")
        except Exception as e:
            app_logger.error(f"Failed to start ML Training Scheduler: {e}")
    
    # Start Rake Formation Scheduler
    if RAKE_SCHEDULER_AVAILABLE:
        try:
            start_rake_scheduler()
            app_logger.info("✓ Rake Formation Scheduler started successfully")
        except Exception as e:
            app_logger.error(f"Failed to start Rake Formation Scheduler: {e}")

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
