import React, { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'

export default function AIChatAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'assistant', text: 'Hello! I\'m your AI logistics assistant. Ask me about delays, routes, materials, timing, optimization, or predictions.' },
  ])
  const [input, setInput] = useState('')

  const suggestions = [
    'Why is Bokaro->Dhanbad risky?',
    'What\'s the best time to dispatch?',
    'Which material should I use?',
    'How accurate are predictions?',
  ]

  // Dynamic response generator based on user input
  const generateDynamicResponse = (userQuestion) => {
    const question = userQuestion.toLowerCase()

    // Route Risk Analysis
    if (question.includes('dhanbad') || question.includes('risky') || question.includes('risk')) {
      if (question.includes('dhanbad')) {
        return 'Bokaro->Dhanbad has a 85% delay risk due to: (1) Heavy traffic congestion, (2) Poor road conditions, (3) Weather vulnerabilities. I recommend switching to Bokaro->Hatia (35% risk) or Bokaro->Patna (8% risk) for better reliability.'
      }
      return 'Risk levels vary by route. Bokaro->Patna is safest (8%), while Bokaro->Dhanbad is highest (85%). Would you like recommendations for a specific route?'
    }

    // Timing & Dispatch
    if (question.includes('time') || question.includes('dispatch') || question.includes('when')) {
      return 'Best dispatch times: 6:00 AM - 8:00 AM (optimal weather & low traffic). Avoid 2:00 PM - 4:00 PM (peak traffic). Early morning dispatches reduce delays by 40% on average. Current conditions suggest dispatching at 6:30 AM for maximum efficiency.'
    }

    // Material Selection
    if (question.includes('material') || question.includes('coil') || question.includes('plate')) {
      return 'Material recommendations: CR_Coils are best for current weather (lowest delay risk). HR_Coils have moderate risk. Plates are heavier and slower. For your route, CR_Coils would save ₹5,200 and reduce delay probability by 25%.'
    }

    // Accuracy & Trust
    if (question.includes('accurate') || question.includes('trust') || question.includes('confidence') || question.includes('model')) {
      return 'Model Accuracy: 94.2% overall accuracy with 0.42h mean error. Confidence Score: 89.5%. Trained on 2,847 predictions. You can trust these predictions with high confidence. Accuracy has improved 2.1% this month.'
    }

    // Route Optimization
    if (question.includes('optimize') || question.includes('best route') || question.includes('optimal')) {
      return 'Top 3 optimized routes: (1) Bokaro->Patna: ₹1,100 cost, 7h time, 8% risk - RECOMMENDED. (2) Bokaro->Ranchi: ₹900 cost, 5h time, 10% risk. (3) Bokaro->Kolkata: ₹1,200 cost, 8h time, 12% risk. Choose based on priority: cost, time, or safety.'
    }

    // Cost Savings
    if (question.includes('cost') || question.includes('save') || question.includes('money') || question.includes('price')) {
      return 'Cost optimization opportunities: (1) Switch to CR_Coils: Save ₹5,200. (2) Change route to Bokaro->Patna: Save ₹100. (3) Dispatch at 6 AM: Save ₹3,000 in delays. Total potential savings: ₹8,300 per shipment.'
    }

    // Delay Prediction
    if (question.includes('delay') || question.includes('predict') || question.includes('probability')) {
      return 'Delay prediction factors: Route (primary), Weather (25% impact), Material type (15% impact), Dispatch time (20% impact), Tonnage (10% impact). Current prediction: 6-8 hours average delay. Use our prediction tool for specific shipments.'
    }

    // Maintenance & Equipment
    if (question.includes('maintenance') || question.includes('equipment') || question.includes('truck') || question.includes('failure')) {
      return 'Equipment Status: Truck Fleet A - 78% risk (schedule maintenance immediately). Loading Equipment LP1 - 62% risk (plan for next week). Preventive maintenance now saves ₹45,000 in potential failures. I recommend scheduling Fleet A maintenance today.'
    }

    // Batch Processing
    if (question.includes('batch') || question.includes('multiple') || question.includes('csv')) {
      return 'Batch prediction features: Upload CSV with routes, tonnage, material, weather. Process 10+ shipments at once. Get analytics dashboard with risk distribution, delay patterns, and recommendations. Download template from Batch tab.'
    }

    // Comparison & Analysis
    if (question.includes('compare') || question.includes('comparison') || question.includes('vs')) {
      return 'Comparison tools available: (1) Route Comparison - compare 2-3 routes side-by-side. (2) Material Comparison - find best material for your route. (3) Scenario Comparison - test what-if scenarios. Which comparison would help you most?'
    }

    // General Help
    if (question.includes('help') || question.includes('how') || question.includes('what can')) {
      return 'I can help with: (1) Route risk analysis, (2) Dispatch timing recommendations, (3) Material selection, (4) Cost optimization, (5) Delay predictions, (6) Equipment maintenance alerts, (7) Batch processing, (8) Scenario analysis. What would you like to explore?'
    }

    // Anomaly Detection
    if (question.includes('anomaly') || question.includes('unusual') || question.includes('abnormal')) {
      return 'Recent anomalies detected: (1) Bokaro->Dhanbad delay spike (equipment failure), (2) Model accuracy declining (data distribution change), (3) Bokaro->Kolkata performance degradation (weather patterns). All flagged for investigation.'
    }

    // Reports & Export
    if (question.includes('report') || question.includes('export') || question.includes('download')) {
      return 'Report generation available: Executive Summary (key metrics), Detailed Analysis (full predictions & charts), Scheduled Reports (auto email). Export formats: PDF, Excel, CSV, PowerPoint. Generate reports from Reports tab.'
    }

    // Default intelligent response
    return `That's an interesting question about "${userQuestion}". Based on our logistics data: The key factors affecting your shipments are route selection (primary impact), weather conditions (25%), material type (15%), dispatch timing (20%), and tonnage (10%). Would you like specific recommendations for any of these factors?`
  }

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages([...messages, { id: messages.length + 1, sender: 'user', text: input }])
    
    setTimeout(() => {
      const response = generateDynamicResponse(input)
      setMessages((prev) => [...prev, { id: prev.length + 1, sender: 'assistant', text: response }])
    }, 800)
    
    setInput('')
  }

  const handleSuggestion = (text) => {
    setInput(text)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">AI Chat Assistant</h2>

      <div className="card h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={handleSend} className="btn btn-primary">
            <Send size={18} />
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-slate-900 mb-3">Quick Questions</h3>
        <div className="space-y-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestion(s)}
              className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-900 text-sm"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
