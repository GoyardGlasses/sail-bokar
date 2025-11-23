/**
 * DelayPrediction Test Suite
 * Tests for Delay Prediction page and components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DelayPage from '../pages/DelayPage'
import DelayForm from '../components/DelayForm'
import DelayResults from '../components/DelayResults'
import * as delayApi from '../api/delayApi'

// Mock the API
jest.mock('../api/delayApi')

describe('DelayPage', () => {
  const mockResponse = {
    confidence: 0.81,
    summary: {
      overall_delay_prob: 0.12,
      top_risk: ['Bokaro->Dhanbad', 'Bokaro->Hatia'],
    },
    routes: [
      {
        route: 'Bokaro->Dhanbad',
        predicted_delay_hours: 12,
        probability: 0.21,
        action: 're-route',
      },
      {
        route: 'Bokaro->Hatia',
        predicted_delay_hours: 8,
        probability: 0.15,
        action: 'monitor',
      },
      {
        route: 'Bokaro->Kolkata',
        predicted_delay_hours: 5,
        probability: 0.08,
        action: 'proceed',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    delayApi.getMaterials.mockResolvedValue(['All', 'HR_Coils', 'CR_Coils', 'Plates'])
    delayApi.getDestinations.mockResolvedValue(['Kolkata', 'Patna', 'Haldia', 'Dhanbad'])
  })

  test('renders delay prediction page title', async () => {
    render(<DelayPage />)
    await waitFor(() => {
      expect(screen.getByText('Delay Prediction')).toBeInTheDocument()
    })
  })

  test('renders delay prediction form', async () => {
    render(<DelayPage />)
    await waitFor(() => {
      expect(screen.getByText('Delay Prediction Parameters')).toBeInTheDocument()
      expect(screen.getByLabelText('Start date for delay prediction')).toBeInTheDocument()
      expect(screen.getByLabelText('End date for delay prediction')).toBeInTheDocument()
    })
  })

  test('calls API with form data on submit', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Run Delay Prediction')).toBeInTheDocument()
    })

    const submitButton = screen.getByText('Run Delay Prediction')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(delayApi.predictDelay).toHaveBeenCalled()
    })
  })

  test('displays results after successful prediction', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Overall Delay Probability')).toBeInTheDocument()
      expect(screen.getByText('12.0%')).toBeInTheDocument()
    })
  })

  test('displays confidence score', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Confidence Score')).toBeInTheDocument()
      expect(screen.getByText('81%')).toBeInTheDocument()
    })
  })

  test('displays top risk routes', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Top Risk Routes')).toBeInTheDocument()
      expect(screen.getByText('Bokaro->Dhanbad')).toBeInTheDocument()
      expect(screen.getByText('Bokaro->Hatia')).toBeInTheDocument()
    })
  })

  test('renders chart with route data', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Delay Probability by Route')).toBeInTheDocument()
    })
  })

  test('renders results table with route details', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Route Details')).toBeInTheDocument()
      expect(screen.getByText('Bokaro->Dhanbad')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
    })
  })

  test('handles empty response gracefully', async () => {
    delayApi.predictDelay.mockResolvedValue({ routes: [] })
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText(/No data for selected range/)).toBeInTheDocument()
    })
  })

  test('handles API errors', async () => {
    delayApi.predictDelay.mockRejectedValue(new Error('API Error'))
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText(/Prediction failed/)).toBeInTheDocument()
    })
  })

  test('retry button works after error', async () => {
    delayApi.predictDelay.mockRejectedValueOnce(new Error('API Error'))
    delayApi.predictDelay.mockResolvedValueOnce(mockResponse)
    
    render(<DelayPage />)
    
    // First attempt fails
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText(/Prediction failed/)).toBeInTheDocument()
    })

    // Retry succeeds
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Overall Delay Probability')).toBeInTheDocument()
    })
  })

  test('CSV download button is present', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Download CSV')).toBeInTheDocument()
    })
  })
})

describe('DelayForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    delayApi.getMaterials.mockResolvedValue(['All', 'HR_Coils', 'CR_Coils'])
    delayApi.getDestinations.mockResolvedValue(['Kolkata', 'Patna', 'Haldia'])
  })

  test('renders all form fields', async () => {
    render(<DelayForm onSubmit={mockOnSubmit} isLoading={false} />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Start date for delay prediction')).toBeInTheDocument()
      expect(screen.getByLabelText('End date for delay prediction')).toBeInTheDocument()
      expect(screen.getByLabelText('Material type for delay prediction')).toBeInTheDocument()
      expect(screen.getByLabelText('Destination for delay prediction')).toBeInTheDocument()
      expect(screen.getByLabelText('Priority level slider')).toBeInTheDocument()
    })
  })

  test('calls onSubmit with form data', async () => {
    render(<DelayForm onSubmit={mockOnSubmit} isLoading={false} />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
      const callData = mockOnSubmit.mock.calls[0][0]
      expect(callData).toHaveProperty('start_date')
      expect(callData).toHaveProperty('end_date')
      expect(callData).toHaveProperty('material')
      expect(callData).toHaveProperty('destination')
      expect(callData).toHaveProperty('priority')
    })
  })

  test('disables form when loading', async () => {
    render(<DelayForm onSubmit={mockOnSubmit} isLoading={true} />)
    
    await waitFor(() => {
      expect(screen.getByText('Predicting...')).toBeInTheDocument()
    })
  })
})

describe('DelayResults', () => {
  const mockData = {
    confidence: 0.81,
    summary: {
      overall_delay_prob: 0.12,
      top_risk: ['Bokaro->Dhanbad', 'Bokaro->Hatia'],
    },
    routes: [
      {
        route: 'Bokaro->Dhanbad',
        predicted_delay_hours: 12,
        probability: 0.21,
        action: 're-route',
      },
    ],
  }

  test('renders summary cards', () => {
    render(<DelayResults data={mockData} isLoading={false} error={null} onRetry={() => {}} />)
    
    expect(screen.getByText('Overall Delay Probability')).toBeInTheDocument()
    expect(screen.getByText('Confidence Score')).toBeInTheDocument()
    expect(screen.getByText('High Risk Routes')).toBeInTheDocument()
  })

  test('renders chart', () => {
    render(<DelayResults data={mockData} isLoading={false} error={null} onRetry={() => {}} />)
    
    expect(screen.getByText('Delay Probability by Route')).toBeInTheDocument()
  })

  test('renders results table', () => {
    render(<DelayResults data={mockData} isLoading={false} error={null} onRetry={() => {}} />)
    
    expect(screen.getByText('Route Details')).toBeInTheDocument()
    expect(screen.getByText('Bokaro->Dhanbad')).toBeInTheDocument()
  })

  test('renders download button', () => {
    render(<DelayResults data={mockData} isLoading={false} error={null} onRetry={() => {}} />)
    
    expect(screen.getByText('Download CSV')).toBeInTheDocument()
  })
})
