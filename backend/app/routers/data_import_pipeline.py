"""
Data Import Pipeline Router
Handles data import and ML model analysis
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.data_pipeline import DataPipeline

router = APIRouter(prefix="/api/data-import", tags=["data-import"])

# Global pipeline instance
pipeline = DataPipeline()

class ImportDataRequest(BaseModel):
    """Request model for data import"""
    stockyards: List[Dict[str, Any]]
    materials: List[Dict[str, Any]]
    orders: List[Dict[str, Any]]
    rakes: List[Dict[str, Any]]
    routes: List[Dict[str, Any]]
    loadingPoints: Optional[List[Dict[str, Any]]] = None
    constraints: Optional[List[Dict[str, Any]]] = None

@router.post("/import")
async def import_data(data: ImportDataRequest):
    """
    Import data and prepare for ML analysis
    """
    try:
        # Convert request to dict
        data_dict = data.dict()
        
        # Step 1: Import data
        import_result = pipeline.import_data(data_dict)
        if import_result['status'] == 'error':
            raise HTTPException(status_code=400, detail=import_result['message'])
        
        # Step 2: Preprocess data
        preprocess_result = pipeline.preprocess_data()
        if preprocess_result['status'] == 'error':
            raise HTTPException(status_code=400, detail=preprocess_result['message'])
        
        return {
            'status': 'success',
            'message': 'Data imported and preprocessed successfully',
            'import_summary': import_result['data_summary'],
            'preprocessing_summary': preprocess_result
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@router.post("/analyze")
async def analyze_data():
    """
    Run all 17 ML models on imported data
    """
    try:
        if not pipeline.imported_data:
            raise HTTPException(status_code=400, detail='No data imported. Please import data first.')
        
        result = pipeline.run_all_models()
        if result['status'] == 'error':
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions")
async def get_predictions():
    """
    Get predictions from all 17 ML models
    """
    try:
        if not pipeline.predictions:
            raise HTTPException(status_code=400, detail='No predictions available. Run analysis first.')
        
        return {
            'status': 'success',
            'predictions': pipeline.predictions,
            'models_count': len(pipeline.predictions),
            'timestamp': pipeline.processed_data.get('timestamp') if pipeline.processed_data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions/{model_name}")
async def get_model_prediction(model_name: str):
    """
    Get prediction from a specific model
    """
    try:
        if not pipeline.predictions:
            raise HTTPException(status_code=400, detail='No predictions available.')
        
        if model_name not in pipeline.predictions:
            raise HTTPException(status_code=404, detail=f'Model {model_name} not found')
        
        return {
            'status': 'success',
            'model': model_name,
            'prediction': pipeline.predictions[model_name]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report")
async def get_report():
    """
    Get comprehensive report with all predictions and analysis
    """
    try:
        if not pipeline.imported_data:
            raise HTTPException(status_code=400, detail='No data imported.')
        
        report = pipeline.generate_report()
        return {
            'status': 'success',
            'report': report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """
    Get current pipeline status
    """
    return {
        'status': 'success',
        'pipeline_status': {
            'data_imported': pipeline.imported_data is not None,
            'data_preprocessed': pipeline.processed_data is not None,
            'models_executed': len(pipeline.predictions) > 0,
            'models_count': len(pipeline.predictions),
            'rake_plan_generated': pipeline.rake_plan is not None,
            'data_summary': {
                'stockyards': len(pipeline.processed_data['stockyards']) if pipeline.processed_data else 0,
                'materials': len(pipeline.processed_data['materials']) if pipeline.processed_data else 0,
                'orders': len(pipeline.processed_data['orders']) if pipeline.processed_data else 0,
                'rakes': len(pipeline.processed_data['rakes']) if pipeline.processed_data else 0,
                'routes': len(pipeline.processed_data['routes']) if pipeline.processed_data else 0
            }
        }
    }

@router.post("/clear")
async def clear_data():
    """
    Clear all imported data and predictions
    """
    try:
        pipeline.imported_data = None
        pipeline.processed_data = None
        pipeline.predictions = {}
        pipeline.rake_plan = None
        
        return {
            'status': 'success',
            'message': 'All data and predictions cleared'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_models_info():
    """
    Get information about all 17 ML models
    """
    models_info = {
        'prediction_models': [
            {'name': 'delay_prediction', 'description': 'Predicts shipment delays', 'group': 'Prediction'},
            {'name': 'cost_prediction', 'description': 'Predicts shipping costs', 'group': 'Prediction'},
            {'name': 'demand_forecasting', 'description': 'Forecasts future demand', 'group': 'Prediction'},
            {'name': 'quality_prediction', 'description': 'Predicts delivery quality', 'group': 'Prediction'},
            {'name': 'fuel_consumption', 'description': 'Predicts fuel usage', 'group': 'Prediction'},
        ],
        'optimization_models': [
            {'name': 'route_optimization', 'description': 'Optimizes transportation routes', 'group': 'Optimization'},
            {'name': 'cost_optimization', 'description': 'Minimizes operational costs', 'group': 'Optimization'},
            {'name': 'time_optimization', 'description': 'Minimizes delivery time', 'group': 'Optimization'},
            {'name': 'vehicle_allocation', 'description': 'Allocates vehicles optimally', 'group': 'Optimization'},
            {'name': 'material_recommendation', 'description': 'Recommends best materials', 'group': 'Optimization'},
        ],
        'risk_decision_models': [
            {'name': 'risk_assessment', 'description': 'Assesses shipment risk', 'group': 'Risk & Decision'},
            {'name': 'decision_support', 'description': 'Supports decision making', 'group': 'Risk & Decision'},
            {'name': 'anomaly_detection', 'description': 'Detects unusual patterns', 'group': 'Risk & Decision'},
            {'name': 'supplier_performance', 'description': 'Rates supplier performance', 'group': 'Risk & Decision'},
        ],
        'advanced_models': [
            {'name': 'scenario_analysis', 'description': 'Analyzes different scenarios', 'group': 'Advanced'},
            {'name': 'predictive_maintenance', 'description': 'Predicts maintenance needs', 'group': 'Advanced'},
            {'name': 'customer_satisfaction', 'description': 'Predicts customer satisfaction', 'group': 'Advanced'},
        ]
    }
    
    return {
        'status': 'success',
        'total_models': 17,
        'models': models_info
    }
