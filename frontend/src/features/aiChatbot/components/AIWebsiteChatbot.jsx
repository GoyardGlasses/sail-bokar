import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Send,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Lightbulb,
  Zap,
  Brain,
  HelpCircle,
} from 'lucide-react'

interface Message {
  id: number
  sender: 'user' | 'assistant'
  text: string
  timestamp: Date
}

interface ConversationContext {
  lastRoute: string | null
  lastMaterial: string | null
  lastFeature: string | null
  questionsAsked: string[]
  conversationHistory: string[]
}

// Comprehensive website knowledge base
const WEBSITE_KNOWLEDGE = {
  features: {
    'dashboard': {
      description: 'Main dashboard showing all KPIs and real-time metrics',
      path: '/',
      keywords: ['dashboard', 'overview', 'home', 'main'],
    },
    'delay-prediction': {
      description: 'Predict transportation delays with ML models',
      path: '/delay',
      keywords: ['delay', 'prediction', 'forecast', 'risk'],
    },
    'demand-forecast': {
      description: 'AI-powered demand forecasting for materials',
      path: '/forecast',
      keywords: ['forecast', 'demand', 'prediction', 'trend'],
    },
    'throughput': {
      description: 'Monitor and optimize throughput metrics',
      path: '/throughput',
      keywords: ['throughput', 'capacity', 'output', 'performance'],
    },
    'cost-analysis': {
      description: 'Analyze and optimize costs across operations',
      path: '/cost',
      keywords: ['cost', 'analysis', 'expense', 'budget', 'savings'],
    },
    'rake-dispatch': {
      description: 'Optimize rake formation and dispatch planning',
      path: '/rake-dispatch',
      keywords: ['rake', 'dispatch', 'formation', 'planning'],
    },
    'decision-support': {
      description: 'AI-powered decision support with scenario analysis',
      path: '/decision-support',
      keywords: ['decision', 'support', 'recommendation', 'analysis'],
    },
    'inventory-management': {
      description: 'Track and manage inventory across stockyards',
      path: '/inventory-management',
      keywords: ['inventory', 'stock', 'warehouse', 'material'],
    },
    'order-management': {
      description: 'Manage customer orders and fulfillment',
      path: '/order-management',
      keywords: ['order', 'customer', 'fulfillment', 'shipment'],
    },
    'rake-formation': {
      description: 'Plan and optimize rake formation',
      path: '/rake-formation',
      keywords: ['rake', 'formation', 'planning', 'wagon'],
    },
    'product-wagon-matrix': {
      description: 'Optimize product-wagon combinations',
      path: '/product-wagon-matrix',
      keywords: ['product', 'wagon', 'matrix', 'combination'],
    },
    'rail-road-optimization': {
      description: 'Optimize rail vs road transport modes',
      path: '/rail-road-optimization',
      keywords: ['rail', 'road', 'transport', 'mode', 'optimization'],
    },
    'production-recommendation': {
      description: 'Get AI recommendations for production planning',
      path: '/production-recommendation',
      keywords: ['production', 'recommendation', 'planning', 'forecast'],
    },
    'constraints-management': {
      description: 'Manage operational constraints and limitations',
      path: '/constraints-management',
      keywords: ['constraint', 'limitation', 'restriction', 'rule'],
    },
    'scenario-analysis': {
      description: 'Analyze what-if scenarios and outcomes',
      path: '/scenario-analysis-advanced',
      keywords: ['scenario', 'what-if', 'analysis', 'simulation'],
    },
    'reporting': {
      description: 'Generate comprehensive reports and analytics',
      path: '/reporting',
      keywords: ['report', 'analytics', 'data', 'export'],
    },
    'monitoring': {
      description: 'Real-time monitoring and alerts',
      path: '/monitoring',
      keywords: ['monitor', 'alert', 'real-time', 'notification'],
    },
    'blockchain': {
      description: 'Blockchain-based supply chain transparency',
      path: '/blockchain',
      keywords: ['blockchain', 'transparency', 'ledger', 'verification'],
    },
    'ai-forecast': {
      description: 'Advanced AI forecasting models',
      path: '/ai-forecast',
      keywords: ['ai', 'forecast', 'ml', 'model'],
    },
    'advanced-optimization': {
      description: 'Advanced optimization algorithms',
      path: '/advanced-optimization',
      keywords: ['optimization', 'algorithm', 'advanced', 'ml'],
    },
    'visualization-3d': {
      description: '3D visualization of logistics network',
      path: '/visualization-3d',
      keywords: ['3d', 'visualization', 'network', 'map'],
    },
    'data-import': {
      description: 'Import and manage data sources',
      path: '/data-import',
      keywords: ['import', 'data', 'upload', 'csv'],
    },
    'material-availability': {
      description: 'Check material availability across stockyards',
      path: '/material-availability',
      keywords: ['material', 'availability', 'stock', 'quantity'],
    },
    'cmo-stockyards': {
      description: 'Manage CMO stockyards and inventory',
      path: '/cmo-stockyards',
      keywords: ['stockyard', 'cmo', 'warehouse', 'storage'],
    },
  },
  routes: {
    'bokaro-dhanbad': { risk: 85, cost: 800, time: 4, reason: 'heavy traffic, poor roads, weather' },
    'bokaro-hatia': { risk: 35, cost: 950, time: 6, reason: 'moderate traffic, decent roads' },
    'bokaro-kolkata': { risk: 12, cost: 1200, time: 8, reason: 'well-maintained route' },
    'bokaro-patna': { risk: 8, cost: 1100, time: 7, reason: 'safest route, optimal conditions' },
    'bokaro-ranchi': { risk: 10, cost: 900, time: 5, reason: 'good balance of cost and safety' },
    'bokaro-durgapur': { risk: 15, cost: 850, time: 5.5, reason: 'stable conditions' },
    'bokaro-haldia': { risk: 25, cost: 1350, time: 9, reason: 'port route, longer distance' },
  },
  materials: {
    'cr_coils': { risk: 15, cost: 5200, benefit: 'best for weather, lowest delay risk' },
    'hr_coils': { risk: 22, cost: 3500, benefit: 'moderate risk, standard choice' },
    'plates': { risk: 28, cost: 4200, benefit: 'heavier, slower, higher risk' },
    'wire_rods': { risk: 18, cost: 2800, benefit: 'lightweight, good for speed' },
    'tmt_bars': { risk: 20, cost: 3100, benefit: 'balanced option' },
    'pig_iron': { risk: 32, cost: 2500, benefit: 'heavy, requires special handling' },
    'billets': { risk: 19, cost: 3400, benefit: 'standard industrial material' },
  },
  systemCapabilities: {
    'ml-models': 'Advanced ML models for delay prediction, demand forecasting, and anomaly detection',
    'real-time-tracking': 'Real-time tracking of rakes, shipments, and fleet',
    'optimization': 'AI-powered optimization for routes, costs, and resources',
    'analytics': 'Comprehensive analytics and reporting dashboards',
    'automation': 'Automated decision-making and recommendations',
    'integration': 'Integration with ERP, CRM, and external systems',
  },
}

