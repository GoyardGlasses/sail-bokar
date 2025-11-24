/**
 * Metrics Service
 * Collects, aggregates, and exposes system metrics
 */

import { apiClient, APIMetrics, SystemKPIs, DatabaseMetrics, ModelMetrics } from './api'

// ============================================================================
// METRICS AGGREGATOR
// ============================================================================

export interface MetricsSnapshot {
  timestamp: string
  api: {
    avg_latency_ms: number
    error_rate: number
    requests_total: number
    errors_total: number
  }
  inventory: {
    ingest_latency_p95_ms: number
    sync_success_ratio: number
    records_per_minute: number
  }
  database: {
    total_rows: number
    total_size_mb: number
    query_p95_ms: number
  }
  models: {
    avg_inference_p95_ms: number
    avg_accuracy: number
    drift_alerts: number
  }
  kpis: SystemKPIs
}

export class MetricsService {
  private metricsHistory: MetricsSnapshot[] = []
  private maxHistorySize = 1440 // 24 hours at 1-minute intervals
  private collectionInterval: NodeJS.Timeout | null = null

  // ========================================================================
  // COLLECTION
  // ========================================================================

  async collectMetrics(): Promise<MetricsSnapshot> {
    const [apiMetrics, inventoryMetrics, dbMetrics, modelMetrics, kpis] = await Promise.all([
      this.getAPIMetrics(),
      apiClient.getInventoryMetrics(),
      apiClient.getDatabaseMetrics(),
      apiClient.getModelMetrics(),
      apiClient.getSystemKPIs(),
    ])

    const snapshot: MetricsSnapshot = {
      timestamp: new Date().toISOString(),
      api: apiMetrics,
      inventory: {
        ingest_latency_p95_ms: inventoryMetrics.ingest_latency_ms.p95,
        sync_success_ratio: inventoryMetrics.sync_success_ratio,
        records_per_minute: inventoryMetrics.records_processed_per_minute,
      },
      database: {
        total_rows: Object.values(dbMetrics.table_rows).reduce((a, b) => a + b, 0),
        total_size_mb: Object.values(dbMetrics.table_size_bytes).reduce((a, b) => a + b, 0) / 1024 / 1024,
        query_p95_ms: Math.max(...Object.values(dbMetrics.query_duration_seconds).map((v) => v * 1000)),
      },
      models: {
        avg_inference_p95_ms:
          modelMetrics.reduce((sum, m) => sum + m.inference_latency_ms.p95, 0) / modelMetrics.length,
        avg_accuracy: modelMetrics.reduce((sum, m) => {
          const values = Object.values(m.accuracy_metrics).filter((v) => typeof v === 'number')
          return sum + (values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0)
        }, 0) / modelMetrics.length,
        drift_alerts: modelMetrics.filter((m) => m.data_drift_score > 0.15).length,
      },
      kpis,
    }

    this.metricsHistory.push(snapshot)
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift()
    }

