"""
FastAPI backend package.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

__version__ = "1.0.0"
__author__ = "SAIL Bokaro AI Team"

from .main import app
from .config import settings

__all__ = ['app', 'settings']
