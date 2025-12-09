"""
SAP Connector API Router - Phase 3 Feature 1
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.sap_connector_service import SAPConnectorService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/sap", tags=["sap"])

sap_service = SAPConnectorService()

@router.post("/connect")
async def connect_sap(host: str, port: int, username: str, password: str):
    """Connect to SAP system"""
    try:
        result = sap_service.connect_sap(host, port, username, password)
        return result
    except Exception as e:
        logger.error(f"Connect error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/purchase-orders")
async def sync_purchase_orders():
    """Sync purchase orders"""
    try:
        orders = sap_service.sync_purchase_orders()
        return {
            'status': 'success',
            'count': len(orders),
            'orders': orders,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Sync PO error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/sales-orders")
async def sync_sales_orders():
    """Sync sales orders"""
    try:
        orders = sap_service.sync_sales_orders()
        return {
            'status': 'success',
            'count': len(orders),
            'orders': orders,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Sync SO error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/inventory")
async def sync_inventory():
    """Sync inventory"""
    try:
        inventory = sap_service.sync_inventory()
        return {
            'status': 'success',
            'count': len(inventory),
            'inventory': inventory,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Sync inventory error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/suppliers")
async def sync_suppliers():
    """Sync suppliers"""
    try:
        suppliers = sap_service.sync_suppliers()
        return {
            'status': 'success',
            'count': len(suppliers),
            'suppliers': suppliers,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Sync suppliers error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/full")
async def full_sync():
    """Full sync with SAP"""
    try:
        result = sap_service.full_sync()
        return result
    except Exception as e:
        logger.error(f"Full sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/integrations")
async def get_integrations(entity_type: Optional[str] = None, limit: int = 100):
    """Get integrations"""
    try:
        integrations = sap_service.get_integrations(entity_type, limit)
        return {
            'total': len(integrations),
            'integrations': integrations,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get integrations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get SAP connector status"""
    try:
        status = sap_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'sap_connector',
        'timestamp': datetime.now().isoformat()
    }