    return snapshot
  }

  private async getAPIMetrics() {
    const metrics = apiClient.getMetrics()
    const totalRequests = metrics.length
    const totalErrors = metrics.filter((m) => m.error).length

    return {
      avg_latency_ms: apiClient.getAverageLatency(),
      error_rate: apiClient.getErrorRate(),
      requests_total: totalRequests,
      errors_total: totalErrors,
    }
  }

  // ========================================================================
  // ALERTS
  // ========================================================================

  async checkAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = []
    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1]

    if (!latestMetrics) return alerts

    // API Alerts
    if (latestMetrics.api.error_rate > 0.02) {
      alerts.push({
        id: `api-error-${Date.now()}`,
        severity: 'P1',
        title: 'High API Error Rate',
        message: `Error rate ${(latestMetrics.api.error_rate * 100).toFixed(2)}% exceeds 2% threshold`,
        timestamp: new Date().toISOString(),
        category: 'api',
      })
    }

    if (latestMetrics.api.avg_latency_ms > 2500) {
      alerts.push({
        id: `api-latency-${Date.now()}`,
        severity: 'P2',
        title: 'High API Latency',
        message: `Average latency ${latestMetrics.api.avg_latency_ms.toFixed(0)}ms exceeds 2500ms`,
        timestamp: new Date().toISOString(),
        category: 'api',
      })
    }

    // Inventory Alerts
    if (latestMetrics.inventory.sync_success_ratio < 0.99) {
      alerts.push({
        id: `inventory-sync-${Date.now()}`,
        severity: 'P1',
        title: 'Inventory Sync Failure',
        message: `Sync success ratio ${(latestMetrics.inventory.sync_success_ratio * 100).toFixed(2)}% below 99%`,
        timestamp: new Date().toISOString(),
        category: 'inventory',
      })
    }

    if (latestMetrics.inventory.ingest_latency_p95_ms > 2000) {
      alerts.push({
        id: `inventory-latency-${Date.now()}`,
        severity: 'P2',
        title: 'High Inventory Ingest Latency',
        message: `P95 latency ${latestMetrics.inventory.ingest_latency_p95_ms}ms exceeds 2000ms`,
        timestamp: new Date().toISOString(),
        category: 'inventory',
      })
    }

    // Database Alerts
    if (latestMetrics.database.total_size_mb > 1024) {
      alerts.push({
        id: `db-size-${Date.now()}`,
        severity: 'P2',
        title: 'Large Database Size',
        message: `Total DB size ${latestMetrics.database.total_size_mb.toFixed(0)}MB exceeds 1GB`,
        timestamp: new Date().toISOString(),
        category: 'database',
      })
    }

    if (latestMetrics.database.query_p95_ms > 1000) {
      alerts.push({
        id: `db-query-${Date.now()}`,
        severity: 'P2',
        title: 'Slow Database Queries',
        message: `Query P95 ${latestMetrics.database.query_p95_ms.toFixed(0)}ms exceeds 1000ms`,
        timestamp: new Date().toISOString(),
        category: 'database',
      })
    }

    // Model Alerts
    if (latestMetrics.models.drift_alerts > 0) {
      alerts.push({
        id: `model-drift-${Date.now()}`,
        severity: 'P1',
        title: 'Model Data Drift Detected',
        message: `${latestMetrics.models.drift_alerts} model(s) showing data drift > 0.15`,
        timestamp: new Date().toISOString(),
        category: 'models',
      })
    }

    // KPI Alerts
    if (latestMetrics.kpis.rake_utilization < 0.5) {
      alerts.push({
        id: `kpi-utilization-${Date.now()}`,
        severity: 'P2',
        title: 'Low Rake Utilization',
        message: `Rake utilization ${(latestMetrics.kpis.rake_utilization * 100).toFixed(1)}% below 50%`,
        timestamp: new Date().toISOString(),
        category: 'kpi',
      })
    }

    return alerts
  }

  // ========================================================================
  // HISTORY & TRENDS
  // ========================================================================

  getMetricsHistory(): MetricsSnapshot[] {
    return this.metricsHistory
  }

  getLatestMetrics(): MetricsSnapshot | null {
    return this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null
  }

  getMetricsTrend(field: string, minutes: number = 60): number[] {
    const now = Date.now()
    const cutoff = now - minutes * 60 * 1000

    return this.metricsHistory
      .filter((m) => new Date(m.timestamp).getTime() > cutoff)
      .map((m) => {
        const keys = field.split('.')
        let value: any = m
        for (const key of keys) {
          value = value[key]
        }
        return typeof value === 'number' ? value : 0
      })
  }

  // ========================================================================
  // AUTO-COLLECTION
  // ========================================================================

  startAutoCollection(intervalMs: number = 60000) {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
    }

    this.collectionInterval = setInterval(() => {
      this.collectMetrics().catch((error) => {
        console.error('Failed to collect metrics:', error)
      })
    }, intervalMs)
  }

  stopAutoCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = null
    }
  }

  // ========================================================================
  // EXPORT
  // ========================================================================

  exportMetricsJSON(): string {
    return JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        history_size: this.metricsHistory.length,
        latest: this.getLatestMetrics(),
        history: this.metricsHistory,
      },
      null,
      2
    )
  }
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export interface Alert {
  id: string
  severity: 'P1' | 'P2' | 'P3'
  title: string
  message: string
  timestamp: string
  category: 'api' | 'inventory' | 'database' | 'models' | 'kpi'
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const metricsService = new MetricsService()

export default metricsService
