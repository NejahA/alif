import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Sword, Activity, Terminal, Crosshair, Package, AlertCircle } from 'lucide-react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:3006/api'

function App() {
  const [gladiators, setGladiators] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [combatLog, setCombatLog] = useState([])
  const [isFighting, setIsCombat] = useState(false)

  useEffect(() => {
    fetchGladiators()
  }, [])

  const fetchGladiators = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gladiators`)
      setGladiators(res.data)
      if (!selected && res.data.length > 0) setSelected(res.data[0])
    } catch (err) {
      console.error('Link Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCombat = async () => {
    if (gladiators.length < 2) return
    setIsCombat(true)
    const opponent = gladiators.find(g => g._id !== selected._id)
    try {
      const res = await axios.post(`${API_BASE}/combat/simulate`, {
        fighter1Id: selected._id,
        fighter2Id: opponent._id
      })
      setCombatLog(res.data.combatLog)
      fetchGladiators() // Refresh stats
    } catch (err) {
      setCombatLog(['COMBAT_ERROR: Neural link severed.'])
    } finally {
      setTimeout(() => setIsCombat(false), 3000)
    }
  }

  const updateAura = async (newAura) => {
    try {
      const res = await axios.put(`${API_BASE}/gladiators/${selected._id}`, { ...selected, aura: newAura })
      setSelected(res.data)
      fetchGladiators()
    } catch (err) {
      console.error('Update Failed')
    }
  }

  if (loading) return <div className="loading">SYNCING_NEURAL_NETWORK...</div>

  return (
    <div className={`arena-container aura-${selected?.aura.toLowerCase()}`}>
      <header>
        <div className="glitch-title" data-text="CYBER_GLADIATOR">CYBER_GLADIATOR</div>
        <div className="status-bar">
          <Activity size={16} /> ARENA_STATUS: ACTIVE | CONNECTED_PILOTS: {gladiators.length}
        </div>
      </header>

      <main>
        <aside className="sidebar">
          <div className="sidebar-header">
            <Terminal size={18} /> ACTIVE_ROSTER
          </div>
          <div className="roster-list">
            {gladiators.map(g => (
              <motion.div 
                key={g._id}
                whileHover={{ x: 5 }}
                className={`roster-card ${selected?._id === g._id ? 'active' : ''}`}
                onClick={() => setSelected(g)}
              >
                <div className="roster-info">
                  <span className="handle">@{g.handle}</span>
                  <span className="level">LVL_{g.level}</span>
                </div>
                <div className="mini-hp-bar">
                  <div className="fill" style={{ width: `${(g.hp/g.maxHp)*100}%` }}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        <section className="combat-center">
          {selected && (
            <div className="specimen-view">
              <div className="visual-block">
                <motion.div 
                  animate={isFighting ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  className={`avatar aura-effect-${selected.aura.toLowerCase()}`}
                >
                  <div className="core"></div>
                  {isFighting && <div className="combat-fx"></div>}
                </motion.div>
                
                <div className="stats-overlay">
                  <div className="stat-pill"><Zap size={14}/> {selected.aura}</div>
                  <div className="stat-pill"><Shield size={14}/> HP: {selected.hp}/{selected.maxHp}</div>
                </div>
              </div>

              <div className="control-panel">
                <div className="bio">
                  <h2>{selected.name} <span className="id">#{selected._id.slice(-4)}</span></h2>
                  <p>Neural Aura: <strong>{selected.aura}</strong></p>
                </div>

                <div className="action-grid">
                  <button className="btn combat-btn" onClick={handleCombat} disabled={isFighting}>
                    <Sword size={18} /> INITIATE_COMBAT
                  </button>
                  <button className="btn gear-btn">
                    <Package size={18} /> THE_BLACK_MARKET
                  </button>
                </div>

                <div className="aura-selector">
                  <label>MANIFEST_AURA:</label>
                  <div className="aura-btns">
                    {['Neon', 'Void', 'Plasma', 'Ghost'].map(a => (
                      <button 
                        key={a} 
                        className={`aura-btn ${selected.aura === a ? 'active' : ''}`}
                        onClick={() => updateAura(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="combat-logs">
            <div className="log-header"><Crosshair size={16} /> NEURAL_FEED</div>
            <div className="log-content">
              {combatLog.length > 0 ? combatLog.map((log, i) => (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} key={i}>
                  {`> `}{log}
                </motion.p>
              )) : (
                <p className="idle">READY_FOR_ENGAGEMENT...</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selected?.hp < (selected?.maxHp * 0.3) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glitch-overlay"
          >
            <AlertCircle size={48} color="#ff0055" />
            <span>CRITICAL_HP_DETECTION: GLITCH_MODE_ENGAGED</span>
          </motion.div>
        )}
      </AnimatePresence>

      <footer>
        PILOT_LINK: SECURE | DATA_ENCRYPTION: AES-256 | &copy; 2026 NEON_ARENA_OS
      </footer>
    </div>
  )
}

export default App
