import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ForecastPage from '../pages/ForecastPage'
import ForecastConfig from '../components/ForecastConfig'
import ForecastCharts from '../components/ForecastCharts'
import * as forecastApi from '../api/forecastApi'

vi.mock('../api/forecastApi')

describe('Forecast Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forecast page with config and title', () => {
    render(<ForecastPage />)
    expect(screen.getByText('Demand Forecast')).toBeInTheDocument()
    expect(screen.getByText('Forecast Configuration')).toBeInTheDocument()
  })

  it('displays error message on forecast failure', async () => {
    const errorMsg = 'API Error'
    forecastApi.predictForecast.mockRejectedValueOnce(new Error(errorMsg))

    render(<ForecastPage />)
    const runButton = screen.getByText('Run Forecast')
    fireEvent.click(runButton)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMsg))).toBeInTheDocument()
    })
  })

  it('displays forecast results on success', async () => {
    const mockData = {
      predictions: [
        { date: '2025-11-01', demand: 7200, upper: 8100, lower: 6300 },
        { date: '2025-11-02', demand: 7500, upper: 8400, lower: 6600 },
      ],
      model_confidence: 0.75,
      summary: {
        predicted_tonnes: 7350,
        predicted_rakes: 46,
        predicted_cost: 330750,
      },
    }

    forecastApi.predictForecast.mockResolvedValueOnce(mockData)

    render(<ForecastPage />)
    const runButton = screen.getByText('Run Forecast')
    fireEvent.click(runButton)

    await waitFor(() => {
      expect(screen.getByText(/Demand Forecast with 90%/)).toBeInTheDocument()
    })
  })
})

describe('ForecastConfig Component', () => {
  it('renders all configuration options', () => {
    const mockOnRun = vi.fn()
    render(<ForecastConfig onRun={mockOnRun} isLoading={false} />)

    expect(screen.getByText('Training Window')).toBeInTheDocument()
    expect(screen.getByText('Forecast Horizon')).toBeInTheDocument()
    expect(screen.getByText('Variables to Forecast')).toBeInTheDocument()
  })

  it('calls onRun with correct config when button clicked', async () => {
    const mockOnRun = vi.fn()
    render(<ForecastConfig onRun={mockOnRun} isLoading={false} />)

    const runButton = screen.getByText('Run Forecast')
    fireEvent.click(runButton)

    await waitFor(() => {
      expect(mockOnRun).toHaveBeenCalledWith(
        expect.objectContaining({
          training_days: 60,
          horizon_days: 30,
          variables: expect.arrayContaining(['demand', 'rake_availability']),
        })
      )
    })
  })

  it('validates that at least one variable is selected', async () => {
    const mockOnRun = vi.fn()
    render(<ForecastConfig onRun={mockOnRun} isLoading={false} />)

    // Uncheck all variables
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox)
    })

    const runButton = screen.getByText('Run Forecast')
    fireEvent.click(runButton)

    await waitFor(() => {
      expect(mockOnRun).not.toHaveBeenCalled()
    })
  })

  it('disables run button when loading', () => {
    const mockOnRun = vi.fn()
    render(<ForecastConfig onRun={mockOnRun} isLoading={true} />)

    const runButton = screen.getByText('Running Forecast...')
    expect(runButton).toBeDisabled()
  })

  it('updates training window selection', () => {
    const mockOnRun = vi.fn()
    render(<ForecastConfig onRun={mockOnRun} isLoading={false} />)

    const trainingSelect = screen.getByDisplayValue('60')
    fireEvent.change(trainingSelect, { target: { value: '90' } })

    const runButton = screen.getByText('Run Forecast')
    fireEvent.click(runButton)

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        training_days: 90,
      })
    )
  })

  it('updates horizon selection', () => {
    const mockOnRun = vi.fn()
    render(<ForecastConfig onRun={mockOnRun} isLoading={false} />)

    const horizonSelects = screen.getAllByDisplayValue('30')
    fireEvent.change(horizonSelects[1], { target: { value: '14' } })

    const runButton = screen.getByText('Run Forecast')
    fireEvent.click(runButton)

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        horizon_days: 14,
      })
    )
  })
})

