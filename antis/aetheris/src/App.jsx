import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Moon, Sun, Wind, Play, Pause, Plus, CheckCircle2, 
  Clock, Command, Terminal, GitBranch, Cpu, Activity, 
  Search, X, Hash, Zap, Code2, Coffee, ChevronRight, Layers, Layout,
  Shield, Network, HardDrive, BarChart3, Binary, Volume2, VolumeX,
  Maximize2, Minimize2, Grid3X3, Database, Ghost, Scan, FileCode2,
  PieChart, ActivityIcon, HelpCircle, TerminalSquare, Box, Lock, Unlock,
  GitPullRequest, Settings, Share2, Eye, EyeOff
} from 'lucide-react'
import { useLocalStorage, useHackerKeys } from './hooks'
import './App.css'

const NEURAL_FILES = [
  { id: 'usr_config.sys', content: '0xACEBADA... [DECRYPTED]' },
  { id: 'resonance.dll', content: 'SCANNING... RESONANCE_SET: 12.8Mhz' },
  { id: 'auth_key.bin', content: '01001000 01101001 01110110 01100101' }
]

const DEFAULT_STREAMS = {
  Mainframe: [
    { id: 1, text: 'Enable OmniBox', completed: true },
    { id: 2, text: 'Calibrate v7 Resonance', completed: false },
    { id: 3, text: 'Deploy Singularity Apex', completed: false },
  ],
  Research: [
    { id: 4, text: 'Analyze Neural Patterns', completed: false },
    { id: 5, text: 'Decrypt Ghost Protocol', completed: false },
  ]
}

