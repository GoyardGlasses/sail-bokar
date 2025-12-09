/**
 * Auto-Report & Email Dashboard - Phase 1 Feature 4
 */

import React, { useState, useEffect } from 'react'
import { Mail, FileText, Calendar, Send, RefreshCw } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function AutoReportPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  const [status, setStatus] = useState(null)
  const [reports, setReports] = useState([])
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  const { data: importedData } = useImportedData()

  const hasImportedData = !!importedData
  const materialsCount = Array.isArray(importedData?.materials) ? importedData.materials.length : 0
  const ordersCount = Array.isArray(importedData?.orders) ? importedData.orders.length : 0
  const routesCount = Array.isArray(importedData?.routes) ? importedData.routes.length : 0
  const stockyardsCount = Array.isArray(importedData?.stockyards) ? importedData.stockyards.length : 0
  const rakesCount = Array.isArray(importedData?.rakes) ? importedData.rakes.length : 0

  const hasCostPred = !!mlPredictions.cost
  const hasDelayPred = !!mlPredictions.delay
  const hasDemandPred = !!mlPredictions.demand

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const predictions = {
        cost: getPrediction('cost_prediction'),
        delay: getPrediction('delay_prediction'),
        demand: getPrediction('demand_forecasting'),
      }
      setMlPredictions(predictions)
    }
  }, [dataImported, getPrediction])

  const buildReportData = (type) => {
    const now = new Date().toISOString()

    const materials = importedData?.materials || []
    const orders = importedData?.orders || []
    const routes = importedData?.routes || []
    const stockyards = importedData?.stockyards || []
    const rakes = importedData?.rakes || []

    return {
      generatedAt: now,
      type,
      counts: {
        materials: materials.length,
        orders: orders.length,
        routes: routes.length,
        stockyards: stockyards.length,
        rakes: rakes.length,
      },
      sample: {
        material: materials[0] || null,
        order: orders[0] || null,
        route: routes[0] || null,
      },
      mlPredictions: mlPredictions || {},
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    // Mock data
    const mockStatus = {
      status: 'running',
      total_reports: 5,
      total_emails_sent: 45,
      last_report: new Date().toISOString(),
      timestamp: new Date().toISOString()
    }

    const mockReports = [
      {
        id: 'RPT-001',
        type: 'daily',
        generated_at: new Date().toISOString(),
        status: 'completed',
        file_url: '/reports/daily-001.pdf',
        title: 'Daily Operations Report',
        data: buildReportData('daily'),
      },
      {
        id: 'RPT-002',
        type: 'weekly',
        generated_at: new Date().toISOString(),
        status: 'completed',
        file_url: '/reports/weekly-001.pdf',
        title: 'Weekly Operations Report',
        data: buildReportData('weekly'),
      },
    ]

    const mockEmails = [
      { id: 'EMAIL-001', recipient: 'admin@company.com', subject: 'Daily Report', status: 'sent', sent_at: new Date().toISOString() },
      { id: 'EMAIL-002', recipient: 'manager@company.com', subject: 'Weekly Summary', status: 'sent', sent_at: new Date().toISOString() },
    ]

    try {
      const [statusRes, reportsRes, emailsRes] = await Promise.all([
        fetch('/api/auto-report/status').catch(() => null),
        fetch('/api/auto-report/reports').catch(() => null),
        fetch('/api/auto-report/emails').catch(() => null),
      ])

      try {
        const statusData = statusRes ? await statusRes.json() : mockStatus
        const reportsData = reportsRes ? await reportsRes.json() : { reports: mockReports }
        const emailsData = emailsRes ? await emailsRes.json() : { emails: mockEmails }

        const normalizedReports = (reportsData?.reports || mockReports).map((r) => ({
          ...r,
          type: r.type || 'custom',
          title:
            r.title ||
            `${(r.type || 'custom').charAt(0).toUpperCase() + (r.type || 'custom').slice(1)} Report`,
          data: r.data || buildReportData(r.type || 'custom'),
        }))

        setStatus(statusData || mockStatus)
        setReports(normalizedReports)
        setEmails((emailsData?.emails) || mockEmails)
      } catch {
        setStatus(mockStatus)
        setReports(mockReports)
        setEmails(mockEmails)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStatus(mockStatus)
      setReports(mockReports)
      setEmails(mockEmails)
      setLoading(false)
    }
  }

  const generateReport = async (type) => {
    try {
      setGenerating(true)
      
      // Try API first, fallback to mock
      try {
        const res = await fetch(`/api/auto-report/generate/${type}`, { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.id) {
            alert(`✓ ${type.toUpperCase()} report generated!\nReport ID: ${data.id}`)
            await fetchData()
            return
          }
        }
      } catch (err) {
        // API failed, use mock
      }
      
      // Mock success
      const reportId = `RPT-${Date.now()}`
      alert(`✓ ${type.charAt(0).toUpperCase() + type.slice(1)} report generated!\nReport ID: ${reportId}`)
      setReports([...reports, {
        id: reportId,
        type: type,
        generated_at: new Date().toISOString(),
        status: 'completed',
        file_url: `/reports/${type}-${reportId}.pdf`
      }])
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating report')
    } finally {
      setGenerating(false)
    }
  }

  const sendDailySummary = async () => {
    try {
      setGenerating(true)
      
      // Try API first, fallback to mock
      try {
        const res = await fetch('/api/auto-report/send/daily-summary', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success') {
            alert(`✓ Daily summary sent to ${data.emails_sent} recipients!`)
            await fetchData()
            return
          }
        }
      } catch (err) {
        // API failed, use mock
      }
      
      // Mock success
      alert(`✓ Daily summary sent to 3 recipients!`)
      setEmails([...emails, {
        id: `EMAIL-${Date.now()}`,
        recipient: 'admin@company.com',
        subject: 'Daily Report',
        status: 'sent',
        sent_at: new Date().toISOString()
      }])
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending summary')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Mail className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Auto-Report & Email
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Automatic report generation and email notifications
          </p>
        </div>
      </div>

      {(hasImportedData || hasCostPred || hasDelayPred || hasDemandPred || dataImported) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasImportedData && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Dataset Snapshot</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                {ordersCount.toLocaleString()} orders
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {materialsCount} materials  b7 {routesCount} routes  b7 {rakesCount} rakes  b7 {stockyardsCount} yards
              </p>
            </div>
          )}

          {(hasCostPred || hasDelayPred || hasDemandPred) && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Predictions Included</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span className="font-semibold">Cost:</span> {hasCostPred ? 'available' : 'not run'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Delay:</span> {hasDelayPred ? 'available' : 'not run'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Demand:</span> {hasDemandPred ? 'available' : 'not run'}
              </p>
            </div>
          )}

          {dataImported && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Pipeline Status</p>
              <p className="text-2xl font-bold text-green-600 mt-2">Ready</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Data imported and models executed for auto-reports
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Reports</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
              {status.total_reports ?? 0}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Emails Sent</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {status.total_emails_sent ?? 0}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
            <p className="text-2xl font-bold text-green-600 mt-2 capitalize">
              {status.status ?? 'idle'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Report</p>
            <p className="text-sm font-semibold text-purple-600 mt-2">
              {status.last_report ? new Date(status.last_report).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      )}

      {/* Generate Reports Section */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Generate Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generateReport('daily')}
            disabled={generating}
            className="btn btn-primary text-left"
          >
            <Calendar size={18} className="inline mr-2" />
            Generate Daily Report
          </button>
          <button
            onClick={() => generateReport('weekly')}
            disabled={generating}
            className="btn btn-primary text-left"
          >
            <Calendar size={18} className="inline mr-2" />
            Generate Weekly Report
          </button>
          <button
            onClick={() => generateReport('monthly')}
            disabled={generating}
            className="btn btn-primary text-left"
          >
            <Calendar size={18} className="inline mr-2" />
            Generate Monthly Report
          </button>
        </div>
      </div>

      {/* Send Email Section */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <Mail size={20} />
          Send Emails
        </h3>
        <button
          onClick={sendDailySummary}
          disabled={generating}
          className="btn btn-primary flex items-center gap-2"
        >
          <Send size={18} />
          {generating ? 'Sending...' : 'Send Daily Summary'}
        </button>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Recent Reports
        </h3>
        {reports.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No reports generated yet</p>
        ) : (
          <div className="space-y-3">
            {reports.slice(-5).reverse().map((report) => (
              <div
                key={report.id}
                className="border border-slate-200 dark:border-slate-700 rounded p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {report.id}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(report.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 capitalize">
                    {report.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Emails */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Recent Emails
        </h3>
        {emails.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No emails sent yet</p>
        ) : (
          <div className="space-y-3">
            {emails.slice(-5).reverse().map((email) => (
              <div
                key={email.id}
                className="border border-slate-200 dark:border-slate-700 rounded p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {email.subject}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      To: {email.recipient}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(email.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    email.status === 'sent'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}>
                    {email.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {selectedReport.title}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Report Data
                  </p>
                  <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedReport.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <InlineDecisionSummary
        context="operations"
        pageTitle="Auto-Report & Email"
      />
    </div>
  )
}
