import React, { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, Brain, Lightbulb, Zap, HelpCircle } from 'lucide-react'

export default function AIWebsiteChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "👋 Hello! I'm your AI Website Assistant. I know everything about this logistics platform. Ask me about features, routes, materials, or optimization!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userQuestion) => {
    const lower = userQuestion.toLowerCase()

    // Feature responses
    if (lower.includes('feature') || lower.includes('what can')) {
      return '🎯 **Available Features:**\n\n- Delay Prediction\n- Demand Forecasting\n- Cost Analysis\n- Rake Dispatch\n- Decision Support\n- Scenario Analysis\n- Inventory Management\n- Order Management\n- And 12+ more!\n\nWhich feature interests you?'
    }

    // Route responses
    if (lower.includes('bokaro') || lower.includes('route')) {
      return '🛣️ **Popular Routes:**\n\n1. Bokaro→Patna (8% risk) - SAFEST\n2. Bokaro→Ranchi (10% risk) - CHEAPEST ₹900\n3. Bokaro→Kolkata (12% risk)\n4. Bokaro→Dhanbad (85% risk) - HIGH RISK\n\nWhich route would you like to know more about?'
    }

    // Material responses
    if (lower.includes('material') || lower.includes('coil') || lower.includes('plate')) {
      return '📦 **Materials:**\n\n- CR Coils (15% risk, ₹5200) - Best for weather\n- HR Coils (22% risk, ₹3500) - Standard\n- Plates (28% risk, ₹4200) - Heavy\n- Wire Rods (18% risk, ₹2800) - Fast\n- TMT Bars (20% risk, ₹3100) - Balanced\n\nWhich material interests you?'
    }

    // Cost optimization
    if (lower.includes('cost') || lower.includes('save') || lower.includes('cheap')) {
      return '💰 **Cost Optimization Tips:**\n\n1. Use Bokaro→Ranchi route (₹900 - cheapest)\n2. Choose Wire Rods (₹2800 - cheapest material)\n3. Dispatch at 6:00 AM (optimal timing)\n4. Combine orders for better rates\n\nEstimated savings: 30-40% on logistics costs!'
    }

    // Risk analysis
    if (lower.includes('risk') || lower.includes('safe')) {
      return '⚠️ **Risk Analysis:**\n\nSafest Route: Bokaro→Patna (8% risk)\nSafest Material: CR Coils (15% risk)\n\nHigh Risk Combinations:\n- Bokaro→Dhanbad + Plates = 85% + 28% = AVOID\n\nRecommended:\n- Bokaro→Patna + CR Coils = 8% + 15% = SAFE ✅'
    }

    // Help
    if (lower.includes('help') || lower.includes('how')) {
      return '🆘 **How Can I Help?**\n\nAsk me about:\n- Features (e.g., "Tell me about features")\n- Routes (e.g., "Is Bokaro-Patna safe?")\n- Materials (e.g., "Which material is cheapest?")\n- Optimization (e.g., "How to reduce costs?")\n- Comparisons (e.g., "Compare routes")\n\nI know everything about your logistics platform!'
    }

    // Default response
    return '🤔 **Great Question!**\n\nI can help you with:\n- 20+ Platform Features\n- 7 Major Routes\n- 7 Material Types\n- Cost & Risk Analysis\n- Route Optimization\n- Material Recommendations\n\nWhat would you like to know?'
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage = {
        id: messages.length + 2,
        sender: 'assistant',
        text: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 500)

    setInput('')
  }

  const handleSuggestion = (text) => {
    setInput(text)
  }

  const handleClear = () => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        text: "👋 Hello! I'm your AI Website Assistant. Ask me anything!",
        timestamp: new Date(),
      },
    ])
  }

  const suggestions = [
    'Tell me about features',
    'Is Bokaro-Patna safe?',
    'Which material is cheapest?',
    'How to reduce costs?',
    'Compare routes',
    'Help me navigate',
  ]

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI Website Assistant</h1>
        </div>
        <p className="text-purple-100">Your intelligent guide to the logistics platform</p>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send size={18} />
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                title="Clear chat"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          {/* Quick Suggestions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-slate-900">Quick Questions</h3>
            </div>
            <div className="space-y-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-900 text-sm transition-colors border border-slate-200 hover:border-blue-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-slate-900">System Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">20+ Features</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">7 Major Routes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">7 Material Types</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">ML Analytics</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">Real-time Optimization</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg shadow-lg p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">About Me</h3>
            </div>
            <p className="text-sm text-blue-900">
              I'm your AI assistant. I know all features, routes, materials, and can help optimize your logistics operations!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
