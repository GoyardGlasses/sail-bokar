"""
Database Initialization Script
Creates all tables and seeds initial data for SAIL Bokaro system
Run this once to set up the database
"""

import logging
from datetime import datetime, timedelta
import random
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/sihdb"

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

def init_database():
    """Initialize database with all tables and initial data"""
    
    logger.info("="*80)
    logger.info("INITIALIZING SAIL BOKARO DATABASE")
    logger.info("="*80)
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        logger.info("✓ Connected to PostgreSQL")
        
        # Create all tables
        logger.info("\n[1/4] Creating database tables...")
        create_tables(engine)
        
        # Seed historical data
        logger.info("\n[2/4] Seeding historical shipment data...")
        seed_historical_shipments(engine)
        
        # Seed historical decisions
        logger.info("\n[3/4] Seeding historical decision data...")
        seed_historical_decisions(engine)
        
        # Seed historical dispatches
        logger.info("\n[4/4] Seeding historical dispatch data...")
        seed_historical_dispatches(engine)
        
        logger.info("\n" + "="*80)
        logger.info("✓ DATABASE INITIALIZATION COMPLETE!")
        logger.info("="*80)
        logger.info("\nDatabase ready for use:")
        logger.info("  - URL: postgresql://postgres:postgres@localhost:5432/sihdb")
        logger.info("  - Tables: 3 (historical_shipments, historical_decisions, historical_dispatches)")
        logger.info("  - Records: 800+ (500 shipments, 300 decisions, 400+ dispatches)")
        
        engine.dispose()
        return True
        
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
        return False


