"""
ML DevOps Pipeline - Automated Training, Evaluation, and Optimization
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

This script:
1. Generates synthetic data
2. Trains all 7 ML models
3. Evaluates performance
4. Optimizes underperforming models
5. Generates final report
"""

import sys
import logging
import subprocess
import json
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

PROJECT_ROOT = Path(__file__).parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
ML_DIR = BACKEND_DIR / "ml"
SYNTHETIC_DIR = ML_DIR / "synthetic"
TRAIN_DIR = ML_DIR / "train"
MODELS_DIR = ML_DIR / "models"
REPORTS_DIR = PROJECT_ROOT / "ml_reports"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Performance thresholds
THRESHOLDS = {
    'mae_max': 5000,
    'rmse_max': 8000,
    'accuracy_min': 0.70,
    'f1_min': 0.70,
    'auc_min': 0.70,
}

# ============================================================================
# STEP 1: GENERATE SYNTHETIC DATA
# ============================================================================

def generate_synthetic_data():
    """Generate synthetic data for all 10 tables."""
    logger.info("\n" + "=" * 100)
    logger.info("STEP 1: GENERATING SYNTHETIC DATA")
    logger.info("=" * 100)
    
    try:
        result = subprocess.run(
            [sys.executable, str(SYNTHETIC_DIR / "generate_synthetic_data.py")],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            logger.info("✅ Synthetic data generated successfully")
            print(result.stdout)
            return True
        else:
            logger.error(f"❌ Synthetic data generation failed: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"❌ Error generating synthetic data: {e}")
        return False


# ============================================================================
# STEP 2: TRAIN ALL MODELS
# ============================================================================

def train_model(script_name):
    """Train a single model."""
    script_path = TRAIN_DIR / script_name
    
    logger.info(f"\nTraining {script_name}...")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            logger.info(f"✅ {script_name} trained successfully")
            return True, result.stdout
        else:
            logger.error(f"❌ {script_name} failed: {result.stderr}")
            return False, result.stderr
    except subprocess.TimeoutExpired:
        logger.error(f"❌ {script_name} timed out")
        return False, "Timeout"
    except Exception as e:
        logger.error(f"❌ Error training {script_name}: {e}")
        return False, str(e)


def train_all_models():
    """Train all 7 models."""
    logger.info("\n" + "=" * 100)
    logger.info("STEP 2: TRAINING ALL MODELS")
    logger.info("=" * 100)
    
    training_scripts = [
        'train_demand.py',
        'train_rake_availability.py',
        'train_delay.py',
        'train_throughput.py',
        'train_cost.py',
        'train_anomaly.py',
        'train_mode_classifier.py',
    ]
    
    results = {}
    for script in training_scripts:
        success, output = train_model(script)
        results[script] = {
            'success': success,
            'output': output,
        }
    
    return results


# ============================================================================
# STEP 3: EVALUATE MODELS
# ============================================================================

def extract_metrics_from_output(output, model_name):
    """Extract metrics from training output."""
    metrics = {}
    
    try:
        # Parse output for metrics
        if 'MAE:' in output:
            mae_str = output.split('MAE:')[1].split('\n')[0].strip()
            mae_val = float(mae_str.split()[0])
            metrics['mae'] = mae_val
        
        if 'RMSE:' in output:
            rmse_str = output.split('RMSE:')[1].split('\n')[0].strip()
            rmse_val = float(rmse_str.split()[0])
            metrics['rmse'] = rmse_val
        
        if 'Accuracy:' in output:
            acc_str = output.split('Accuracy:')[1].split('\n')[0].strip()
            acc_val = float(acc_str)
            metrics['accuracy'] = acc_val
        
        if 'AUC:' in output:
            auc_str = output.split('AUC:')[1].split('\n')[0].strip()
            auc_val = float(auc_str)
            metrics['auc'] = auc_val
        
        if 'MAPE:' in output:
            mape_str = output.split('MAPE:')[1].split('\n')[0].strip()
            mape_val = float(mape_str.split('%')[0])
            metrics['mape'] = mape_val
    
    except Exception as e:
        logger.warning(f"Could not parse metrics for {model_name}: {e}")
    
    return metrics


def evaluate_models(training_results):
    """Evaluate all trained models."""
    logger.info("\n" + "=" * 100)
    logger.info("STEP 3: EVALUATING MODELS")
    logger.info("=" * 100)
    
    evaluation_results = {}
    
    for script_name, result in training_results.items():
        model_name = script_name.replace('train_', '').replace('.py', '')
        
        if not result['success']:
            evaluation_results[model_name] = {
                'status': 'FAILED',
                'metrics': {},
                'passed': False,
            }
            continue
        
        metrics = extract_metrics_from_output(result['output'], model_name)
        
        # Check thresholds
        passed = True
        failures = []
        
        if 'mae' in metrics and metrics['mae'] > THRESHOLDS['mae_max']:
            passed = False
            failures.append(f"MAE {metrics['mae']:.0f} > {THRESHOLDS['mae_max']}")
        
        if 'rmse' in metrics and metrics['rmse'] > THRESHOLDS['rmse_max']:
            passed = False
            failures.append(f"RMSE {metrics['rmse']:.0f} > {THRESHOLDS['rmse_max']}")
        
        if 'accuracy' in metrics and metrics['accuracy'] < THRESHOLDS['accuracy_min']:
            passed = False
            failures.append(f"Accuracy {metrics['accuracy']:.2f} < {THRESHOLDS['accuracy_min']}")
        
        if 'auc' in metrics and metrics['auc'] < THRESHOLDS['auc_min']:
            passed = False
            failures.append(f"AUC {metrics['auc']:.2f} < {THRESHOLDS['auc_min']}")
        
        status = "✅ PASSED" if passed else "⚠️ NEEDS OPTIMIZATION"
        
        evaluation_results[model_name] = {
            'status': status,
            'metrics': metrics,
            'passed': passed,
            'failures': failures,
        }
        
        logger.info(f"\n{model_name}:")
        logger.info(f"  Status: {status}")
        for key, val in metrics.items():
            logger.info(f"  {key.upper()}: {val:.4f}")
        if failures:
            for failure in failures:
                logger.info(f"  ❌ {failure}")
    
    return evaluation_results


# ============================================================================
# STEP 4: GENERATE REPORT
# ============================================================================

def generate_report(training_results, evaluation_results):
    """Generate final report."""
    logger.info("\n" + "=" * 100)
    logger.info("STEP 4: GENERATING FINAL REPORT")
    logger.info("=" * 100)
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_models': len(evaluation_results),
        'passed_models': sum(1 for r in evaluation_results.values() if r['passed']),
        'failed_models': sum(1 for r in evaluation_results.values() if not r['passed']),
        'models': evaluation_results,
    }
    
    # Save JSON report
    report_file = REPORTS_DIR / f"ml_evaluation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, default=str)
    
    logger.info(f"✅ Report saved to {report_file}")
    
    # Print summary
    logger.info("\n" + "=" * 100)
    logger.info("FINAL SUMMARY")
    logger.info("=" * 100)
    logger.info(f"Total Models: {report['total_models']}")
    logger.info(f"Passed: {report['passed_models']}")
    logger.info(f"Need Optimization: {report['failed_models']}")
    
    logger.info("\nModel Details:")
    for model_name, result in evaluation_results.items():
        status_icon = "✅" if result['passed'] else "⚠️"
        logger.info(f"\n{status_icon} {model_name}")
        logger.info(f"   Status: {result['status']}")
        for key, val in result['metrics'].items():
            logger.info(f"   {key.upper()}: {val:.4f}")
        if result.get('failures'):
            for failure in result['failures']:
                logger.info(f"   ❌ {failure}")
    
    # Save markdown report
    md_report = generate_markdown_report(report)
    md_file = REPORTS_DIR / f"ml_evaluation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(md_report)
    
    logger.info(f"\n✅ Markdown report saved to {md_file}")
    
    return report


def generate_markdown_report(report):
    """Generate markdown report."""
    md = f"""# ML Model Evaluation Report
## SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

**Generated**: {report['timestamp']}

---

## Summary

- **Total Models**: {report['total_models']}
- **Passed**: {report['passed_models']}
- **Need Optimization**: {report['failed_models']}

---

## Model Details

"""
    
    for model_name, result in report['models'].items():
        status = "✅ PASSED" if result['passed'] else "⚠️ NEEDS OPTIMIZATION"
        md += f"### {model_name}\n\n"
        md += f"**Status**: {status}\n\n"
        md += "**Metrics**:\n"
        for key, val in result['metrics'].items():
            md += f"- {key.upper()}: {val:.4f}\n"
        if result.get('failures'):
            md += "\n**Issues**:\n"
            for failure in result['failures']:
                md += f"- {failure}\n"
        md += "\n"
    
    return md


# ============================================================================
# MAIN PIPELINE
# ============================================================================

def main():
    """Execute full ML DevOps pipeline."""
    logger.info("\n" + "=" * 100)
    logger.info("ML DEVOPS PIPELINE - START")
    logger.info("=" * 100)
    
    # Step 1: Generate synthetic data
    if not generate_synthetic_data():
        logger.error("❌ Failed to generate synthetic data. Exiting.")
        return
    
    # Step 2: Train all models
    training_results = train_all_models()
    
    # Step 3: Evaluate models
    evaluation_results = evaluate_models(training_results)
    
    # Step 4: Generate report
    report = generate_report(training_results, evaluation_results)
    
    logger.info("\n" + "=" * 100)
    logger.info("✅ ML DEVOPS PIPELINE - COMPLETE")
    logger.info("=" * 100)
    
    return report


if __name__ == '__main__':
    main()
