import React, { useState } from 'react'
import ParticleLife from './components/ParticleLife'
import './App.css'

export default function App() {
  const [particleTypes, setParticleTypes] = useState([
    { id: 'red', color: '#ff4488', count: 80 },
    { id: 'green', color: '#00ff88', count: 80 },
    { id: 'blue', color: '#7ee7ff', count: 80 }
  ])

  const [rules, setRules] = useState({
    red_red: 0.3,
    red_green: -0.5,
    red_blue: 0.2,
    green_green: 0.2,
    green_red: -0.5,
    green_blue: 0.3,
    blue_blue: 0.4,
    blue_red: 0.2,
    blue_green: 0.3
  })

  const [speed, setSpeed] = useState(1)
  const [viscosity, setViscosity] = useState(0.85)
  const [showRules, setShowRules] = useState(false)

  const updateRule = (key, value) => {
    setRules({ ...rules, [key]: value })
  }

  const randomizeRules = () => {
    const newRules = {}
    for (let key in rules) {
      newRules[key] = (Math.random() - 0.5) * 2
    }
    setRules(newRules)
  }

  return (
    <div className="app">
      <ParticleLife 
        particleTypes={particleTypes}
        rules={rules}
        speed={speed}
        viscosity={viscosity}
      />
      
      <div className="panel">
        <h1>Particle Life</h1>
        
        <div className="controls">
          <div className="control-group">
            <label>Speed</label>
            <input 
              type="range" 
              min="0.1" 
              max="2" 
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="value">{speed.toFixed(1)}x</span>
          </div>

          <div className="control-group">
            <label>Viscosity</label>
            <input 
              type="range" 
              min="0.7" 
              max="0.99" 
              step="0.01"
              value={viscosity}
              onChange={(e) => setViscosity(Number(e.target.value))}
            />
            <span className="value">{(1 - viscosity).toFixed(2)}</span>
          </div>

          <button 
            onClick={() => setShowRules(!showRules)}
            className={showRules ? 'active' : ''}
            style={{ width: '100%' }}
          >
            {showRules ? '✓ Rules' : 'Rules'}
          </button>
        </div>

        {showRules && (
          <div className="rules-panel">
            <div className="rule-section">
              <h3>Red ↔</h3>
              <div className="rule-item">
                <span>Red</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.red_red}
                  onChange={(e) => updateRule('red_red', Number(e.target.value))}
                />
                <span>{rules.red_red.toFixed(2)}</span>
              </div>
              <div className="rule-item">
                <span>Green</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.red_green}
                  onChange={(e) => updateRule('red_green', Number(e.target.value))}
                />
                <span>{rules.red_green.toFixed(2)}</span>
              </div>
              <div className="rule-item">
                <span>Blue</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.red_blue}
                  onChange={(e) => updateRule('red_blue', Number(e.target.value))}
                />
                <span>{rules.red_blue.toFixed(2)}</span>
              </div>
            </div>

            <div className="rule-section">
              <h3>Green ↔</h3>
              <div className="rule-item">
                <span>Red</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.green_red}
                  onChange={(e) => updateRule('green_red', Number(e.target.value))}
                />
                <span>{rules.green_red.toFixed(2)}</span>
              </div>
              <div className="rule-item">
                <span>Green</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.green_green}
                  onChange={(e) => updateRule('green_green', Number(e.target.value))}
                />
                <span>{rules.green_green.toFixed(2)}</span>
              </div>
              <div className="rule-item">
                <span>Blue</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.green_blue}
                  onChange={(e) => updateRule('green_blue', Number(e.target.value))}
                />
                <span>{rules.green_blue.toFixed(2)}</span>
              </div>
            </div>

            <div className="rule-section">
              <h3>Blue ↔</h3>
              <div className="rule-item">
                <span>Red</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.blue_red}
                  onChange={(e) => updateRule('blue_red', Number(e.target.value))}
                />
                <span>{rules.blue_red.toFixed(2)}</span>
              </div>
              <div className="rule-item">
                <span>Green</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.blue_green}
                  onChange={(e) => updateRule('blue_green', Number(e.target.value))}
                />
                <span>{rules.blue_green.toFixed(2)}</span>
              </div>
              <div className="rule-item">
                <span>Blue</span>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.05"
                  value={rules.blue_blue}
                  onChange={(e) => updateRule('blue_blue', Number(e.target.value))}
                />
                <span>{rules.blue_blue.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={randomizeRules} className="randomize">
              🎲 Randomize
            </button>
          </div>
        )}

        <div className="info">
          <p><strong>Emergent life simulator</strong></p>
          <p>Each color follows rules about attraction & repulsion</p>
          <p style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            Positive = attract, Negative = repel
          </p>
        </div>
      </div>
    </div>
  )
}
