"""
Vercel serverless function entry point for FastAPI backend.
Routes all requests to the FastAPI application.
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app

# Export the app for Vercel
__all__ = ["app"]
