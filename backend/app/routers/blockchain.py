"""
Blockchain supply chain tracking endpoints.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..services.blockchain_service import blockchain_service
from ..utils import app_logger

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


class CreateShipmentRequest(BaseModel):
    """Request to create a shipment."""
    origin: str
    destination: str
    material: str
    quantity: float


class UpdateShipmentRequest(BaseModel):
    """Request to update shipment status."""
    status: str
    location: Optional[str] = None


@router.post("/shipment/create")
async def create_shipment(request: CreateShipmentRequest):
    """
    Create a new shipment record on blockchain.
    
    - **origin**: Origin location
    - **destination**: Destination location
    - **material**: Material type
    - **quantity**: Quantity in tonnes
    """
    try:
        result = blockchain_service.create_shipment(
            origin=request.origin,
            destination=request.destination,
            material=request.material,
            quantity=request.quantity
        )
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Shipment creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create shipment: {str(e)}"
        )


@router.put("/shipment/{shipment_id}/status")
async def update_shipment_status(shipment_id: str, request: UpdateShipmentRequest):
    """
    Update shipment status on blockchain.
    
    - **shipment_id**: Shipment ID
    - **status**: New status (created, in_transit, delivered)
    - **location**: Current location (optional)
    """
    try:
        result = blockchain_service.update_shipment_status(
            shipment_id=shipment_id,
            status=request.status,
            location=request.location
        )
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Shipment update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update shipment: {str(e)}"
        )


@router.get("/shipment/{shipment_id}/history")
async def get_shipment_history(shipment_id: str):
    """
    Get complete history and verification of a shipment.
    
    - **shipment_id**: Shipment ID
    """
    try:
        result = blockchain_service.get_shipment_history(shipment_id)
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Shipment history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve shipment history: {str(e)}"
        )


@router.post("/block/mine")
async def mine_block():
    """
    Mine a new block with pending shipments.
    """
    try:
        result = blockchain_service.mine_block()
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Block mining error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mine block: {str(e)}"
        )


@router.get("/stats")
async def get_blockchain_stats():
    """
    Get blockchain statistics and integrity status.
    """
    try:
        stats = blockchain_service.get_blockchain_stats()
        
        return {
            'status': 'success',
            'data': stats,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Blockchain stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve blockchain stats: {str(e)}"
        )
