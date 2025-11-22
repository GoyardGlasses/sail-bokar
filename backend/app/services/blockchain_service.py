"""
Blockchain Service for transparent supply chain tracking.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import logging
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import hashlib
import uuid

try:
    from web3 import Web3
except ImportError:
    Web3 = None

from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)


@dataclass
class Shipment:
    """Shipment record for blockchain."""
    id: str
    origin: str
    destination: str
    material: str
    quantity: float
    timestamp: str
    status: str = "created"
    hash: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BlockchainBlock:
    """Blockchain block structure."""
    index: int
    timestamp: str
    shipments: List[Shipment]
    previous_hash: str
    hash: str = ""
    
    def calculate_hash(self) -> str:
        """Calculate SHA256 hash of block."""
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'shipments': [s.to_dict() for s in self.shipments],
            'previous_hash': self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()


class BlockchainService:
    """Service for blockchain-based supply chain tracking."""
    
    def __init__(self):
        """Initialize blockchain service."""
        self.logger = app_logger
        self.chain: List[BlockchainBlock] = []
        self.pending_shipments: List[Shipment] = []
        self.shipment_records: Dict[str, Shipment] = {}
        
        # Initialize blockchain
        self._initialize_chain()
    
    def _initialize_chain(self):
        """Initialize blockchain with genesis block."""
        genesis_block = BlockchainBlock(
            index=0,
            timestamp=datetime.now().isoformat(),
            shipments=[],
            previous_hash="0"
        )
        genesis_block.hash = genesis_block.calculate_hash()
        self.chain.append(genesis_block)
        self.logger.info("✅ Blockchain initialized with genesis block")
    
    def create_shipment(self, origin: str, destination: str, material: str, 
                       quantity: float) -> Dict[str, Any]:
        """Create a new shipment record."""
        try:
            shipment_id = str(uuid.uuid4())
            shipment = Shipment(
                id=shipment_id,
                origin=origin,
                destination=destination,
                material=material,
                quantity=quantity,
                timestamp=datetime.now().isoformat(),
                status="created"
            )
            
            # Calculate shipment hash
            shipment_dict = shipment.to_dict()
            shipment_string = json.dumps(shipment_dict, sort_keys=True)
            shipment.hash = hashlib.sha256(shipment_string.encode()).hexdigest()
            
            self.pending_shipments.append(shipment)
            self.shipment_records[shipment_id] = shipment
            
            self.logger.info(f"✅ Created shipment {shipment_id}")
            
            return {
                'status': 'success',
                'shipment_id': shipment_id,
                'hash': shipment.hash,
                'timestamp': shipment.timestamp
            }
        except Exception as e:
            self.logger.error(f"Error creating shipment: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def update_shipment_status(self, shipment_id: str, status: str, 
                              location: Optional[str] = None) -> Dict[str, Any]:
        """Update shipment status."""
        try:
            if shipment_id not in self.shipment_records:
                return {'status': 'error', 'message': 'Shipment not found'}
            
            shipment = self.shipment_records[shipment_id]
            shipment.status = status
            
            self.logger.info(f"✅ Updated shipment {shipment_id} status to {status}")
            
            return {
                'status': 'success',
                'shipment_id': shipment_id,
                'new_status': status,
                'updated_at': datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error updating shipment: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def mine_block(self) -> Dict[str, Any]:
        """Mine a new block with pending shipments."""
        try:
            if not self.pending_shipments:
                return {'status': 'info', 'message': 'No pending shipments to mine'}
            
            new_block = BlockchainBlock(
                index=len(self.chain),
                timestamp=datetime.now().isoformat(),
                shipments=self.pending_shipments.copy(),
                previous_hash=self.chain[-1].hash
            )
            
            new_block.hash = new_block.calculate_hash()
            self.chain.append(new_block)
            
            mined_count = len(self.pending_shipments)
            self.pending_shipments = []
            
            self.logger.info(f"✅ Mined block {new_block.index} with {mined_count} shipments")
            
            return {
                'status': 'success',
                'block_index': new_block.index,
                'block_hash': new_block.hash,
                'shipments_mined': mined_count,
                'timestamp': new_block.timestamp
            }
        except Exception as e:
            self.logger.error(f"Error mining block: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def get_shipment_history(self, shipment_id: str) -> Dict[str, Any]:
        """Get complete history of a shipment."""
        try:
            if shipment_id not in self.shipment_records:
                return {'status': 'error', 'message': 'Shipment not found'}
            
            shipment = self.shipment_records[shipment_id]
            
            # Find which block contains this shipment
            block_info = None
            for block in self.chain:
                for s in block.shipments:
                    if s.id == shipment_id:
                        block_info = {
                            'block_index': block.index,
                            'block_hash': block.hash,
                            'block_timestamp': block.timestamp
                        }
                        break
            
            return {
                'status': 'success',
                'shipment': shipment.to_dict(),
                'block_info': block_info,
                'verification': self._verify_shipment(shipment_id)
            }
        except Exception as e:
            self.logger.error(f"Error retrieving shipment history: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def _verify_shipment(self, shipment_id: str) -> Dict[str, Any]:
        """Verify shipment integrity in blockchain."""
        try:
            if shipment_id not in self.shipment_records:
                return {'verified': False, 'reason': 'Shipment not found'}
            
            shipment = self.shipment_records[shipment_id]
            
            # Verify shipment hash
            shipment_dict = shipment.to_dict()
            shipment_string = json.dumps(shipment_dict, sort_keys=True)
            calculated_hash = hashlib.sha256(shipment_string.encode()).hexdigest()
            
            hash_valid = calculated_hash == shipment.hash
            
            return {
                'verified': hash_valid,
                'hash_valid': hash_valid,
                'shipment_id': shipment_id,
                'verification_timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error verifying shipment: {str(e)}")
            return {'verified': False, 'reason': str(e)}
    
    def get_blockchain_stats(self) -> Dict[str, Any]:
        """Get blockchain statistics."""
        total_shipments = len(self.shipment_records)
        total_blocks = len(self.chain)
        pending_shipments = len(self.pending_shipments)
        
        return {
            'total_blocks': total_blocks,
            'total_shipments': total_shipments,
            'pending_shipments': pending_shipments,
            'genesis_hash': self.chain[0].hash if self.chain else None,
            'latest_block_hash': self.chain[-1].hash if self.chain else None,
            'chain_integrity': self._verify_chain_integrity()
        }
    
    def _verify_chain_integrity(self) -> bool:
        """Verify the integrity of the entire blockchain."""
        try:
            for i in range(1, len(self.chain)):
                current_block = self.chain[i]
                previous_block = self.chain[i - 1]
                
                # Verify hash
                if current_block.hash != current_block.calculate_hash():
                    return False
                
                # Verify previous hash link
                if current_block.previous_hash != previous_block.hash:
                    return False
            
            return True
        except Exception:
            return False


# Global blockchain service instance
blockchain_service = BlockchainService()