function App() {
  const [streams, setStreams] = useLocalStorage('aetheris-streams', DEFAULT_STREAMS)
  const [currentStream, setCurrentStream] = useState('Mainframe')
  const [vaultNodes, setVaultNodes] = useLocalStorage('aetheris-vault-v7', [
    { id: 101, title: 'SYSTEM_MANIFEST', content: 'v7.0 [Singularity Apex] operational.' },
    { id: 102, title: 'ENCRYPTION_LINK', content: '0x7E2B... [DECRYPTED]' }
  ])
  
  const [hue, setHue] = useLocalStorage('aetheris-hue', 184)
  const [theme, setTheme] = useLocalStorage('aetheris-theme', 'obsidian')
  const [logs, setLogs] = useLocalStorage('aetheris-logs-v7', ['[v7.0] Singularity Apex initialized.', '[Atmosphere] Neural Particles active.'])
  const [terminalInput, setTerminalInput] = useState('')
  const [cmdQuery, setCmdQuery] = useState('')
  const [showOmni, setShowOmni] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [audio, setAudio] = useState({ active: false, volume: 50, ambience: false })
  const [pomodoro, setPomodoro] = useState({ time: 1500, active: false })
  const [uptime, setUptime] = useState(0)
  const [telemetry, setTelemetry] = useState({ cpu: 12, ram: 44, net: 28 })
  
  const logEndRef = useRef(null)
  
  // 1. Atmosphere Particles Logic
  const particles = useMemo(() => Array.from({length: 40}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 20
  })), []);

  // 2. Timer Loop
  useEffect(() => {
    let interval = null;
    if (pomodoro.active && pomodoro.time > 0) {
      interval = setInterval(() => setPomodoro(p => ({ ...p, time: p.time - 1 })), 1000);
    } else if (pomodoro.time === 0) {
      addLog('[ALERT] Focus linked finalized.');
      setPomodoro(p => ({ ...p, active: false }));
    }
    return () => clearInterval(interval);
  }, [pomodoro.active, pomodoro.time]);

  // 3. Telemetry Logic
  useEffect(() => {
    const teleTimer = setInterval(() => {
      setTelemetry({
        cpu: Math.floor(Math.random() * 15),
        ram: 40 + Math.floor(Math.random() * 8),
        net: 2 + Math.floor(Math.random() * 20)
      })
    }, 4000)
    return () => clearInterval(teleTimer);
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const addLog = (msg) => {
    const ts = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLogs(prev => [...prev.slice(-30), `[${ts}] ${msg}`])
  }

  const handleCommand = (cmd) => {
    const q = cmd.trim().toLowerCase()
    addLog(`> ${cmd.trim()}`)
    
    if (q.startsWith('stream ')) {
       const sName = cmd.slice(7).trim()
       if (streams[sName]) { setCurrentStream(sName); addLog(`Stream Switched: ${sName}`); }
       else addLog(`ERR: STREAM_NOT_FOUND: ${sName}`)
    } else if (q.startsWith('hue ')) {
       const h = parseInt(q.split(' ')[1]); if (!isNaN(h)) setHue(h);
    } else if (q === 'stats') setShowStats(!showStats)
    else if (q === 'scan') triggerScan()
    else if (q === 'ls') NEURAL_FILES.forEach(f => addLog(`   - ${f.id}`))
    else if (q === 'help') {
       addLog('APEX_PROTOCOLS: stream [name], hue [0-360], stats, scan, glitch, ls, add [task]')
    } else if (q.startsWith('add ')) {
       const text = cmd.slice(4)
       const newTasks = [...streams[currentStream], { id: Date.now(), text, completed: false }]
       setStreams({ ...streams, [currentStream]: newTasks })
       addLog(`Node Acquired: ${text}`)
    }
  }

  const toggleTask = (id) => {
    const newTasks = streams[currentStream].map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setStreams({ ...streams, [currentStream]: newTasks })
    addLog(`Resonance Sync: ${id}`)
  }

  const triggerScan = () => { setIsScanning(true); addLog('Initiating Deep Scan...'); setTimeout(() => setIsScanning(false), 2000); }
  const triggerGlitch = () => { setIsGlitching(true); addLog('SINGULARITY_DISTURBANCE'); setTimeout(() => setIsGlitching(false), 300); }

  useHackerKeys({
    '/': (e) => { e.preventDefault(); setShowOmni(true); },
    'escape': () => { setShowOmni(false); setShowStats(false); },
    'm': () => setAudio(a => ({ ...a, active: !a.active })),
    's': () => triggerScan(),
    'g': () => triggerGlitch(),
    'space': (e) => { if (document.activeElement.tagName === 'BODY') { e.preventDefault(); setPomodoro(p => ({ ...p, active: !p.active })); } }
  })

  const strokeDashoffset = ( (pomodoro.time / 1500) * 100.53 ) - 100.53;

  return (
    <div className={`app-container theme-${theme} ${isScanning ? 'is-scanning' : ''} ${isGlitching ? 'is-glitching' : ''} ${pomodoro.active ? 'focus-jitter' : ''}`} style={{ '--primary-hue': hue }}>
      {/* Neural Atmosphere Particles */}
      <div className="neural-atmosphere">
         {particles.map(p => (
           <motion.div key={p.id} className="particle" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }} animate={{ y: [0, -100, 0], opacity: [0, 0.4, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'linear' }} />
         ))}
      </div>

      <div className="ambient-glow" />
      <div className="scanline-overlay" />
      
      {/* Stats Overlay with SVG Graph */}
      <AnimatePresence>
        {showStats && (
           <motion.div className="stats-overlay" onClick={() => setShowStats(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="stats-dashboard satin-glass card-luxe" onClick={e => e.stopPropagation()} initial={{ y: 20 }}>
                 <div className="area-header"><span className="section-title">Diagnostics_Link</span><BarChart3 size={18} className="text-primary" /></div>
                 <div className="stats-content">
                    <div className="diag-metrics grid col-2 gap-4 mb-6">
                       <div className="m-card glass p-4"><h3>{streams[currentStream].length}</h3><span>NODES</span></div>
                       <div className="m-card glass p-4"><h3>{hue}H</h3><span>SPECTRUM</span></div>
                    </div>
                    <div className="diag-graph glass p-4">
                       <svg viewBox="0 0 100 30" width="100%"><motion.path d="M0 20 Q 25 5, 50 20 T 100 15" fill="none" stroke="var(--primary)" strokeWidth="0.5" animate={{ d: ["M0 20 Q 25 5, 50 20 T 100 15", "M0 15 Q 25 25, 50 10 T 100 20", "M0 20 Q 25 5, 50 20 T 100 15"] }} transition={{ duration: 5, repeat: Infinity }} /></svg>
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <main className="pro-viewport animate-fade-in">
        <header className="pro-header satin-glass card-luxe">
           <div className="header-branding">
              <div className="logo-ico neon-pulse"><Terminal size={18} /></div>
              <div className="logo-txt"><h1>AETHERIS</h1><span className="label-mono opacity-20">SINGULARITY_APEX_v7.0</span></div>
           </div>
           <div className={`header-pomo satin-glass card-luxe ${pomodoro.active ? 'active' : ''}`} onClick={() => setPomodoro(p => ({...p, active: !p.active}))}>
              <svg className="pomo-ring" width="40" height="40"><circle className="ring-bg" cx="20" cy="20" r="16" /><circle className="ring-progress" cx="20" cy="20" r="16" style={{ strokeDashoffset: Math.abs(strokeDashoffset) }} /></svg>
              <span className="pomo-clock">{Math.floor(pomodoro.time/60)}:{String(pomodoro.time%60).padStart(2,'0')}</span>
           </div>
           <div className="header-right gap-4 flex-center">
              <div className="stream-selector label-mono card-luxe px-3 py-1 bg-white-5 hover:border-primary transition-all cursor-pointer" onClick={() => handleCommand('stream ' + (currentStream === 'Mainframe' ? 'Research' : 'Mainframe'))}><Layers size={12} className="inline mr-2" /> {currentStream}</div>
              <div className="audio-toggle card-luxe" onClick={() => setAudio(a => ({...a, active: !a.active}))}>{audio.active ? <Volume2 size={16} /> : <VolumeX size={16} />}</div>
           </div>
        </header>

        <div className="pro-grid">
           <section className="grid-area tasks-panel satin-glass card-luxe">
              <div className="area-header"><span className="section-title">Objective_Stream</span><Plus size={14} className="opacity-10" /></div>
              <div className="task-flow">
                 {streams[currentStream].map(t => (
                    <motion.div key={t.id} layout className={`pro-task-item ${t.completed ? 'completed' : ''}`} onClick={() => toggleTask(t.id)} whileHover={{ x: 4 }}>
                       <div className="task-check"><CheckCircle2 size={16} /></div>
                       <span className="task-txt">{t.text}</span>
                    </motion.div>
                 ))}
              </div>
           </section>

           <section className="grid-area center-panel satin-glass card-luxe">
              <div className="area-header"><span className="section-title">Resonance_Visualizer</span><div className="sync-status label-mono flex-center gap-2"><div className="sync-dot green" /> {pomodoro.active ? 'AT_APEX' : 'NOMINAL'}</div></div>
              <div className={`heatmap-container ${pomodoro.active ? 'active-pulse' : ''}`}>
                 {Array.from({length: 42}).map((_, i) => <div key={i} className={`h-node lvl-${Math.floor(Math.random()*2)}`} />)}
              </div>
              <div className="constellation-view">
                 {streams[currentStream].map((t, i) => <motion.div key={t.id} className={`c-star ${t.completed ? 'active' : ''}`} style={{ top: `${15+(i*22)%70}%`, left: `${15+(i*28)%70}%` }} animate={{ opacity: t.completed ? 1 : 0.2, scale: t.completed ? [1, 1.5, 1] : 1 }} transition={{ repeat: t.completed ? Infinity : 0, duration: 3 }} />)}
              </div>
           </section>

           <section className="grid-area vault-panel satin-glass card-luxe">
              <div className="area-header"><span className="section-title">Vault_Manifest</span><Lock size={14} className="opacity-10" /></div>
              <div className="vault-flow">
                 {vaultNodes.map(v => (
                    <div key={v.id} className="vault-note glass border-glow">
                       <span className="note-title label-mono">{v.title}</span>
                       <p className="note-preview">{v.content}</p>
                    </div>
                 ))}
                 <div className="add-vault label-mono opacity-20 hover:opacity-100 flex-center gap-2 py-2 cursor-pointer transition-all"><Plus size={14} /> NEW_NODE</div>
              </div>
           </section>
        </div>

        <footer className="pro-footer terminal-panel satin-glass card-luxe">
           <div className="term-head"><span className="section-title">Autonomous_Shell v7.0</span><div className="uptime-tag label-mono">UP_T: {Math.floor(uptime/60)}m {uptime%60}s</div></div>
           <div className="term-body">
              <div className="term-logs">
                 {logs.map((log, i) => <div key={i} className="term-line"><span>{'>'}</span> {log}</div>)}
                 <div ref={logEndRef} />
              </div>
              <div className="term-input">
                 <span>{'>'}</span>
                 <input value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (handleCommand(terminalInput), setTerminalInput(''))} placeholder="invoke_protocol..." />
              </div>
           </div>
        </footer>
      </main>
    </div>
  )
}

export default App