def create_tables(engine):
    """Create all required tables"""
    
    sql_statements = [
        # Historical Shipments Table
        """
        CREATE TABLE IF NOT EXISTS historical_shipments (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            route VARCHAR(50) NOT NULL,
            material VARCHAR(50) NOT NULL,
            tonnage FLOAT NOT NULL,
            planned_days INTEGER,
            actual_days INTEGER,
            delay_days INTEGER,
            cost FLOAT,
            cost_per_tonne FLOAT,
            weather VARCHAR(50),
            traffic_level VARCHAR(50),
            risk_score FLOAT,
            status VARCHAR(50),
            accuracy FLOAT,
            thickness VARCHAR(50),
            width VARCHAR(50),
            length VARCHAR(50),
            density FLOAT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Historical Decisions Table
        """
        CREATE TABLE IF NOT EXISTS historical_decisions (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            scenario VARCHAR(100),
            decisions JSONB,
            route VARCHAR(50),
            material VARCHAR(50),
            tonnage FLOAT,
            severity VARCHAR(50),
            outcome VARCHAR(50),
            cost_impact FLOAT,
            time_impact FLOAT,
            satisfaction_impact FLOAT,
            complexity FLOAT,
            risk_mitigated FLOAT,
            decision_maker VARCHAR(100),
            thickness VARCHAR(50),
            width VARCHAR(50),
            length VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Historical Dispatches Table
        """
        CREATE TABLE IF NOT EXISTS historical_dispatches (
            id SERIAL PRIMARY KEY,
            order_id VARCHAR(50) UNIQUE,
            customer_id VARCHAR(50),
            customer_name VARCHAR(100),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            dispatch_time VARCHAR(10),
            route VARCHAR(50),
            material VARCHAR(50),
            tonnage FLOAT,
            vehicle VARCHAR(50),
            driver VARCHAR(100),
            reason VARCHAR(200),
            status VARCHAR(50),
            dispatch_type VARCHAR(50),
            distance FLOAT,
            planned_days INTEGER,
            actual_days INTEGER,
            delay_days INTEGER,
            expected_delivery VARCHAR(20),
            actual_delivery VARCHAR(20),
            cost_per_tonne FLOAT,
            total_cost FLOAT,
            cost_optimization FLOAT,
            quality_score FLOAT,
            damage_percentage FLOAT,
            temperature_variation FLOAT,
            fuel_consumed FLOAT,
            satisfaction_score FLOAT,
            thickness VARCHAR(50),
            width VARCHAR(50),
            length VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Create indexes for better performance
        """
        CREATE INDEX IF NOT EXISTS idx_historical_shipments_route 
        ON historical_shipments(route);
        """,
        
        """
        CREATE INDEX IF NOT EXISTS idx_historical_shipments_material 
        ON historical_shipments(material);
        """,
        
        """
        CREATE INDEX IF NOT EXISTS idx_historical_shipments_date 
        ON historical_shipments(date);
        """,
        
        """
        CREATE INDEX IF NOT EXISTS idx_historical_dispatches_route 
        ON historical_dispatches(route);
        """,
        
        """
        CREATE INDEX IF NOT EXISTS idx_historical_dispatches_material 
        ON historical_dispatches(material);
        """,
    ]
    
    try:
        with engine.connect() as conn:
            for sql in sql_statements:
                conn.execute(text(sql))
            conn.commit()
        logger.info("✓ All tables created successfully")
    except Exception as e:
        logger.error(f"✗ Error creating tables: {e}")
        raise


def seed_historical_shipments(engine):
    """Seed historical shipment data"""
    
    routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 
              'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
    materials = ['cr_coils', 'hr_coils', 'plates', 'sheets']
    weather_types = ['clear', 'rainy', 'foggy', 'stormy']
    traffic_levels = ['low', 'medium', 'high', 'very-high']
    statuses = ['delivered', 'delayed', 'on-time', 'cancelled']
    
    material_specs = {
        'cr_coils': {'thickness': '0.5-3.0mm', 'width': '600-1500mm', 'length': 'coil', 'density': 7.85},
        'hr_coils': {'thickness': '1.2-12.7mm', 'width': '600-1500mm', 'length': 'coil', 'density': 7.85},
        'plates': {'thickness': '3-100mm', 'width': '1000-2000mm', 'length': '2000-6000mm', 'density': 7.85},
        'sheets': {'thickness': '0.4-2.0mm', 'width': '800-1500mm', 'length': '2000-4000mm', 'density': 7.85},
    }
    
    try:
        with engine.connect() as conn:
            start_date = datetime(2023, 1, 1)
            
            for i in range(500):
                date = start_date + timedelta(days=i)
                route = random.choice(routes)
                material = random.choice(materials)
                specs = material_specs[material]
                
                tonnage = random.randint(10, 100)
                planned_days = random.randint(3, 10)
                actual_days = planned_days + random.randint(-1, 5)
                delay_days = max(0, actual_days - planned_days)
                cost_per_tonne = random.randint(200, 500)
                total_cost = tonnage * cost_per_tonne
                
                weather = random.choice(weather_types)
                traffic = random.choice(traffic_levels)
                status = random.choice(statuses)
                
                base_risk = random.randint(10, 30)
                weather_risk = 20 if weather == 'stormy' else 10 if weather == 'rainy' else 0
                traffic_risk = 15 if traffic == 'very-high' else 8 if traffic == 'high' else 0
                risk_score = min(100, base_risk + weather_risk + traffic_risk)

                # Human-readable notes combining key contextual factors
                notes_parts = [
                    f"Route: {route}",
                    f"Material: {material}",
                    f"Tonnage: {tonnage}T",
                    f"Weather: {weather}",
                    f"Traffic: {traffic}",
                ]
                if delay_days > 0:
                    notes_parts.append(f"Delayed by {delay_days} days vs plan ({planned_days}->{actual_days})")
                else:
                    notes_parts.append("Delivered on or before planned schedule")
                if risk_score >= 60:
                    notes_parts.append("High logistics risk due to combined weather and congestion")
                elif risk_score >= 30:
                    notes_parts.append("Moderate risk run with some disruption factors")
                else:
                    notes_parts.append("Low-risk shipment under normal operating conditions")

                shipment_notes = " | ".join(notes_parts)
                
                sql = text("""
                    INSERT INTO historical_shipments 
                    (date, route, material, tonnage, planned_days, actual_days, delay_days,
                     cost, cost_per_tonne, weather, traffic_level, risk_score, status, accuracy,
                     thickness, width, length, density, notes)
                    VALUES (:date, :route, :material, :tonnage, :planned_days, :actual_days, :delay_days,
                            :cost, :cost_per_tonne, :weather, :traffic_level, :risk_score, :status, :accuracy,
                            :thickness, :width, :length, :density, :notes)
                """)
                
                conn.execute(sql, {
                    'date': date,
                    'route': route,
                    'material': material,
                    'tonnage': tonnage,
                    'planned_days': planned_days,
                    'actual_days': actual_days,
                    'delay_days': delay_days,
                    'cost': total_cost,
                    'cost_per_tonne': cost_per_tonne,
                    'weather': weather,
                    'traffic_level': traffic,
                    'risk_score': risk_score,
                    'status': status,
                    'accuracy': random.randint(80, 100),
                    'thickness': specs['thickness'],
                    'width': specs['width'],
                    'length': specs['length'],
                    'density': specs['density'],
                    'notes': shipment_notes,
                })
            
            conn.commit()
        logger.info("✓ Seeded 500 historical shipment records")
    except Exception as e:
        logger.error(f"✗ Error seeding shipments: {e}")
        raise


def seed_historical_decisions(engine):
    """Seed historical decision data"""
    
    scenarios = ['High Demand Surge', 'Route Blockage', 'Material Shortage', 'Weather Crisis',
                 'Cost Spike', 'Capacity Crunch', 'Quality Issue', 'Supplier Delay']
    routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 
              'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
    materials = ['cr_coils', 'hr_coils', 'plates', 'sheets']
    outcomes = ['Success', 'Partial Success', 'Failed', 'Pending']
    decision_makers = ['Planner A', 'Planner B', 'Planner C', 'Senior Manager', 'Control Room']
    
    material_specs = {
        'cr_coils': {'thickness': '0.5-3.0mm', 'width': '600-1500mm', 'length': 'coil'},
        'hr_coils': {'thickness': '1.2-12.7mm', 'width': '600-1500mm', 'length': 'coil'},
        'plates': {'thickness': '3-100mm', 'width': '1000-2000mm', 'length': '2000-6000mm'},
        'sheets': {'thickness': '0.4-2.0mm', 'width': '800-1500mm', 'length': '2000-4000mm'},
    }
    
    try:
        with engine.connect() as conn:
            start_date = datetime(2023, 1, 1)
            
            for i in range(300):
                date = start_date + timedelta(days=i)
                scenario = random.choice(scenarios)
                route = random.choice(routes)
                material = random.choice(materials)
                specs = material_specs[material]
                outcome = random.choice(outcomes)
                severity = random.choice(['low', 'medium', 'high'])
                tonnage = random.randint(10, 100)
                cost_impact = random.randint(-5000, 5000)
                time_impact = random.randint(-2, 5)
                satisfaction_impact = random.randint(-20, 20)
                complexity = random.uniform(0.2, 0.9)
                risk_mitigated = random.uniform(0.1, 0.95)
                decision_maker = random.choice(decision_makers)

                actions = []
                if scenario in ['High Demand Surge', 'Capacity Crunch']:
                    actions.append('prioritize_high_value_orders')
                    actions.append('activate_additional_trucks')
                if scenario in ['Route Blockage', 'Weather Crisis']:
                    actions.append('reroute_via_alternate_path')
                    actions.append('reschedule_low_priority_orders')
                if scenario in ['Material Shortage', 'Supplier Delay']:
                    actions.append('switch_stockyard_source')
                if not actions:
                    actions.append('standard_operating_plan')

                decisions_payload = {
                    'actions': actions,
                    'chosen_route': route,
                    'material': material,
                    'tonnage': tonnage,
                    'severity': severity,
                    'outcome': outcome,
                    'cost_impact': cost_impact,
                    'time_impact_hours': time_impact,
                    'satisfaction_delta': satisfaction_impact,
                    'risk_mitigated_score': round(risk_mitigated, 2),
                }

                notes_parts = [
                    f"Scenario: {scenario}",
                    f"Route: {route}",
                    f"Material: {material}",
                    f"Severity: {severity}",
                    f"Outcome: {outcome}",
                    f"Decision maker: {decision_maker}",
                ]
                if time_impact > 0:
                    notes_parts.append(f"Decision caused +{time_impact} days impact on schedule")
                elif time_impact < 0:
                    notes_parts.append(f"Decision recovered {-time_impact} days vs baseline plan")
                if cost_impact > 0:
                    notes_parts.append(f"Additional cost of ₹{cost_impact}")
                elif cost_impact < 0:
                    notes_parts.append(f"Saved approximately ₹{-cost_impact} through optimization")

                decision_notes = " | ".join(notes_parts)
                
                sql = text("""
                    INSERT INTO historical_decisions 
                    (date, scenario, decisions, route, material, tonnage, severity, outcome,
                     cost_impact, time_impact, satisfaction_impact, complexity, risk_mitigated,
                     decision_maker, thickness, width, length, notes)
                    VALUES (:date, :scenario, :decisions, :route, :material, :tonnage, :severity, :outcome,
                            :cost_impact, :time_impact, :satisfaction_impact, :complexity, :risk_mitigated,
                            :decision_maker, :thickness, :width, :length, :notes)
                """)
                
                conn.execute(sql, {
                    'date': date,
                    'scenario': scenario,
                    'decisions': json.dumps(decisions_payload),
                    'route': route,
                    'material': material,
                    'tonnage': tonnage,
                    'severity': severity,
                    'outcome': outcome,
                    'cost_impact': cost_impact,
                    'time_impact': time_impact,
                    'satisfaction_impact': satisfaction_impact,
                    'complexity': complexity,
                    'risk_mitigated': risk_mitigated,
                    'decision_maker': decision_maker,
                    'thickness': specs['thickness'],
                    'width': specs['width'],
                    'length': specs['length'],
                    'notes': decision_notes,
                })
            
            conn.commit()
        logger.info("✓ Seeded 300 historical decision records")
    except Exception as e:
        logger.error(f"✗ Error seeding decisions: {e}")
        raise


def seed_historical_dispatches(engine):
    """Seed historical dispatch data"""
    
    routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 
              'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
    materials = ['cr_coils', 'hr_coils', 'plates', 'sheets']
    vehicles = [f'Truck-{i:03d}' for i in range(1, 11)]
    drivers = ['Driver Rajesh', 'Driver Amit', 'Driver Priya', 'Driver Vikram', 
               'Driver Neha', 'Driver Arjun', 'Driver Deepak', 'Driver Sanjay']
    statuses = ['delivered', 'in-transit', 'delayed', 'diverted', 'completed']
    dispatch_types = ['standard', 'express', 'economy', 'premium', 'emergency']
    
    material_specs = {
        'cr_coils': {'thickness': '0.5-3.0mm', 'width': '600-1500mm', 'length': 'coil'},
        'hr_coils': {'thickness': '1.2-12.7mm', 'width': '600-1500mm', 'length': 'coil'},
        'plates': {'thickness': '3-100mm', 'width': '1000-2000mm', 'length': '2000-6000mm'},
        'sheets': {'thickness': '0.4-2.0mm', 'width': '800-1500mm', 'length': '2000-4000mm'},
    }
    
    route_distances = {
        'bokaro-dhanbad': 85,
        'bokaro-hatia': 120,
        'bokaro-kolkata': 250,
        'bokaro-patna': 200,
        'bokaro-ranchi': 150,
        'bokaro-durgapur': 100,
        'bokaro-haldia': 300,
    }
    
    try:
        with engine.connect() as conn:
            start_date = datetime(2023, 1, 1)
            
            for i in range(400):
                date = start_date + timedelta(days=i)
                route = random.choice(routes)
                material = random.choice(materials)
                specs = material_specs[material]
                
                tonnage = random.randint(10, 100)
                planned_days = random.randint(3, 10)
                actual_days = planned_days + random.randint(-1, 5)
                delay_days = max(0, actual_days - planned_days)
                
                cost_per_tonne = random.randint(200, 500)
                total_cost = tonnage * cost_per_tonne

                customer_name = random.choice(['Tata Steel', 'JSW Steel', 'SAIL', 'Essar Steel', 'ArcelorMittal'])
                vehicle = random.choice(vehicles)
                driver = random.choice(drivers)
                status = random.choice(statuses)
                dispatch_type = random.choice(dispatch_types)

                notes_parts = [
                    f"Customer: {customer_name}",
                    f"Route: {route}",
                    f"Material: {material}",
                    f"Tonnage: {tonnage}T",
                    f"Dispatch type: {dispatch_type}",
                    f"Vehicle: {vehicle}",
                    f"Driver: {driver}",
                    f"Status: {status}",
                ]
                if delay_days > 0:
                    notes_parts.append(f"Delayed by {delay_days} days vs planned {planned_days}")
                else:
                    notes_parts.append("On-time or early delivery against plan")
                notes_parts.append(f"Approx. logistics cost ₹{total_cost}")

                dispatch_notes = " | ".join(notes_parts)
                
                sql = text("""
                    INSERT INTO historical_dispatches 
                    (order_id, customer_id, customer_name, date, dispatch_time, route, material,
                     tonnage, vehicle, driver, status, dispatch_type, distance, planned_days,
                     actual_days, delay_days, cost_per_tonne, total_cost, quality_score,
                     damage_percentage, fuel_consumed, satisfaction_score,
                     thickness, width, length, notes)
                    VALUES (:order_id, :customer_id, :customer_name, :date, :dispatch_time, :route, :material,
                            :tonnage, :vehicle, :driver, :status, :dispatch_type, :distance, :planned_days,
                            :actual_days, :delay_days, :cost_per_tonne, :total_cost, :quality_score,
                            :damage_percentage, :fuel_consumed, :satisfaction_score,
                            :thickness, :width, :length, :notes)
                """)
                
                conn.execute(sql, {
                    'order_id': f'ORD-{i+1000}',
                    'customer_id': f'CUST-{random.randint(1, 500):03d}',
                    'customer_name': customer_name,
                    'date': date,
                    'dispatch_time': f'{random.randint(6, 22):02d}:00',
                    'route': route,
                    'material': material,
                    'tonnage': tonnage,
                    'vehicle': vehicle,
                    'driver': driver,
                    'status': status,
                    'dispatch_type': dispatch_type,
                    'distance': route_distances[route],
                    'planned_days': planned_days,
                    'actual_days': actual_days,
                    'delay_days': delay_days,
                    'cost_per_tonne': cost_per_tonne,
                    'total_cost': total_cost,
                    'quality_score': random.randint(60, 100),
                    'damage_percentage': random.uniform(0, 5),
                    'fuel_consumed': random.randint(50, 200),
                    'satisfaction_score': random.randint(3, 5),
                    'thickness': specs['thickness'],
                    'width': specs['width'],
                    'length': specs['length'],
                    'notes': dispatch_notes,
                })
            
            conn.commit()
        logger.info("✓ Seeded 400+ historical dispatch records")
    except Exception as e:
        logger.error(f"✗ Error seeding dispatches: {e}")
        raise


if __name__ == '__main__':
    success = init_database()
    exit(0 if success else 1)
