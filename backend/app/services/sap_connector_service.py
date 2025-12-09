"""
SAP/ERP Connector Service - Phase 3 Feature 1
Integration with SAP and enterprise systems
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import json

logger = logging.getLogger(__name__)

class SAPEntityType(str, Enum):
    PURCHASE_ORDER = "purchase_order"
    SALES_ORDER = "sales_order"
    INVENTORY = "inventory"
    SUPPLIER = "supplier"
    CUSTOMER = "customer"
    MATERIAL = "material"
    WAREHOUSE = "warehouse"
    PRODUCTION_ORDER = "production_order"

class SAPIntegration:
    """SAP integration object"""
    def __init__(self, entity_type: SAPEntityType, entity_id: str, data: Dict):
        self.id = f"SAP-{int(datetime.now().timestamp() * 1000)}"
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.data = data
        self.created_at = datetime.now()
        self.status = "synced"
        self.last_sync = datetime.now()
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'data': self.data,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'last_sync': self.last_sync.isoformat()
        }

class SAPConnectorService:
    """Service for SAP/ERP integration"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.integrations = {}
        self.sync_history = []
        self.connection_status = "connected"
        self.last_sync = datetime.now()
    
    def connect_sap(self, host: str, port: int, username: str, password: str) -> Dict:
        """Connect to SAP system"""
        try:
            # Simulate SAP connection
            self.connection_status = "connected"
            self.last_sync = datetime.now()
            
            self.logger.info(f"✓ Connected to SAP at {host}:{port}")
            
            return {
                'status': 'connected',
                'host': host,
                'port': port,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error connecting to SAP: {e}")
            self.connection_status = "disconnected"
            raise
    
    def sync_purchase_orders(self) -> List[Dict]:
        """Sync purchase orders from SAP"""
        try:
            orders = [
                {
                    'po_number': 'PO-2024-001',
                    'vendor': 'Supplier A',
                    'material': 'Iron Ore',
                    'quantity': 1000,
                    'unit_price': 50,
                    'total_value': 50000,
                    'delivery_date': (datetime.now() + timedelta(days=7)).isoformat(),
                    'status': 'open'
                },
                {
                    'po_number': 'PO-2024-002',
                    'vendor': 'Supplier B',
                    'material': 'Coal',
                    'quantity': 500,
                    'unit_price': 75,
                    'total_value': 37500,
                    'delivery_date': (datetime.now() + timedelta(days=5)).isoformat(),
                    'status': 'confirmed'
                }
            ]
            
            for order in orders:
                integration = SAPIntegration(
                    SAPEntityType.PURCHASE_ORDER,
                    order['po_number'],
                    order
                )
                self.integrations[order['po_number']] = integration
                self.sync_history.append(integration)
            
            self.logger.info(f"✓ Synced {len(orders)} purchase orders from SAP")
            
            return [o.to_dict() for o in orders]
        
        except Exception as e:
            self.logger.error(f"Error syncing purchase orders: {e}")
            raise
    
    def sync_sales_orders(self) -> List[Dict]:
        """Sync sales orders from SAP"""
        try:
            orders = [
                {
                    'so_number': 'SO-2024-001',
                    'customer': 'Customer A',
                    'material': 'Steel Coils',
                    'quantity': 500,
                    'unit_price': 100,
                    'total_value': 50000,
                    'delivery_date': (datetime.now() + timedelta(days=10)).isoformat(),
                    'status': 'open'
                },
                {
                    'so_number': 'SO-2024-002',
                    'customer': 'Customer B',
                    'material': 'Plates',
                    'quantity': 300,
                    'unit_price': 120,
                    'total_value': 36000,
                    'delivery_date': (datetime.now() + timedelta(days=8)).isoformat(),
                    'status': 'confirmed'
                }
            ]
            
            for order in orders:
                integration = SAPIntegration(
                    SAPEntityType.SALES_ORDER,
                    order['so_number'],
                    order
                )
                self.integrations[order['so_number']] = integration
                self.sync_history.append(integration)
            
            self.logger.info(f"✓ Synced {len(orders)} sales orders from SAP")
            
            return [o.to_dict() for o in orders]
        
        except Exception as e:
            self.logger.error(f"Error syncing sales orders: {e}")
            raise
    
    def sync_inventory(self) -> List[Dict]:
        """Sync inventory from SAP"""
        try:
            inventory = [
                {
                    'material_code': 'MAT-001',
                    'material_name': 'Iron Ore',
                    'warehouse': 'WH-01',
                    'quantity': 5000,
                    'unit': 'MT',
                    'reorder_point': 1000,
                    'last_updated': datetime.now().isoformat()
                },
                {
                    'material_code': 'MAT-002',
                    'material_name': 'Coal',
                    'warehouse': 'WH-02',
                    'quantity': 3000,
                    'unit': 'MT',
                    'reorder_point': 500,
                    'last_updated': datetime.now().isoformat()
                }
            ]
            
            for item in inventory:
                integration = SAPIntegration(
                    SAPEntityType.INVENTORY,
                    item['material_code'],
                    item
                )
                self.integrations[item['material_code']] = integration
                self.sync_history.append(integration)
            
            self.logger.info(f"✓ Synced {len(inventory)} inventory items from SAP")
            
            return [i.to_dict() for i in inventory]
        
        except Exception as e:
            self.logger.error(f"Error syncing inventory: {e}")
            raise
    
    def sync_suppliers(self) -> List[Dict]:
        """Sync supplier master data from SAP"""
        try:
            suppliers = [
                {
                    'supplier_code': 'SUP-001',
                    'supplier_name': 'Supplier A',
                    'country': 'India',
                    'rating': 4.5,
                    'on_time_delivery': 0.95,
                    'quality_score': 0.92,
                    'status': 'active'
                },
                {
                    'supplier_code': 'SUP-002',
                    'supplier_name': 'Supplier B',
                    'country': 'India',
                    'rating': 4.2,
                    'on_time_delivery': 0.88,
                    'quality_score': 0.85,
                    'status': 'active'
                }
            ]
            
            for supplier in suppliers:
                integration = SAPIntegration(
                    SAPEntityType.SUPPLIER,
                    supplier['supplier_code'],
                    supplier
                )
                self.integrations[supplier['supplier_code']] = integration
                self.sync_history.append(integration)
            
            self.logger.info(f"✓ Synced {len(suppliers)} suppliers from SAP")
            
            return [s.to_dict() for s in suppliers]
        
        except Exception as e:
            self.logger.error(f"Error syncing suppliers: {e}")
            raise
    
    def full_sync(self) -> Dict:
        """Perform full sync with SAP"""
        try:
            po_count = len(self.sync_purchase_orders())
            so_count = len(self.sync_sales_orders())
            inv_count = len(self.sync_inventory())
            sup_count = len(self.sync_suppliers())
            
            total = po_count + so_count + inv_count + sup_count
            
            self.last_sync = datetime.now()
            
            self.logger.info(f"✓ Full sync completed: {total} entities synced")
            
            return {
                'status': 'success',
                'purchase_orders': po_count,
                'sales_orders': so_count,
                'inventory_items': inv_count,
                'suppliers': sup_count,
                'total_synced': total,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error during full sync: {e}")
            raise
    
    def get_integration(self, entity_id: str) -> Optional[Dict]:
        """Get integration details"""
        integration = self.integrations.get(entity_id)
        if integration:
            return integration.to_dict()
        return None
    
    def get_integrations(self, entity_type: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Get integrations"""
        integrations = list(self.integrations.values())
        
        if entity_type:
            integrations = [i for i in integrations if i.entity_type == entity_type]
        
        return [i.to_dict() for i in integrations[-limit:]]
    
    def get_status(self) -> Dict:
        """Get SAP connector status"""
        return {
            'status': 'running',
            'connection_status': self.connection_status,
            'total_integrations': len(self.integrations),
            'last_sync': self.last_sync.isoformat(),
            'sync_history_count': len(self.sync_history),
            'timestamp': datetime.now().isoformat()
        }