export default function AIWebsiteChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'assistant',
      text: "👋 Hello! I'm your AI Website Assistant. I know everything about this logistics platform - all features, routes, materials, and optimization strategies. Ask me about any feature, get recommendations, or let me guide you through the system. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState<ConversationContext>({
    lastRoute: null,
    lastMaterial: null,
    lastFeature: null,
    questionsAsked: [],
    conversationHistory: [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Extract entities from user input
  const extractEntities = useCallback((text: string) => {
    const lower = text.toLowerCase()
    const entities = { features: [], routes: [], materials: [], topics: [] }

    // Extract features
    Object.entries(WEBSITE_KNOWLEDGE.features).forEach(([feature, data]) => {
      if (data.keywords.some(kw => lower.includes(kw))) {
        entities.features.push(feature)
      }
    })

    // Extract routes
    Object.keys(WEBSITE_KNOWLEDGE.routes).forEach(route => {
      if (lower.includes(route.replace('-', ' ')) || lower.includes(route)) {
        entities.routes.push(route)
      }
    })

    // Extract materials
    Object.keys(WEBSITE_KNOWLEDGE.materials).forEach(material => {
      if (lower.includes(material.replace('_', ' ')) || lower.includes(material)) {
        entities.materials.push(material)
      }
    })

    // Extract topics
    const topicKeywords = {
      risk: ['risky', 'risk', 'danger', 'safe', 'safety'],
      timing: ['time', 'dispatch', 'when', 'schedule', 'best time'],
      cost: ['cost', 'save', 'money', 'price', 'cheap', 'expensive'],
      accuracy: ['accurate', 'trust', 'confidence', 'reliable'],
      optimization: ['optimize', 'best', 'optimal', 'improve'],
      comparison: ['compare', 'vs', 'versus', 'better', 'difference'],
      help: ['help', 'how', 'guide', 'tutorial', 'explain'],
      features: ['feature', 'what', 'available', 'capability'],
    }

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        entities.topics.push(topic)
      }
    })

    return entities
  }, [])

  // Generate dynamic response based on website knowledge
  const generateResponse = useCallback((userQuestion: string) => {
    const lower = userQuestion.toLowerCase()
    const entities = extractEntities(userQuestion)

    // Update context
    if (entities.routes.length > 0) {
      setContext(prev => ({
        ...prev,
        lastRoute: entities.routes[0],
        questionsAsked: [...prev.questionsAsked, userQuestion],
      }))
    }
    if (entities.materials.length > 0) {
      setContext(prev => ({
        ...prev,
        lastMaterial: entities.materials[0],
      }))
    }
    if (entities.features.length > 0) {
      setContext(prev => ({
        ...prev,
        lastFeature: entities.features[0],
      }))
    }

    // Feature navigation
    if (entities.features.length > 0 && entities.topics.includes('help')) {
      const feature = entities.features[0]
      const featureData = WEBSITE_KNOWLEDGE.features[feature]
      return `📍 **${feature.toUpperCase()}**\n\n${featureData.description}\n\nYou can access it at: \`${featureData.path}\`\n\nWould you like to know more about this feature or explore related features?`
    }

    // Route risk analysis
    if (entities.topics.includes('risk') && entities.routes.length > 0) {
      const route = entities.routes[0]
      const data = WEBSITE_KNOWLEDGE.routes[route]
      return `🛣️ **${route.toUpperCase()} Analysis**\n\n**Risk Level:** ${data.risk}%\n**Cost:** ₹${data.cost}\n**Time:** ${data.time}h\n**Reason:** ${data.reason}\n\n${data.risk > 50 ? '⚠️ HIGH RISK - Consider alternatives like Bokaro-Patna (8% risk)' : '✅ SAFE ROUTE - Good choice for this shipment'}`
    }

    // Material recommendation
    if (entities.topics.includes('cost') && entities.materials.length > 0) {
      const material = entities.materials[0]
      const data = WEBSITE_KNOWLEDGE.materials[material]
      return `📦 **${material.toUpperCase()} Analysis**\n\n**Risk:** ${data.risk}%\n**Cost:** ₹${data.cost}\n**Benefit:** ${data.benefit}\n\n${context.lastRoute ? `For ${context.lastRoute}, this material would be ${data.risk < 20 ? '✅ EXCELLENT' : '⚠️ MODERATE'} choice.` : 'Let me know your route for personalized recommendation.'}`
    }

    // Timing recommendation
    if (entities.topics.includes('timing')) {
      const timeContext = context.lastRoute ? `For ${context.lastRoute}, ` : ''
      return `⏰ **Dispatch Timing Recommendation**\n\n${timeContext}**Best Times:**\n- 6:00 AM - 8:00 AM (optimal weather & low traffic)\n- Reduces delays by 40% on average\n\n**Avoid:**\n- 2:00 PM - 4:00 PM (peak traffic)\n- 11:00 PM - 5:00 AM (poor visibility)\n\n${context.questionsAsked.length > 2 ? '💡 Based on our conversation, I recommend 6:30 AM for maximum efficiency.' : ''}`
    }

    // Optimization recommendation
    if (entities.topics.includes('optimization')) {
      const lastRoute = context.lastRoute
      const recommendation = lastRoute 
        ? `Since you asked about ${lastRoute}, consider:\n- **Bokaro→Patna** (8% risk, ₹1,100) - Safest\n- **Bokaro→Ranchi** (10% risk, ₹900) - Most cost-effective`
        : '**Top Routes by Safety:**\n1. Bokaro→Patna (8% risk)\n2. Bokaro→Ranchi (10% risk)\n3. Bokaro→Kolkata (12% risk)'
      return `🚀 **Route Optimization**\n\n${recommendation}\n\nChoose based on priority: cost, time, or safety.`
    }

    // Feature overview
    if (entities.topics.includes('features')) {
      return `🎯 **Available Features:**\n\n**Core Analytics:**\n- Delay Prediction\n- Demand Forecasting\n- Cost Analysis\n- Throughput Optimization\n\n**Planning & Optimization:**\n- Rake Dispatch\n- Decision Support\n- Scenario Analysis\n- Production Recommendation\n\n**Management:**\n- Inventory Management\n- Order Management\n- Constraints Management\n- Monitoring & Alerts\n\n**Advanced:**\n- AI Forecasting\n- Blockchain Transparency\n- 3D Visualization\n- Advanced Optimization\n\nWhich feature would you like to explore?`
    }

    // Comparison
    if (entities.topics.includes('comparison')) {
      if (entities.routes.length >= 2) {
        const route1 = WEBSITE_KNOWLEDGE.routes[entities.routes[0]]
        const route2 = WEBSITE_KNOWLEDGE.routes[entities.routes[1]]
        return `⚖️ **Route Comparison**\n\n**${entities.routes[0].toUpperCase()}**\n- Risk: ${route1.risk}%\n- Cost: ₹${route1.cost}\n- Time: ${route1.time}h\n\n**${entities.routes[1].toUpperCase()}**\n- Risk: ${route2.risk}%\n- Cost: ₹${route2.cost}\n- Time: ${route2.time}h\n\n${route1.risk < route2.risk ? `✅ ${entities.routes[0]} is safer` : `✅ ${entities.routes[1]} is safer`}`
      }
      if (entities.materials.length >= 2) {
        const mat1 = WEBSITE_KNOWLEDGE.materials[entities.materials[0]]
        const mat2 = WEBSITE_KNOWLEDGE.materials[entities.materials[1]]
        return `⚖️ **Material Comparison**\n\n**${entities.materials[0].toUpperCase()}**\n- Risk: ${mat1.risk}%\n- Cost: ₹${mat1.cost}\n\n**${entities.materials[1].toUpperCase()}**\n- Risk: ${mat2.risk}%\n- Cost: ₹${mat2.cost}\n\n${mat1.cost < mat2.cost ? `💰 ${entities.materials[0]} is cheaper` : `💰 ${entities.materials[1]} is cheaper`}`
      }
      return '📊 **Comparison Tools Available:**\n- Route Comparison\n- Material Comparison\n- Scenario Analysis\n\nTell me what you want to compare!'
    }

    // Help and guidance
    if (entities.topics.includes('help')) {
      return `🆘 **How Can I Help?**\n\nI can assist you with:\n\n1. **Feature Navigation** - Guide you to any feature\n2. **Route Analysis** - Analyze risk, cost, and timing\n3. **Material Recommendations** - Find best materials\n4. **Optimization** - Suggest optimal strategies\n5. **Comparisons** - Compare routes or materials\n6. **System Overview** - Explain capabilities\n\nJust ask me about:\n- Any route (e.g., "Bokaro to Patna")\n- Any material (e.g., "CR Coils")\n- Any feature (e.g., "Delay Prediction")\n- Any topic (e.g., "cost optimization")`
    }

    // Intelligent fallback with learning
    if (context.questionsAsked.length > 0) {
      return `💭 **Interesting Question!**\n\nBased on our conversation (${context.questionsAsked.length} questions), I understand you're interested in ${context.lastFeature || context.lastRoute || 'logistics optimization'}.\n\n**Key Factors Affecting Your Shipments:**\n- Route selection (primary impact)\n- Weather conditions (25%)\n- Material type (15%)\n- Dispatch timing (20%)\n- Tonnage (10%)\n\nWhat specific aspect would you like to explore further?`
    }

    // Default response
    return `🤔 **That's a Great Question!**\n\nI'm analyzing the logistics data...\n\n**Key Factors in Our System:**\n- **Routes:** 7 major routes with varying risk levels\n- **Materials:** 7 material types with different characteristics\n- **Features:** 20+ advanced features for optimization\n- **ML Models:** Delay prediction, demand forecasting, anomaly detection\n\nTry asking me about:\n- Specific routes (e.g., "Is Bokaro-Patna safe?")\n- Materials (e.g., "Best material for cost?")\n- Features (e.g., "How to use Decision Support?")\n- Optimization (e.g., "How to reduce costs?")`
  }, [context, extractEntities])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = {
        id: messages.length + 2,
        sender: 'assistant',
        text: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 600)

    setInput('')
  }

  const handleSuggestion = (text: string) => {
    setInput(text)
  }

  const handleClear = () => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        text: "👋 Hello! I'm your AI Website Assistant. I know everything about this logistics platform. What would you like to know?",
        timestamp: new Date(),
      },
    ])
    setContext({
      lastRoute: null,
      lastMaterial: null,
      lastFeature: null,
      questionsAsked: [],
      conversationHistory: [],
    })
  }

  const suggestions = [
    'Tell me about all features',
    'Is Bokaro-Patna a safe route?',
    'Which material is cheapest?',
    'How to optimize costs?',
    'What is Decision Support?',
    'Compare Bokaro-Dhanbad vs Bokaro-Patna',
  ]

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI Website Assistant</h1>
        </div>
        <p className="text-purple-100">Intelligent guide for your logistics platform - knows all features, routes, and optimization strategies</p>
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
                placeholder="Ask me anything about the platform..."
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

        {/* Sidebar - Suggestions & Info */}
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
              <h3 className="font-bold text-slate-900">System Capabilities</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">20+ Features & Tools</span>
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
                <span className="text-slate-700">ML-Powered Analytics</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-slate-700">Real-time Optimization</span>
              </div>
            </div>
          </div>

          {/* Context Info */}
          {(context.lastRoute || context.lastMaterial || context.lastFeature) && (
            <div className="bg-blue-50 rounded-lg shadow-lg p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">Conversation Context</h3>
              </div>
              <div className="space-y-2 text-sm text-blue-900">
                {context.lastRoute && <p>📍 Route: <span className="font-semibold">{context.lastRoute}</span></p>}
                {context.lastMaterial && <p>📦 Material: <span className="font-semibold">{context.lastMaterial}</span></p>}
                {context.lastFeature && <p>🎯 Feature: <span className="font-semibold">{context.lastFeature}</span></p>}
                {context.questionsAsked.length > 0 && (
                  <p>💬 Questions: <span className="font-semibold">{context.questionsAsked.length}</span></p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
