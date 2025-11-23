import React, { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'

export default function AIChatAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'assistant', text: 'Hello! I\'m your AI logistics assistant. Ask me anything about delays, routes, or optimization.' },
  ])
  const [input, setInput] = useState('')

  const suggestions = [
    'Why is Bokaro->Dhanbad risky?',
    'What\'s the best time to dispatch?',
    'Which material should I use?',
    'How accurate are predictions?',
  ]

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages([...messages, { id: messages.length + 1, sender: 'user', text: input }])
    
    setTimeout(() => {
      const responses = [
        'That\'s a great question! Based on current data, I recommend...',
        'According to our analysis, the best approach would be...',
        'The data shows that this route has a 78% delay probability due to...',
        'I suggest optimizing by changing to this alternative...',
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      setMessages((prev) => [...prev, { id: prev.length + 1, sender: 'assistant', text: response }])
    }, 500)
    
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
