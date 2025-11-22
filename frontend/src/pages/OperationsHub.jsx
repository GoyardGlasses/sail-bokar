import React, { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import { MapPin, MessageCircle, Download } from 'lucide-react'
import ModernLayout from '../components/ModernLayout'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'

const OperationsHub = () => {
  const [selectedRake, setSelectedRake] = useState('SAIL-R001')
  const [chatMessages, setChatMessages] = useState([
    { type: 'assistant', text: 'Welcome to the SAIL Decision Assistant! What would you like to explore?' },
  ])
  const [inputMessage, setInputMessage] = useState('')

  const rakeUtilizationData = [
    { utilization: 65, cost: 320, name: 'R001' },
    { utilization: 72, cost: 350, name: 'R002' },
    { utilization: 68, cost: 330, name: 'R003' },
    { utilization: 75, cost: 360, name: 'R004' },
    { utilization: 78, cost: 380, name: 'R005' },
    { utilization: 82, cost: 400, name: 'R006' },
    { utilization: 85, cost: 420, name: 'R007' },
    { utilization: 88, cost: 450, name: 'R008' },
  ]

  const emptyRakeData = [
    { day: 'Day 1', turnaround: 45, weather: -5000, dynamic: -1971 },
    { day: 'Day 2', turnaround: 38, weather: -3000, dynamic: -1500 },
    { day: 'Day 3', turnaround: 52, weather: -4500, dynamic: -2100 },
    { day: 'Day 4', turnaround: 41, weather: -2800, dynamic: -1200 },
    { day: 'Day 5', turnaround: 48, weather: -3500, dynamic: -1800 },
    { day: 'Day 6', turnaround: 55, weather: -5200, dynamic: -2400 },
    { day: 'Day 7', turnaround: 42, weather: -3200, dynamic: -1400 },
  ]

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        { type: 'user', text: inputMessage },
        {
          type: 'assistant',
          text: 'Based on current network conditions, Stockyard B (Nagpur) is the optimal choice to fulfill order 2356. On-Time Delivery: 98%, Rake Availability: 3 empty rakes available.',
        },
      ])
      setInputMessage('')
    }
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Operations Hub — Yard Map & Decision Assistant</h1>
          <p className="text-slate-400">
            Interactive operations map combined with an AI Decision Assistant to explore rake availability, loading points and dispatch recommendations.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Map and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden h-96">
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-cyan-400 mx-auto mb-3" />
                  <p className="text-slate-400">Interactive Yard Map</p>
                  <p className="text-sm text-slate-500 mt-1">Showing 12 loading points across SAIL network</p>
                </div>
              </div>
            </div>

            {/* Rake Utilization Chart */}
            <ChartCard
              title="Rake Utilization Over Time"
              subtitle="Percent of wagons utilized vs available (daily)"
            >
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="utilization"
                    name="Utilization %"
                    stroke="#94a3b8"
                    label={{ value: 'Utilization %', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis
                    dataKey="cost"
                    name="Cost (₹/T)"
                    stroke="#94a3b8"
                    label={{ value: 'Cost (₹/T)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter
                    name="Rakes"
                    data={rakeUtilizationData}
                    fill="#06b6d4"
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Empty Rake Turnaround */}
            <ChartCard
              title="Empty Rake Turnaround"
              subtitle="Time from empty arrival to next dispatch"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emptyRakeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="turnaround" fill="#06b6d4" name="Turnaround (hrs)" />
                  <Bar dataKey="weather" fill="#ef4444" name="Weather Impact" />
                  <Bar dataKey="dynamic" fill="#f59e0b" name="Dynamic Routing" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Right: Decision Assistant */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col h-fit sticky top-24">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">SAIL Decision Assistant</h3>
              <p className="text-xs text-slate-400 mt-1">Ask about rake availability, loading points, and dispatch recommendations</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4 space-y-3">
              <div className="space-y-2 text-xs text-slate-400">
                <p className="font-medium">Quick Questions:</p>
                <button className="block text-left hover:text-cyan-400 transition-colors">
                  Which stockyard should fulfill order 2356?
                </button>
                <button className="block text-left hover:text-cyan-400 transition-colors">
                  What are the top 3 optimization opportunities?
                </button>
                <button className="block text-left hover:text-cyan-400 transition-colors">
                  Tell me about the Jamshedpur utilization issue.
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 bg-slate-700 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recommendation for Order 2356</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Estimated Cost</p>
              <p className="text-2xl font-bold text-cyan-400">₹45,000</p>
              <p className="text-xs text-slate-500 mt-1">Lower than other options due to freight distance</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">On-Time Delivery</p>
              <p className="text-2xl font-bold text-green-400">98%</p>
              <p className="text-xs text-slate-500 mt-1">Would likely proceed? Compared to 85% from Stockyard A</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Rake Availability</p>
              <p className="text-2xl font-bold text-cyan-400">3 empty rakes</p>
              <p className="text-xs text-slate-500 mt-1">Currently available at Nagpur yard</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Based on current network conditions</p>
              <p className="text-sm font-medium text-cyan-400">Stockyard B (Nagpur) is the optimal choice</p>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  )
}

export default OperationsHub
