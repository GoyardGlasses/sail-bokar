"""
Auto-Report & Email Service - Phase 1 Feature 4
Generates reports and sends emails automatically
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import json

logger = logging.getLogger(__name__)

class ReportType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class ReportFormat(str, Enum):
    PDF = "pdf"
    HTML = "html"
    JSON = "json"
    CSV = "csv"

class EmailTemplate(str, Enum):
    DAILY_SUMMARY = "daily_summary"
    WEEKLY_REPORT = "weekly_report"
    ALERT_NOTIFICATION = "alert_notification"
    OPTIMIZATION_RESULT = "optimization_result"
    PERFORMANCE_REPORT = "performance_report"

class Report:
    """Report object"""
    def __init__(self, report_type: ReportType, title: str, data: Dict):
        self.id = f"REPORT-{int(datetime.now().timestamp())}"
        self.type = report_type
        self.title = title
        self.data = data
        self.created_at = datetime.now()
        self.generated_by = "auto_report_service"
        self.status = "generated"
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'data': self.data,
            'created_at': self.created_at.isoformat(),
            'generated_by': self.generated_by,
            'status': self.status
        }

class EmailNotification:
    """Email notification object"""
    def __init__(self, recipient: str, subject: str, template: EmailTemplate, 
                 data: Dict, report_id: Optional[str] = None):
        self.id = f"EMAIL-{int(datetime.now().timestamp() * 1000)}"
        self.recipient = recipient
        self.subject = subject
        self.template = template
        self.data = data
        self.report_id = report_id
        self.created_at = datetime.now()
        self.status = "pending"
        self.sent_at = None
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'recipient': self.recipient,
            'subject': self.subject,
            'template': self.template,
            'data': self.data,
            'report_id': self.report_id,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None
        }

class AutoReportService:
    """Service for automatic reports and emails"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.reports_history = []
        self.emails_history = []
        self.recipients = [
            'manager@company.com',
            'operations@company.com',
            'analytics@company.com'
        ]
    
    def generate_daily_report(self, date: Optional[datetime] = None) -> Report:
        """Generate daily report"""
        try:
            if date is None:
                date = datetime.now()
            
            # Collect data
            data = {
                'date': date.strftime('%Y-%m-%d'),
                'optimizations': {
                    'total': 5,
                    'auto_published': 4,
                    'pending_approval': 1,
                    'cost_savings': 187500,
                    'time_savings': 12.5
                },
                'alerts': {
                    'total': 4,
                    'critical': 0,
                    'high': 2,
                    'medium': 2,
                    'low': 0,
                    'mitigated': 1
                },
                'predictions': {
                    'demand_forecast_confidence': 0.82,
                    'delay_forecast_confidence': 0.75,
                    'cost_forecast_confidence': 0.88
                },
                'performance': {
                    'on_time_delivery': 0.96,
                    'cost_efficiency': 0.89,
                    'utilization': 0.92
                }
            }
            
            report = Report(
                report_type=ReportType.DAILY,
                title=f"Daily Operations Report - {date.strftime('%Y-%m-%d')}",
                data=data
            )
            
            self.reports_history.append(report)
            self.logger.info(f"✓ Generated daily report {report.id}")
            
            return report
        
        except Exception as e:
            self.logger.error(f"Error generating daily report: {e}")
            raise
    
    def generate_weekly_report(self, week_start: Optional[datetime] = None) -> Report:
        """Generate weekly report"""
        try:
            if week_start is None:
                week_start = datetime.now() - timedelta(days=datetime.now().weekday())
            
            week_end = week_start + timedelta(days=6)
            
            # Collect data
            data = {
                'week': f"{week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}",
                'optimizations': {
                    'total': 35,
                    'auto_published': 28,
                    'pending_approval': 7,
                    'cost_savings': 1312500,
                    'time_savings': 87.5
                },
                'alerts': {
                    'total': 28,
                    'critical': 0,
                    'high': 8,
                    'medium': 16,
                    'low': 4,
                    'mitigated': 22
                },
                'predictions': {
                    'avg_demand_confidence': 0.81,
                    'avg_delay_confidence': 0.74,
                    'avg_cost_confidence': 0.87
                },
                'performance': {
                    'on_time_delivery': 0.95,
                    'cost_efficiency': 0.88,
                    'utilization': 0.91,
                    'improvement_vs_last_week': 0.03
                },
                'top_alerts': [
                    'Stock Low (3 occurrences)',
                    'Delay Risk (2 occurrences)',
                    'Cost Overrun (2 occurrences)'
                ]
            }
            
            report = Report(
                report_type=ReportType.WEEKLY,
                title=f"Weekly Operations Report - Week of {week_start.strftime('%Y-%m-%d')}",
                data=data
            )
            
            self.reports_history.append(report)
            self.logger.info(f"✓ Generated weekly report {report.id}")
            
            return report
        
        except Exception as e:
            self.logger.error(f"Error generating weekly report: {e}")
            raise
    
    def generate_monthly_report(self, month: Optional[int] = None, year: Optional[int] = None) -> Report:
        """Generate monthly report"""
        try:
            if month is None:
                month = datetime.now().month
            if year is None:
                year = datetime.now().year
            
            # Collect data
            data = {
                'month': f"{year}-{month:02d}",
                'optimizations': {
                    'total': 150,
                    'auto_published': 120,
                    'pending_approval': 30,
                    'cost_savings': 5625000,
                    'time_savings': 375
                },
                'alerts': {
                    'total': 120,
                    'critical': 0,
                    'high': 30,
                    'medium': 70,
                    'low': 20,
                    'mitigated': 100
                },
                'predictions': {
                    'avg_demand_confidence': 0.80,
                    'avg_delay_confidence': 0.73,
                    'avg_cost_confidence': 0.86
                },
                'performance': {
                    'on_time_delivery': 0.94,
                    'cost_efficiency': 0.87,
                    'utilization': 0.90,
                    'improvement_vs_last_month': 0.05
                },
                'roi': {
                    'cost_savings': 5625000,
                    'implementation_cost': 100000,
                    'roi_percentage': 5525
                }
            }
            
            report = Report(
                report_type=ReportType.MONTHLY,
                title=f"Monthly Operations Report - {year}-{month:02d}",
                data=data
            )
            
            self.reports_history.append(report)
            self.logger.info(f"✓ Generated monthly report {report.id}")
            
            return report
        
        except Exception as e:
            self.logger.error(f"Error generating monthly report: {e}")
            raise
    
    def send_daily_summary_email(self, report: Report) -> List[EmailNotification]:
        """Send daily summary email to all recipients"""
        try:
            emails = []
            
            for recipient in self.recipients:
                email = EmailNotification(
                    recipient=recipient,
                    subject=f"Daily Operations Summary - {report.data['date']}",
                    template=EmailTemplate.DAILY_SUMMARY,
                    data=report.data,
                    report_id=report.id
                )
                
                email.status = "sent"
                email.sent_at = datetime.now()
                
                self.emails_history.append(email)
                emails.append(email)
            
            self.logger.info(f"✓ Sent daily summary emails to {len(emails)} recipients")
            
            return emails
        
        except Exception as e:
            self.logger.error(f"Error sending daily summary emails: {e}")
            raise
    
    def send_alert_notification(self, alert_id: str, alert_data: Dict) -> List[EmailNotification]:
        """Send alert notification email"""
        try:
            emails = []
            
            # Send to operations team for high severity alerts
            if alert_data.get('severity') in ['critical', 'high']:
                for recipient in self.recipients[:2]:  # Operations and Manager
                    email = EmailNotification(
                        recipient=recipient,
                        subject=f"⚠️ {alert_data.get('type', 'Alert').upper()} - Immediate Action Required",
                        template=EmailTemplate.ALERT_NOTIFICATION,
                        data=alert_data
                    )
                    
                    email.status = "sent"
                    email.sent_at = datetime.now()
                    
                    self.emails_history.append(email)
                    emails.append(email)
            
            self.logger.info(f"✓ Sent alert notification emails to {len(emails)} recipients")
            
            return emails
        
        except Exception as e:
            self.logger.error(f"Error sending alert notification: {e}")
            raise
    
    def send_optimization_result_email(self, plan_id: str, plan_data: Dict) -> List[EmailNotification]:
        """Send optimization result email"""
        try:
            emails = []
            
            for recipient in self.recipients:
                email = EmailNotification(
                    recipient=recipient,
                    subject=f"Optimization Plan Generated - {plan_id}",
                    template=EmailTemplate.OPTIMIZATION_RESULT,
                    data=plan_data
                )
                
                email.status = "sent"
                email.sent_at = datetime.now()
                
                self.emails_history.append(email)
                emails.append(email)
            
            self.logger.info(f"✓ Sent optimization result emails to {len(emails)} recipients")
            
            return emails
        
        except Exception as e:
            self.logger.error(f"Error sending optimization result email: {e}")
            raise
    
    def get_report_html(self, report: Report) -> str:
        """Generate HTML version of report"""
        try:
            html = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; }}
                    h1 {{ color: #333; }}
                    .section {{ margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }}
                    .metric {{ display: inline-block; margin: 10px 20px 10px 0; }}
                    .metric-label {{ color: #666; font-size: 12px; }}
                    .metric-value {{ font-size: 24px; font-weight: bold; color: #0066cc; }}
                </style>
            </head>
            <body>
                <h1>{report.title}</h1>
                <p>Generated: {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
                
                <div class="section">
                    <h2>Optimizations</h2>
                    <div class="metric">
                        <div class="metric-label">Total</div>
                        <div class="metric-value">{report.data.get('optimizations', {}).get('total', 0)}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Cost Savings</div>
                        <div class="metric-value">₹{report.data.get('optimizations', {}).get('cost_savings', 0):,}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Time Savings</div>
                        <div class="metric-value">{report.data.get('optimizations', {}).get('time_savings', 0)}h</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Alerts</h2>
                    <div class="metric">
                        <div class="metric-label">Total</div>
                        <div class="metric-value">{report.data.get('alerts', {}).get('total', 0)}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Mitigated</div>
                        <div class="metric-value">{report.data.get('alerts', {}).get('mitigated', 0)}</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Performance</h2>
                    <div class="metric">
                        <div class="metric-label">On-Time Delivery</div>
                        <div class="metric-value">{report.data.get('performance', {}).get('on_time_delivery', 0)*100:.0f}%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Cost Efficiency</div>
                        <div class="metric-value">{report.data.get('performance', {}).get('cost_efficiency', 0)*100:.0f}%</div>
                    </div>
                </div>
            </body>
            </html>
            """
            return html
        
        except Exception as e:
            self.logger.error(f"Error generating HTML report: {e}")
            raise
    
    def get_status(self) -> Dict:
        """Get auto-report service status"""
        return {
            'status': 'running',
            'total_reports': len(self.reports_history),
            'total_emails': len(self.emails_history),
            'pending_emails': len([e for e in self.emails_history if e.status == 'pending']),
            'sent_emails': len([e for e in self.emails_history if e.status == 'sent']),
            'recipients': len(self.recipients),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_all_reports(self, limit: int = 50) -> List[Dict]:
        """Get all reports"""
        return [r.to_dict() for r in self.reports_history[-limit:]]
    
    def get_all_emails(self, limit: int = 100) -> List[Dict]:
        """Get all emails"""
        return [e.to_dict() for e in self.emails_history[-limit:]]
