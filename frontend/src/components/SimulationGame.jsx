import React, { useState } from 'react'
import { Gamepad2, Play, RotateCcw, Trophy } from 'lucide-react'

export default function SimulationGame() {
  const [gameState, setGameState] = useState('menu') // menu, playing, results
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [decisions, setDecisions] = useState([])

  const scenarios = [
    {
      id: 1,
      title: 'Route Selection Challenge',
      desc: 'Choose the best route for 500 tonnes of HR_Coils',
      options: [
        { route: 'Bokaro->Dhanbad', score: 30, reason: 'High risk (85%)' },
        { route: 'Bokaro->Hatia', score: 75, reason: 'Medium risk (35%)' },
        { route: 'Bokaro->Kolkata', score: 85, reason: 'Low risk (12%)' },
      ],
    },
    {
      id: 2,
      title: 'Dispatch Timing Decision',
      desc: 'When should you dispatch the shipment?',
      options: [
        { time: '2:00 PM', score: 40, reason: 'Peak traffic hours' },
        { time: '6:00 AM', score: 90, reason: 'Optimal weather & traffic' },
        { time: '10:00 PM', score: 60, reason: 'Night driving risks' },
      ],
    },
    {
      id: 3,
      title: 'Material Selection',
      desc: 'Which material minimizes delay risk?',
      options: [
        { material: 'HR_Coils', score: 70, reason: 'Standard choice' },
        { material: 'CR_Coils', score: 85, reason: 'Better for weather' },
        { material: 'Plates', score: 50, reason: 'Heavier, slower' },
      ],
    },
  ]

  const handleStartGame = () => {
    setGameState('playing')
    setScore(0)
    setRound(1)
    setDecisions([])
  }

  const handleDecision = (option) => {
    const newScore = score + option.score
    setScore(newScore)
    setDecisions([...decisions, { round, option, score: option.score }])

    if (round < scenarios.length) {
      setRound(round + 1)
    } else {
      setGameState('results')
    }
  }

  const handlePlayAgain = () => {
    handleStartGame()
  }

  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Logistics Simulation Game</h2>
        <p className="text-slate-600">Learn optimal decision-making through gamification</p>

        <div className="card space-y-6">
          <div className="text-center">
            <Gamepad2 size={64} className="mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Make Smart Logistics Decisions</h3>
            <p className="text-slate-600 mb-6">Test your knowledge and compete for the highest score!</p>
          </div>

          <button onClick={handleStartGame} className="w-full btn btn-primary text-lg py-3">
            <Play size={20} className="inline mr-2" />
            Start Game
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">How to Play:</h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>Answer 3 logistics decision scenarios</li>
              <li>Choose the best option for each scenario</li>
              <li>Earn points based on decision quality</li>
              <li>Compare your score with others</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    const scenario = scenarios[round - 1]
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Logistics Simulation Game</h2>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-600">Round {round}/{scenarios.length}</span>
            <span className="text-sm font-bold text-blue-600">Score: {score}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(round / scenarios.length) * 100}%` }} />
          </div>
        </div>

        <div className="card space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{scenario.title}</h3>
            <p className="text-slate-600">{scenario.desc}</p>
          </div>

          <div className="space-y-3">
            {scenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleDecision(opt)}
                className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">{opt.route || opt.time || opt.material}</p>
                    <p className="text-sm text-slate-600">{opt.reason}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">+{opt.score} pts</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const maxScore = scenarios.reduce((sum, s) => sum + Math.max(...s.options.map((o) => o.score)), 0)
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Game Results</h2>

        <div className="card text-center space-y-4">
          <Trophy size={64} className="mx-auto text-yellow-500" />
          <h3 className="text-3xl font-bold text-slate-900">{score}/{maxScore}</h3>
          <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
          <p className="text-slate-600">
            {percentage >= 80 ? 'Excellent! You\'re a logistics expert!' : percentage >= 60 ? 'Good job! Keep learning!' : 'Keep practicing to improve!'}
          </p>
        </div>

        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Your Decisions</h3>
          <div className="space-y-2">
            {decisions.map((d, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-900">Round {d.round}: {d.option.route || d.option.time || d.option.material}</span>
                <span className="text-sm font-bold text-blue-600">+{d.score}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handlePlayAgain} className="w-full btn btn-primary">
          <RotateCcw size={18} className="inline mr-2" />
          Play Again
        </button>
      </div>
    )
  }
}
