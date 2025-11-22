"""
Enhanced Blockchain Service for Supply Chain with Advanced Features.
Includes smart contracts simulation, consensus mechanisms, merkle trees,
transaction validation, and comprehensive audit trails.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import hashlib
import json
from collections import defaultdict
import uuid

from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)


@dataclass
class Transaction:
    """Represents a transaction in the blockchain."""
    tx_id: str
    timestamp: str
    from_party: str
    to_party: str
    material: str
    quantity: float
    cost: float
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict:
        return asdict(self)

    def hash(self) -> str:
        """Calculate transaction hash."""
        tx_string = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(tx_string.encode()).hexdigest()


@dataclass
class SmartContract:
    """Represents a smart contract for supply chain rules."""
    contract_id: str
    name: str
    conditions: Dict[str, Any]
    actions: List[str]
    status: str  # active, paused, executed
    created_at: str
    executed_at: Optional[str] = None

    def evaluate(self, transaction: Transaction) -> Tuple[bool, str]:
        """Evaluate if transaction meets contract conditions."""
        for condition_key, condition_value in self.conditions.items():
            if condition_key == 'min_quantity' and transaction.quantity < condition_value:
                return False, f"Quantity {transaction.quantity} below minimum {condition_value}"
            elif condition_key == 'max_cost' and transaction.cost > condition_value:
                return False, f"Cost {transaction.cost} exceeds maximum {condition_value}"
            elif condition_key == 'allowed_materials' and transaction.material not in condition_value:
                return False, f"Material {transaction.material} not allowed"
            elif condition_key == 'allowed_destinations' and transaction.to_party not in condition_value:
                return False, f"Destination {transaction.to_party} not allowed"

        return True, "All conditions met"


@dataclass
class Block:
    """Represents a block in the blockchain."""
    block_id: int
    timestamp: str
    transactions: List[Transaction]
    previous_hash: str
    nonce: int = 0
    miner: str = "system"
    difficulty: int = 4

    def calculate_hash(self) -> str:
        """Calculate block hash using SHA256."""
        block_data = {
            'block_id': self.block_id,
            'timestamp': self.timestamp,
            'transactions': [tx.to_dict() for tx in self.transactions],
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'miner': self.miner
        }
        block_string = json.dumps(block_data, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty: int = 4) -> str:
        """
        Mine block using Proof of Work.
        Find nonce such that hash starts with 'difficulty' number of zeros.
        """
        target = '0' * difficulty
        while True:
            block_hash = self.calculate_hash()
            if block_hash.startswith(target):
                return block_hash
            self.nonce += 1

    def get_merkle_root(self) -> str:
        """Calculate Merkle root of transactions."""
        if not self.transactions:
            return hashlib.sha256(b"").hexdigest()

        transaction_hashes = [tx.hash() for tx in self.transactions]

        while len(transaction_hashes) > 1:
            if len(transaction_hashes) % 2 != 0:
                transaction_hashes.append(transaction_hashes[-1])

            new_hashes = []
            for i in range(0, len(transaction_hashes), 2):
                combined = transaction_hashes[i] + transaction_hashes[i + 1]
                new_hash = hashlib.sha256(combined.encode()).hexdigest()
                new_hashes.append(new_hash)

            transaction_hashes = new_hashes

        return transaction_hashes[0]


class EnhancedBlockchainService:
    """Advanced blockchain service with smart contracts and consensus."""

    def __init__(self):
        """Initialize blockchain service."""
        self.logger = app_logger
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.smart_contracts: Dict[str, SmartContract] = {}
        self.transaction_history: Dict[str, List[Transaction]] = defaultdict(list)
        self.consensus_rules = {
            'min_confirmations': 3,
            'max_block_size': 100,
            'difficulty': 4
        }
        self.audit_log: List[Dict[str, Any]] = []
        self.validators: List[str] = ['validator_1', 'validator_2', 'validator_3']
        self.validation_votes: Dict[str, Dict[str, bool]] = defaultdict(dict)

        self._initialize_chain()

    def _initialize_chain(self):
        """Initialize blockchain with genesis block."""
        genesis_block = Block(
            block_id=0,
            timestamp=datetime.now().isoformat(),
            transactions=[],
            previous_hash="0",
            miner="genesis"
        )
        genesis_hash = genesis_block.mine_block(self.consensus_rules['difficulty'])
        self.chain.append(genesis_block)
        self.logger.info("✅ Enhanced blockchain initialized with genesis block")

    def create_smart_contract(
        self,
        name: str,
        conditions: Dict[str, Any],
        actions: List[str]
    ) -> Dict[str, Any]:
        """Create a new smart contract."""
        contract_id = str(uuid.uuid4())[:8]
        contract = SmartContract(
            contract_id=contract_id,
            name=name,
            conditions=conditions,
            actions=actions,
            status='active',
            created_at=datetime.now().isoformat()
        )

        self.smart_contracts[contract_id] = contract
        self._log_audit('smart_contract_created', {
            'contract_id': contract_id,
            'name': name,
            'conditions': conditions
        })

        return {
            'contract_id': contract_id,
            'name': name,
            'status': 'active',
            'created_at': contract.created_at
        }

    def validate_transaction(
        self,
        transaction: Transaction,
        contract_id: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Validate transaction against smart contracts."""
        if contract_id and contract_id in self.smart_contracts:
            contract = self.smart_contracts[contract_id]
            return contract.evaluate(transaction)

        # Default validation
        if transaction.quantity <= 0:
            return False, "Quantity must be positive"
        if transaction.cost < 0:
            return False, "Cost cannot be negative"

        return True, "Transaction valid"

    def create_shipment(
        self,
        origin: str,
        destination: str,
        material: str,
        quantity: float,
        cost: float,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new shipment transaction."""
        tx_id = str(uuid.uuid4())[:16]
        transaction = Transaction(
            tx_id=tx_id,
            timestamp=datetime.now().isoformat(),
            from_party=origin,
            to_party=destination,
            material=material,
            quantity=quantity,
            cost=cost,
            metadata=metadata or {}
        )

        # Validate transaction
        is_valid, message = self.validate_transaction(transaction)
        if not is_valid:
            return {'status': 'error', 'message': message}

        self.pending_transactions.append(transaction)
        self.transaction_history[tx_id].append(transaction)

        self._log_audit('shipment_created', {
            'tx_id': tx_id,
            'origin': origin,
            'destination': destination,
            'material': material,
            'quantity': quantity,
            'cost': cost
        })

        return {
            'status': 'success',
            'tx_id': tx_id,
            'timestamp': transaction.timestamp,
            'message': 'Shipment created and pending confirmation'
        }

    def update_shipment_status(
        self,
        tx_id: str,
        status: str,
        location: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Update shipment status with location tracking."""
        if tx_id not in self.transaction_history:
            return {'status': 'error', 'message': 'Shipment not found'}

        update_record = {
            'tx_id': tx_id,
            'timestamp': datetime.now().isoformat(),
            'status': status,
            'location': location,
            'metadata': metadata or {}
        }

        self._log_audit('shipment_status_updated', update_record)

        return {
            'status': 'success',
            'tx_id': tx_id,
            'current_status': status,
            'location': location,
            'timestamp': update_record['timestamp']
        }

    def mine_block(self) -> Dict[str, Any]:
        """Mine a new block with pending transactions."""
        if not self.pending_transactions:
            return {'status': 'error', 'message': 'No pending transactions'}

        # Get pending transactions (up to max block size)
        block_transactions = self.pending_transactions[:self.consensus_rules['max_block_size']]

        # Create new block
        new_block = Block(
            block_id=len(self.chain),
            timestamp=datetime.now().isoformat(),
            transactions=block_transactions,
            previous_hash=self.chain[-1].calculate_hash(),
            difficulty=self.consensus_rules['difficulty']
        )

        # Mine block
        block_hash = new_block.mine_block(self.consensus_rules['difficulty'])

        # Add to chain
        self.chain.append(new_block)

        # Remove mined transactions from pending
        self.pending_transactions = self.pending_transactions[len(block_transactions):]

        self._log_audit('block_mined', {
            'block_id': new_block.block_id,
            'block_hash': block_hash,
            'transactions_count': len(block_transactions),
            'nonce': new_block.nonce
        })

        return {
            'status': 'success',
            'block_id': new_block.block_id,
            'block_hash': block_hash,
            'transactions_mined': len(block_transactions),
            'nonce': new_block.nonce,
            'merkle_root': new_block.get_merkle_root()
        }

    def verify_chain_integrity(self) -> Dict[str, Any]:
        """Verify blockchain integrity."""
        issues = []

        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            # Check previous hash
            if current_block.previous_hash != previous_block.calculate_hash():
                issues.append(f"Block {i}: Previous hash mismatch")

            # Check block hash validity
            block_hash = current_block.calculate_hash()
            if not block_hash.startswith('0' * self.consensus_rules['difficulty']):
                issues.append(f"Block {i}: Invalid proof of work")

            # Verify all transactions in block
            for tx in current_block.transactions:
                is_valid, msg = self.validate_transaction(tx)
                if not is_valid:
                    issues.append(f"Block {i}, Transaction {tx.tx_id}: {msg}")

        return {
            'status': 'valid' if not issues else 'invalid',
            'total_blocks': len(self.chain),
            'issues_found': len(issues),
            'issues': issues,
            'integrity_score': round((1 - len(issues) / max(len(self.chain), 1)) * 100, 2)
        }

    def get_shipment_history(self, tx_id: str) -> Dict[str, Any]:
        """Get complete history of a shipment."""
        if tx_id not in self.transaction_history:
            return {'status': 'error', 'message': 'Shipment not found'}

        transactions = self.transaction_history[tx_id]
        history = []

        for tx in transactions:
            history.append({
                'tx_id': tx.tx_id,
                'timestamp': tx.timestamp,
                'from': tx.from_party,
                'to': tx.to_party,
                'material': tx.material,
                'quantity': tx.quantity,
                'cost': tx.cost,
                'metadata': tx.metadata
            })

        return {
            'status': 'success',
            'tx_id': tx_id,
            'history_count': len(history),
            'history': history
        }

    def get_blockchain_statistics(self) -> Dict[str, Any]:
        """Get comprehensive blockchain statistics."""
        total_transactions = sum(len(block.transactions) for block in self.chain)
        total_quantity = sum(
            sum(tx.quantity for tx in block.transactions)
            for block in self.chain
        )
        total_cost = sum(
            sum(tx.cost for tx in block.transactions)
            for block in self.chain
        )

        materials = defaultdict(float)
        for block in self.chain:
            for tx in block.transactions:
                materials[tx.material] += tx.quantity

        return {
            'status': 'success',
            'blockchain_stats': {
                'total_blocks': len(self.chain),
                'total_transactions': total_transactions,
                'pending_transactions': len(self.pending_transactions),
                'total_quantity_shipped': round(total_quantity, 2),
                'total_cost': round(total_cost, 2),
                'average_block_size': round(total_transactions / len(self.chain), 2),
                'chain_integrity': self.verify_chain_integrity()['status']
            },
            'materials_tracked': dict(materials),
            'validators': self.validators,
            'consensus_rules': self.consensus_rules,
            'audit_log_entries': len(self.audit_log)
        }

    def get_audit_log(self, limit: int = 100) -> Dict[str, Any]:
        """Get audit log entries."""
        return {
            'status': 'success',
            'total_entries': len(self.audit_log),
            'entries': self.audit_log[-limit:]
        }

    def _log_audit(self, action: str, details: Dict[str, Any]):
        """Log action to audit trail."""
        self.audit_log.append({
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'details': details
        })

    def export_blockchain(self) -> Dict[str, Any]:
        """Export entire blockchain for backup/analysis."""
        blocks_data = []
        for block in self.chain:
            blocks_data.append({
                'block_id': block.block_id,
                'timestamp': block.timestamp,
                'transactions_count': len(block.transactions),
                'previous_hash': block.previous_hash,
                'block_hash': block.calculate_hash(),
                'nonce': block.nonce,
                'merkle_root': block.get_merkle_root(),
                'miner': block.miner
            })

        return {
            'status': 'success',
            'export_timestamp': datetime.now().isoformat(),
            'total_blocks': len(self.chain),
            'blocks': blocks_data,
            'pending_transactions': len(self.pending_transactions),
            'smart_contracts': len(self.smart_contracts)
        }


# Global instance
enhanced_blockchain_service = EnhancedBlockchainService()