describe('ForecastCharts Component', () => {
  const mockData = {
    predictions: [
      { date: '2025-11-01', demand: 7200, upper: 8100, lower: 6300 },
      { date: '2025-11-02', demand: 7500, upper: 8400, lower: 6600 },
      { date: '2025-11-03', demand: 7100, upper: 8000, lower: 6200 },
    ],
    model_confidence: 0.75,
    historical_data: [
      { date: '2025-10-01', demand: 7000 },
      { date: '2025-10-02', demand: 7200 },
    ],
  }

  it('renders loading skeleton when isLoading is true', () => {
    render(<ForecastCharts data={null} isLoading={true} />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders nothing when no data', () => {
    const { container } = render(<ForecastCharts data={null} isLoading={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays KPI cards with correct values', () => {
    render(<ForecastCharts data={mockData} isLoading={false} />)

    expect(screen.getByText('Predicted Demand (Avg)')).toBeInTheDocument()
    expect(screen.getByText('Predicted Rakes Required')).toBeInTheDocument()
    expect(screen.getByText('Model Confidence')).toBeInTheDocument()
  })

  it('displays forecast table with predictions', () => {
    render(<ForecastCharts data={mockData} isLoading={false} />)

    expect(screen.getByText('Forecast Details')).toBeInTheDocument()
    expect(screen.getByText('2025-11-01')).toBeInTheDocument()
    expect(screen.getByText('7200')).toBeInTheDocument()
  })

  it('displays export buttons', () => {
    render(<ForecastCharts data={mockData} isLoading={false} />)

    expect(screen.getByText('Export as PNG')).toBeInTheDocument()
    expect(screen.getByText('Export as PDF')).toBeInTheDocument()
  })

  it('handles export button clicks', () => {
    render(<ForecastCharts data={mockData} isLoading={false} />)

    const pngButton = screen.getByText('Export as PNG')
    fireEvent.click(pngButton)

    // Should show alert (mocked by default in tests)
    expect(pngButton).toBeInTheDocument()
  })
})

describe('Forecast API', () => {
  it('generates mock forecast data with correct structure', async () => {
    const request = {
      training_days: 60,
      horizon_days: 30,
      variables: ['demand', 'rake_availability'],
    }

    const result = await forecastApi.predictForecast(request)

    expect(result).toHaveProperty('predictions')
    expect(result).toHaveProperty('model_confidence')
    expect(Array.isArray(result.predictions)).toBe(true)
    expect(result.predictions.length).toBe(30)
  })

  it('includes confidence interval bounds in predictions', async () => {
    const request = {
      training_days: 60,
      horizon_days: 7,
      variables: ['demand'],
    }

    const result = await forecastApi.predictForecast(request)

    result.predictions.forEach((pred) => {
      expect(pred).toHaveProperty('date')
      expect(pred).toHaveProperty('demand')
      expect(pred).toHaveProperty('upper')
      expect(pred).toHaveProperty('lower')
      expect(pred.upper).toBeGreaterThan(pred.demand)
      expect(pred.lower).toBeLessThan(pred.demand)
    })
  })

  it('generates historical data for training window', async () => {
    const request = {
      training_days: 60,
      horizon_days: 30,
      variables: ['demand'],
    }

    const result = await forecastApi.predictForecast(request)

    expect(result.historical_data).toBeDefined()
    expect(result.historical_data.length).toBe(60)
  })

  it('calculates summary statistics correctly', async () => {
    const request = {
      training_days: 60,
      horizon_days: 30,
      variables: ['demand'],
    }

    const result = await forecastApi.predictForecast(request)

    expect(result.summary).toBeDefined()
    expect(result.summary.predicted_tonnes).toBeGreaterThan(0)
    expect(result.summary.predicted_rakes).toBeGreaterThan(0)
  })
})
