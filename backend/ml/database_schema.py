"""
Database Schema for ML Models and Data Storage
Handles all persistent data for ML training and predictions
"""

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# ============================================================================
# HISTORICAL DATA TABLES
# ============================================================================

class HistoricalShipment(Base):
    """Historical shipment records for training"""
    __tablename__ = "historical_shipments"
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    route = Column(String(50))
    material = Column(String(50))
    tonnage = Column(Float)
    planned_days = Column(Integer)
    actual_days = Column(Integer)
    delay_days = Column(Integer)
    cost = Column(Float)
    cost_per_tonne = Column(Float)
    weather = Column(String(50))
    traffic_level = Column(String(50))
    risk_score = Column(Float)
    status = Column(String(50))
    accuracy = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class HistoricalDecision(Base):
    """Historical decision records for learning"""
    __tablename__ = "historical_decisions"
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    scenario = Column(String(100))
    decisions = Column(JSON)  # List of decisions
    route = Column(String(50))
    material = Column(String(50))
    tonnage = Column(Float)
    severity = Column(String(50))
    outcome = Column(String(50))
    cost_impact = Column(Float)
    time_impact = Column(Float)
    satisfaction_impact = Column(Float)
    complexity = Column(Float)
    risk_mitigated = Column(Float)
    decision_maker = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class HistoricalDispatch(Base):
    """Historical dispatch records with detailed information"""
    __tablename__ = "historical_dispatches"
    
    id = Column(Integer, primary_key=True)
    order_id = Column(String(50), unique=True)
    customer_id = Column(String(50))
    customer_name = Column(String(100))
    date = Column(DateTime, default=datetime.utcnow)
    dispatch_time = Column(String(10))
    route = Column(String(50))
    material = Column(String(50))
    tonnage = Column(Float)
    vehicle = Column(String(50))
    driver = Column(String(100))
    reason = Column(String(200))
    status = Column(String(50))
    dispatch_type = Column(String(50))
    distance = Column(Float)
    planned_days = Column(Integer)
    actual_days = Column(Integer)
    delay_days = Column(Integer)
    expected_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    total_cost = Column(Float)
    cost_optimization = Column(Float)
    fuel_consumed = Column(Float)
    fuel_cost = Column(Float)
    temperature_variation = Column(Float)
    humidity_variation = Column(Float)
    damage_percentage = Column(Float)
    quality_score = Column(Float)
    satisfaction = Column(Float)
    stops = Column(JSON)
    incidents = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# ML MODEL TABLES
# ============================================================================

class MLModel(Base):
    """ML Model metadata and versioning"""
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    model_type = Column(String(50))  # prediction, optimization, risk, advanced
    description = Column(Text)
    version = Column(String(20))
    status = Column(String(50))  # active, inactive, training
    accuracy = Column(Float)
    last_trained = Column(DateTime)
    training_data_size = Column(Integer)
    model_path = Column(String(200))
    config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ModelPrediction(Base):
    """Store all model predictions for feedback"""
    __tablename__ = "model_predictions"
    
    id = Column(Integer, primary_key=True)
    model_id = Column(Integer)
    model_name = Column(String(100))
    input_data = Column(JSON)
    prediction = Column(JSON)
    confidence = Column(Float)
    actual_value = Column(JSON)  # Filled later when actual outcome known
    accuracy = Column(Float)  # Calculated after actual value known
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ModelPerformance(Base):
    """Track model performance metrics over time"""
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True)
    model_name = Column(String(100))
    date = Column(DateTime, default=datetime.utcnow)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    rmse = Column(Float)
    mae = Column(Float)
    predictions_count = Column(Integer)
    avg_confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# FEATURE ENGINEERING TABLES
# ============================================================================

class ExtractedFeature(Base):
    """Extracted and engineered features for ML"""
    __tablename__ = "extracted_features"
    
    id = Column(Integer, primary_key=True)
    source_type = Column(String(50))  # shipment, decision, dispatch
    source_id = Column(Integer)
    feature_name = Column(String(100))
    feature_value = Column(Float)
    feature_type = Column(String(50))  # numeric, categorical, derived
    created_at = Column(DateTime, default=datetime.utcnow)

class FeatureStatistics(Base):
    """Statistics for feature normalization"""
    __tablename__ = "feature_statistics"
    
    id = Column(Integer, primary_key=True)
    feature_name = Column(String(100), unique=True)
    mean = Column(Float)
    std_dev = Column(Float)
    min_value = Column(Float)
    max_value = Column(Float)
    median = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============================================================================
# TRAINING & FEEDBACK TABLES
# ============================================================================

class TrainingJob(Base):
    """Track model training jobs"""
    __tablename__ = "training_jobs"
    
    id = Column(Integer, primary_key=True)
    model_name = Column(String(100))
    status = Column(String(50))  # pending, running, completed, failed
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    training_data_size = Column(Integer)
    accuracy = Column(Float)
    error_message = Column(Text)
    config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeedbackRecord(Base):
    """Feedback for continuous learning"""
    __tablename__ = "feedback_records"
    
    id = Column(Integer, primary_key=True)
    prediction_id = Column(Integer)
    model_name = Column(String(100))
    actual_outcome = Column(JSON)
    predicted_outcome = Column(JSON)
    accuracy = Column(Float)
    user_feedback = Column(Text)
    feedback_type = Column(String(50))  # correct, incorrect, partial
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# MONITORING & ALERTS TABLES
# ============================================================================

class ModelAlert(Base):
    """Alerts for model performance issues"""
    __tablename__ = "model_alerts"
    
    id = Column(Integer, primary_key=True)
    model_name = Column(String(100))
    alert_type = Column(String(50))  # accuracy_drop, data_drift, performance_issue
    severity = Column(String(50))  # low, medium, high, critical
    message = Column(Text)
    threshold = Column(Float)
    current_value = Column(Float)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

class DataDriftLog(Base):
    """Track data drift detection"""
    __tablename__ = "data_drift_logs"
    
    id = Column(Integer, primary_key=True)
    feature_name = Column(String(100))
    drift_detected = Column(Boolean)
    drift_score = Column(Float)
    threshold = Column(Float)
    old_mean = Column(Float)
    new_mean = Column(Float)
    old_std = Column(Float)
    new_std = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# DATA IMPORT TABLES
# ============================================================================

class DataImportJob(Base):
    """Track data import operations"""
    __tablename__ = "data_import_jobs"
    
    id = Column(Integer, primary_key=True)
    import_type = Column(String(50))  # csv, json, api, manual
    file_name = Column(String(200))
    status = Column(String(50))  # pending, processing, completed, failed
    total_records = Column(Integer)
    imported_records = Column(Integer)
    failed_records = Column(Integer)
    error_details = Column(JSON)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

class ImportedData(Base):
    """Raw imported data before processing"""
    __tablename__ = "imported_data"
    
    id = Column(Integer, primary_key=True)
    import_job_id = Column(Integer)
    data_type = Column(String(50))  # shipment, decision, dispatch
    raw_data = Column(JSON)
    processed = Column(Boolean, default=False)
    processing_status = Column(String(50))
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

def init_db(database_url="sqlite:///./ml_data.db"):
    """Initialize database"""
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    return engine

def get_session(engine):
    """Get database session"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()
