"""
Auto-Report & Email API Router - Phase 1 Feature 4
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.auto_report_service import AutoReportService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auto-report", tags=["auto-report"])

auto_report = AutoReportService()

@router.post("/generate/daily")
async def generate_daily_report():
    """Generate daily report"""
    try:
        report = auto_report.generate_daily_report()
        return report.to_dict()
    except Exception as e:
        logger.error(f"Generate daily report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/weekly")
async def generate_weekly_report():
    """Generate weekly report"""
    try:
        report = auto_report.generate_weekly_report()
        return report.to_dict()
    except Exception as e:
        logger.error(f"Generate weekly report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/monthly")
async def generate_monthly_report():
    """Generate monthly report"""
    try:
        report = auto_report.generate_monthly_report()
        return report.to_dict()
    except Exception as e:
        logger.error(f"Generate monthly report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send/daily-summary")
async def send_daily_summary():
    """Send daily summary email"""
    try:
        report = auto_report.generate_daily_report()
        emails = auto_report.send_daily_summary_email(report)
        return {
            'status': 'success',
            'report_id': report.id,
            'emails_sent': len(emails),
            'recipients': [e.recipient for e in emails],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Send daily summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send/alert-notification")
async def send_alert_notification(alert_id: str, alert_data: Dict[str, Any]):
    """Send alert notification email"""
    try:
        emails = auto_report.send_alert_notification(alert_id, alert_data)
        return {
            'status': 'success',
            'alert_id': alert_id,
            'emails_sent': len(emails),
            'recipients': [e.recipient for e in emails],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Send alert notification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send/optimization-result")
async def send_optimization_result(plan_id: str, plan_data: Dict[str, Any]):
    """Send optimization result email"""
    try:
        emails = auto_report.send_optimization_result(plan_id, plan_data)
        return {
            'status': 'success',
            'plan_id': plan_id,
            'emails_sent': len(emails),
            'recipients': [e.recipient for e in emails],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Send optimization result error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def get_reports(limit: int = 50):
    """Get all reports"""
    try:
        reports = auto_report.get_all_reports(limit)
        return {
            'total': len(reports),
            'reports': reports,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get reports error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/emails")
async def get_emails(limit: int = 100):
    """Get all emails"""
    try:
        emails = auto_report.get_all_emails(limit)
        return {
            'total': len(emails),
            'emails': emails,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get emails error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get auto-report service status"""
    try:
        status = auto_report.get_status()
        return status
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'auto_report',
        'timestamp': datetime.now().isoformat()
    }
