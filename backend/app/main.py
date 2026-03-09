"""
VitalSightAI Backend Application

Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import get_settings
from app.api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Load settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="VitalSightAI",
    description="AI-powered blood report and prescription analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting VitalSightAI...")
    logger.info(f"Model loaded: {settings.app_name}")
    logger.info(f"Debug mode: {settings.debug}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down VitalSightAI...")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "VitalSightAI",
        "version": "1.0.0",
        "description": "AI-powered health analysis platform",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )