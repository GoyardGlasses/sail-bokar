"""
Enhanced Demand Forecasting Service with Advanced Analytics.
Handles multiple forecasting methods, anomaly detection, seasonality analysis,
trend decomposition, confidence intervals, and scenario-based predictions.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np
from pathlib import Path
from collections import defaultdict
import json

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    Prophet = None
    PROPHET_AVAILABLE = False

try:
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)


class EnhancedDemandForecastService:
    """Advanced demand forecasting with multiple methods and deep analysis."""

    def __init__(self):
        """Initialize enhanced forecast service."""
        self.logger = app_logger
        self.models_cache = {}
        self.forecast_cache = {}
        self.historical_data = {}
        self.anomalies = defaultdict(list)
        self.seasonality_patterns = {}
        self.trend_analysis = {}
        self.confidence_intervals = {}

    def generate_realistic_historical_data(
        self,
        material: str,
        days: int = 730,
        base_demand: float = 1000,
        trend_strength: float = 0.5,
        seasonality_strength: float = 0.3,
        volatility: float = 0.15
    ) -> pd.DataFrame:
        """
        Generate realistic historical demand data with multiple components.

        Parameters:
        - base_demand: Average daily demand
        - trend_strength: How strong the upward/downward trend is (0-1)
        - seasonality_strength: How strong seasonal patterns are (0-1)
        - volatility: Random noise level (0-1)
        """
        dates = pd.date_range(end=datetime.now(), periods=days, freq='D')

        # 1. Base demand with realistic variation
        base = np.random.normal(base_demand, base_demand * 0.1, days)

        # 2. Long-term trend (growth or decline)
        trend = np.linspace(0, base_demand * trend_strength, days)

        # 3. Yearly seasonality (higher in certain months)
        yearly_seasonality = (
            base_demand * seasonality_strength *
            np.sin(np.arange(days) * 2 * np.pi / 365)
        )

        # 4. Weekly seasonality (weekends vs weekdays)
        weekly_seasonality = (
            base_demand * seasonality_strength * 0.3 *
            np.sin(np.arange(days) * 2 * np.pi / 7)
        )

        # 5. Random noise and volatility
        noise = np.random.normal(0, base_demand * volatility, days)

        # 6. Occasional spikes (special events, promotions)
        spikes = np.zeros(days)
        spike_indices = np.random.choice(days, size=int(days * 0.05), replace=False)
        spikes[spike_indices] = np.random.uniform(
            base_demand * 0.2, base_demand * 0.5, len(spike_indices)
        )

        # Combine all components
        demand = base + trend + yearly_seasonality + weekly_seasonality + noise + spikes
        demand = np.maximum(demand, 0)  # Ensure non-negative

        df = pd.DataFrame({
            'ds': dates,
            'y': demand,
            'material': material,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'quarter': dates.quarter,
            'is_weekend': dates.dayofweek >= 5
        })

        self.historical_data[material] = df
        return df

    def detect_anomalies(
        self,
        material: str,
        data: pd.DataFrame,
        method: str = 'iqr',
        threshold: float = 1.5
    ) -> Dict[str, Any]:
        """
        Detect anomalies in demand data using multiple methods.

        Methods:
        - 'iqr': Interquartile range method
        - 'zscore': Z-score method
        - 'isolation_forest': Isolation forest algorithm
        """
        anomalies = []
        anomaly_indices = []

        if method == 'iqr':
            Q1 = data['y'].quantile(0.25)
            Q3 = data['y'].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR

            anomaly_mask = (data['y'] < lower_bound) | (data['y'] > upper_bound)

        elif method == 'zscore':
            mean = data['y'].mean()
            std = data['y'].std()
            z_scores = np.abs((data['y'] - mean) / std)
            anomaly_mask = z_scores > threshold

        else:  # isolation_forest
            try:
                from sklearn.ensemble import IsolationForest
                iso_forest = IsolationForest(contamination=0.05, random_state=42)
                anomaly_mask = iso_forest.fit_predict(data[['y']]) == -1
            except ImportError:
                anomaly_mask = pd.Series([False] * len(data))

        anomaly_indices = data[anomaly_mask].index.tolist()

        for idx in anomaly_indices:
            anomalies.append({
                'date': data.loc[idx, 'ds'].isoformat(),
                'value': float(data.loc[idx, 'y']),
                'deviation': float(
                    (data.loc[idx, 'y'] - data['y'].mean()) / data['y'].std()
                ),
                'reason': self._infer_anomaly_reason(idx, data)
            })

        self.anomalies[material] = anomalies

        return {
            'material': material,
            'total_records': len(data),
            'anomalies_detected': len(anomalies),
            'anomaly_percentage': round(len(anomalies) / len(data) * 100, 2),
            'anomalies': anomalies[:10],  # Top 10
            'method': method,
            'threshold': threshold
        }

    def _infer_anomaly_reason(self, idx: int, data: pd.DataFrame) -> str:
        """Infer possible reason for anomaly."""
        date = data.loc[idx, 'ds']
        value = data.loc[idx, 'y']
        mean = data['y'].mean()

        if value > mean * 1.5:
            return "Demand spike - possible promotion or special event"
        elif value < mean * 0.5:
            return "Demand drop - possible holiday or supply issue"
        else:
            return "Unusual pattern detected"

    def decompose_time_series(
        self,
        material: str,
        data: pd.DataFrame,
        period: int = 365
    ) -> Dict[str, Any]:
        """
        Decompose time series into trend, seasonality, and residual components.
        """
        try:
            from statsmodels.tsa.seasonal import seasonal_decompose
            decomposition = seasonal_decompose(data['y'], model='additive', period=period)

            return {
                'material': material,
                'trend': decomposition.trend.fillna(0).tolist(),
                'seasonal': decomposition.seasonal.fillna(0).tolist(),
                'residual': decomposition.resid.fillna(0).tolist(),
                'original': data['y'].tolist(),
                'dates': data['ds'].astype(str).tolist(),
                'trend_direction': 'upward' if decomposition.trend.iloc[-1] > decomposition.trend.iloc[0] else 'downward',
                'seasonal_strength': float(np.std(decomposition.seasonal) / np.std(decomposition.resid)) if np.std(decomposition.resid) > 0 else 0
            }
        except ImportError:
            self.logger.warning("statsmodels not available for decomposition")
            return {'error': 'statsmodels not available'}

    def analyze_seasonality(
        self,
        material: str,
        data: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Detailed seasonality analysis by month, quarter, and day of week.
        """
        seasonality = {
            'by_month': {},
            'by_quarter': {},
            'by_day_of_week': {},
            'by_weekend': {}
        }

        # Monthly analysis
        monthly = data.groupby('month')['y'].agg(['mean', 'std', 'min', 'max', 'count'])
        for month in range(1, 13):
            if month in monthly.index:
                seasonality['by_month'][month] = {
                    'mean': float(monthly.loc[month, 'mean']),
                    'std': float(monthly.loc[month, 'std']),
                    'min': float(monthly.loc[month, 'min']),
                    'max': float(monthly.loc[month, 'max']),
                    'count': int(monthly.loc[month, 'count']),
                    'month_name': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]
                }

        # Quarterly analysis
        quarterly = data.groupby('quarter')['y'].agg(['mean', 'std', 'min', 'max'])
        for quarter in range(1, 5):
            if quarter in quarterly.index:
                seasonality['by_quarter'][quarter] = {
                    'mean': float(quarterly.loc[quarter, 'mean']),
                    'std': float(quarterly.loc[quarter, 'std']),
                    'min': float(quarterly.loc[quarter, 'min']),
                    'max': float(quarterly.loc[quarter, 'max'])
                }

        # Day of week analysis
        dow_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        dow = data.groupby('day_of_week')['y'].agg(['mean', 'std', 'min', 'max'])
        for day in range(7):
            if day in dow.index:
                seasonality['by_day_of_week'][dow_names[day]] = {
                    'mean': float(dow.loc[day, 'mean']),
                    'std': float(dow.loc[day, 'std']),
                    'min': float(dow.loc[day, 'min']),
                    'max': float(dow.loc[day, 'max'])
                }

        # Weekend vs weekday
        weekend = data.groupby('is_weekend')['y'].agg(['mean', 'std', 'min', 'max'])
        seasonality['by_weekend'] = {
            'weekday': {
                'mean': float(weekend.loc[False, 'mean']) if False in weekend.index else 0,
                'std': float(weekend.loc[False, 'std']) if False in weekend.index else 0
            },
            'weekend': {
                'mean': float(weekend.loc[True, 'mean']) if True in weekend.index else 0,
                'std': float(weekend.loc[True, 'std']) if True in weekend.index else 0
            }
        }

        self.seasonality_patterns[material] = seasonality
        return seasonality

    def analyze_trend(
        self,
        material: str,
        data: pd.DataFrame,
        window: int = 30
    ) -> Dict[str, Any]:
        """
        Detailed trend analysis with growth rate and momentum.
        """
        # Calculate moving averages
        ma_7 = data['y'].rolling(window=7).mean()
        ma_30 = data['y'].rolling(window=30).mean()
        ma_90 = data['y'].rolling(window=90).mean()

        # Calculate growth rate
        growth_rate = data['y'].pct_change().mean() * 100

        # Calculate momentum (rate of change)
        momentum = (data['y'].iloc[-1] - data['y'].iloc[-30]) / data['y'].iloc[-30] * 100

        # Linear regression for trend
        x = np.arange(len(data)).reshape(-1, 1)
        y = data['y'].values

        try:
            from sklearn.linear_model import LinearRegression
            lr = LinearRegression()
            lr.fit(x, y)
            trend_slope = float(lr.coef_[0])
            trend_r2 = float(lr.score(x, y))
        except:
            trend_slope = 0
            trend_r2 = 0

        trend_analysis = {
            'material': material,
            'current_value': float(data['y'].iloc[-1]),
            'average_value': float(data['y'].mean()),
            'growth_rate_percent': round(growth_rate, 2),
            'momentum_percent': round(momentum, 2),
            'trend_direction': 'upward' if trend_slope > 0 else 'downward',
            'trend_strength': round(abs(trend_slope), 4),
            'trend_r2': round(trend_r2, 3),
            'moving_averages': {
                '7_day': float(ma_7.iloc[-1]) if not pd.isna(ma_7.iloc[-1]) else 0,
                '30_day': float(ma_30.iloc[-1]) if not pd.isna(ma_30.iloc[-1]) else 0,
                '90_day': float(ma_90.iloc[-1]) if not pd.isna(ma_90.iloc[-1]) else 0
            },
            'volatility': float(data['y'].std()),
            'coefficient_of_variation': round(data['y'].std() / data['y'].mean(), 3)
        }

        self.trend_analysis[material] = trend_analysis
        return trend_analysis

    def forecast_with_prophet(
        self,
        material: str,
        data: pd.DataFrame,
        periods: int = 30,
        confidence_interval: float = 0.95
    ) -> Dict[str, Any]:
        """
        Advanced Prophet forecasting with detailed uncertainty quantification.
        """
        if not PROPHET_AVAILABLE:
            return {'error': 'Prophet not available'}

        try:
            # Prepare data
            df = data[['ds', 'y']].copy()

            # Train Prophet model
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                interval_width=confidence_interval,
                changepoint_prior_scale=0.05
            )

            model.fit(df)

            # Make future dataframe
            future = model.make_future_dataframe(periods=periods)
            forecast = model.predict(future)

            # Extract forecast for future periods only
            future_forecast = forecast[forecast['ds'] > data['ds'].max()].copy()

            # Calculate additional metrics
            forecast_data = []
            for idx, row in future_forecast.iterrows():
                forecast_data.append({
                    'date': row['ds'].isoformat(),
                    'forecast': float(row['yhat']),
                    'lower_bound': float(row['yhat_lower']),
                    'upper_bound': float(row['yhat_upper']),
                    'trend': float(row['trend']),
                    'yearly_seasonality': float(row.get('yearly', 0)),
                    'weekly_seasonality': float(row.get('weekly', 0)),
                    'uncertainty_width': float(row['yhat_upper'] - row['yhat_lower']),
                    'confidence_interval': confidence_interval
                })

            # Calculate accuracy metrics on historical data
            historical_forecast = forecast[forecast['ds'] <= data['ds'].max()].copy()
            historical_forecast = historical_forecast.merge(
                data[['ds', 'y']], on='ds', how='inner'
            )

            mae = np.mean(np.abs(historical_forecast['yhat'] - historical_forecast['y']))
            rmse = np.sqrt(np.mean((historical_forecast['yhat'] - historical_forecast['y']) ** 2))
            mape = np.mean(np.abs(
                (historical_forecast['y'] - historical_forecast['yhat']) / historical_forecast['y']
            )) * 100

            return {
                'material': material,
                'forecast_period': periods,
                'confidence_interval': confidence_interval,
                'forecast': forecast_data,
                'accuracy_metrics': {
                    'mae': round(mae, 2),
                    'rmse': round(rmse, 2),
                    'mape': round(mape, 2)
                },
                'summary': {
                    'average_forecast': round(np.mean([f['forecast'] for f in forecast_data]), 2),
                    'min_forecast': round(min([f['forecast'] for f in forecast_data]), 2),
                    'max_forecast': round(max([f['forecast'] for f in forecast_data]), 2),
                    'average_uncertainty': round(np.mean([f['uncertainty_width'] for f in forecast_data]), 2)
                }
            }

        except Exception as e:
            self.logger.error(f"Error in Prophet forecasting: {e}")
            return {'error': str(e)}

    def scenario_based_forecast(
        self,
        material: str,
        data: pd.DataFrame,
        periods: int = 30
    ) -> Dict[str, Any]:
        """
        Generate multiple scenario forecasts: optimistic, realistic, pessimistic.
        """
        base_forecast = self.forecast_with_prophet(material, data, periods)

        if 'error' in base_forecast:
            return base_forecast

        scenarios = {}

        # Optimistic scenario: +15% growth
        optimistic = []
        for item in base_forecast['forecast']:
            optimistic.append({
                **item,
                'forecast': item['forecast'] * 1.15,
                'upper_bound': item['upper_bound'] * 1.15,
                'lower_bound': item['lower_bound'] * 1.15,
                'scenario': 'optimistic'
            })
        scenarios['optimistic'] = optimistic

        # Realistic scenario: base forecast
        scenarios['realistic'] = [
            {**item, 'scenario': 'realistic'}
            for item in base_forecast['forecast']
        ]

        # Pessimistic scenario: -15% decline
        pessimistic = []
        for item in base_forecast['forecast']:
            pessimistic.append({
                **item,
                'forecast': item['forecast'] * 0.85,
                'upper_bound': item['upper_bound'] * 0.85,
                'lower_bound': item['lower_bound'] * 0.85,
                'scenario': 'pessimistic'
            })
        scenarios['pessimistic'] = pessimistic

        return {
            'material': material,
            'periods': periods,
            'scenarios': scenarios,
            'scenario_summary': {
                'optimistic_avg': round(np.mean([f['forecast'] for f in optimistic]), 2),
                'realistic_avg': round(np.mean([f['forecast'] for f in scenarios['realistic']]), 2),
                'pessimistic_avg': round(np.mean([f['forecast'] for f in pessimistic]), 2)
            }
        }

    def what_if_analysis(
        self,
        material: str,
        data: pd.DataFrame,
        change_type: str = 'percentage',
        change_value: float = 10.0,
        periods: int = 30
    ) -> Dict[str, Any]:
        """
        What-if analysis: How would demand change if conditions change?

        change_type: 'percentage', 'absolute', 'seasonal_shift'
        """
        base_forecast = self.forecast_with_prophet(material, data, periods)

        if 'error' in base_forecast:
            return base_forecast

        adjusted_forecast = []

        for item in base_forecast['forecast']:
            if change_type == 'percentage':
                factor = 1 + (change_value / 100)
                adjusted_value = item['forecast'] * factor
            elif change_type == 'absolute':
                adjusted_value = item['forecast'] + change_value
            elif change_type == 'seasonal_shift':
                # Shift based on seasonal pattern
                adjusted_value = item['forecast'] * (1 + change_value / 100)
            else:
                adjusted_value = item['forecast']

            adjusted_forecast.append({
                **item,
                'original_forecast': item['forecast'],
                'adjusted_forecast': adjusted_value,
                'change': adjusted_value - item['forecast'],
                'change_percent': round((adjusted_value - item['forecast']) / item['forecast'] * 100, 2)
            })

        return {
            'material': material,
            'change_type': change_type,
            'change_value': change_value,
            'base_forecast': base_forecast['forecast'],
            'adjusted_forecast': adjusted_forecast,
            'impact_summary': {
                'total_change': round(sum([f['change'] for f in adjusted_forecast]), 2),
                'average_change_percent': round(np.mean([f['change_percent'] for f in adjusted_forecast]), 2),
                'max_change': round(max([f['change'] for f in adjusted_forecast]), 2),
                'min_change': round(min([f['change'] for f in adjusted_forecast]), 2)
            }
        }

    def get_forecast_insights(
        self,
        material: str,
        data: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Generate comprehensive insights from historical data and forecasts.
        """
        insights = {
            'material': material,
            'data_quality': {
                'total_records': len(data),
                'date_range': f"{data['ds'].min().date()} to {data['ds'].max().date()}",
                'missing_values': int(data['y'].isna().sum()),
                'data_completeness_percent': round((1 - data['y'].isna().sum() / len(data)) * 100, 2)
            },
            'demand_statistics': {
                'mean': round(float(data['y'].mean()), 2),
                'median': round(float(data['y'].median()), 2),
                'std_dev': round(float(data['y'].std()), 2),
                'min': round(float(data['y'].min()), 2),
                'max': round(float(data['y'].max()), 2),
                'range': round(float(data['y'].max() - data['y'].min()), 2)
            },
            'trend': self.analyze_trend(material, data),
            'seasonality': self.analyze_seasonality(material, data),
            'anomalies': self.detect_anomalies(material, data),
            'decomposition': self.decompose_time_series(material, data),
            'key_findings': self._generate_key_findings(material, data)
        }

        return insights

    def _generate_key_findings(self, material: str, data: pd.DataFrame) -> List[str]:
        """Generate key findings from data analysis."""
        findings = []

        # Trend finding
        trend = self.analyze_trend(material, data)
        if trend['growth_rate_percent'] > 5:
            findings.append(f"Strong upward trend: {trend['growth_rate_percent']:.1f}% annual growth")
        elif trend['growth_rate_percent'] < -5:
            findings.append(f"Declining trend: {trend['growth_rate_percent']:.1f}% annual decline")
        else:
            findings.append("Stable demand with minimal trend")

        # Seasonality finding
        seasonality = self.analyze_seasonality(material, data)
        monthly_means = [v['mean'] for v in seasonality['by_month'].values()]
        seasonality_strength = (max(monthly_means) - min(monthly_means)) / np.mean(monthly_means)
        if seasonality_strength > 0.3:
            findings.append(f"Strong seasonality detected: {seasonality_strength:.1%} variation")
        else:
            findings.append("Weak seasonality: demand relatively stable throughout year")

        # Volatility finding
        cv = trend['coefficient_of_variation']
        if cv > 0.3:
            findings.append(f"High volatility: {cv:.1%} coefficient of variation")
        elif cv > 0.15:
            findings.append(f"Moderate volatility: {cv:.1%} coefficient of variation")
        else:
            findings.append("Low volatility: predictable demand pattern")

        # Anomaly finding
        anomalies = self.detect_anomalies(material, data)
        if anomalies['anomaly_percentage'] > 5:
            findings.append(f"Multiple anomalies detected: {anomalies['anomaly_percentage']:.1f}% of data")

        return findings


# Global instance
enhanced_demand_forecast_service = EnhancedDemandForecastService()
