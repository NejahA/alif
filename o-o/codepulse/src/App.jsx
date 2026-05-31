import { useState, useEffect, useRef } from 'react'

function App() {
  // --- Persistent State (LocalStorage) ---
  const getInitialTasks = () => {
    const saved = localStorage.getItem('cp_tasks')
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Refactor Auth Module', status: 'In Progress', progress: 65, tech: 'React' },
      { id: 2, title: 'Cyber-Shield Protocol', status: 'Pending', progress: 0, tech: 'Security' },
    ]
  }

  // --- Dashboard Metrics ---
  const [healthScore, setHealthScore] = useState(85)
  const [productivity, setProductivity] = useState(92)
  const [energyLevel, setEnergyLevel] = useState(100)
  const [sessionTime, setSessionTime] = useState(parseInt(localStorage.getItem('cp_session') || '0'))
  const [focusMode, setFocusMode] = useState(false)
  const [latency, setLatency] = useState(24)
  
  // --- CodePulser Specifics ---
  const [powerAllocation, setPowerAllocation] = useState({ cpu: 60, gpu: 20, ram: 20 })
  const [heatMap, setHeatMap] = useState(Array(16).fill(0).map(() => Math.random() * 100))
  const [complexity, setComplexity] = useState(42)
  const [techDebt, setTechDebt] = useState(12)
  const [aiResponse, setAiResponse] = useState('Neural Pulse stable. Monitoring vectors.')
  const [toasts, setToasts] = useState([])
  
  // --- Terminal State ---
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'sys', content: 'codepulser CLI v0.9.1' },
    { type: 'sys', content: 'Type "help" for commands.' }
  ])

  // --- Services State ---
  const [services, setServices] = useState([
    { name: 'Auth-Service', status: 'Up', uptime: '99.9%', load: '12%' },
    { name: 'Data-Sync', status: 'Up', uptime: '98.4%', load: '45%' },
    { name: 'Neural-Core', status: 'Up', uptime: '100%', load: '8%' },
    { name: 'Pulse-Proxy', status: 'Degraded', uptime: '94.2%', load: '89%' },
  ])

  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Dev_Alpha', active: true },
    { id: 2, name: 'Byte_Knight', active: true },
    { id: 3, name: 'Cyber_Siren', active: false },
  ])

  // --- Security & Env ---
  const [env, setEnv] = useState('Local')
  const [buildStatus, setBuildStatus] = useState('Passing')
  const [securityAlerts, setSecurityAlerts] = useState([])
  const [threatLevel, setThreatLevel] = useState('Low')

  // --- Pomodoro ---
  const [pomoTime, setPomoTime] = useState(25 * 60)
  const [pomoActive, setPomoActive] = useState(false)
  const [pomoMode, setPomoMode] = useState('focus')

  // --- Data Lists ---
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), msg: 'codepulser Engine Re-Syncing...', type: 'info' },
  ])
  const [activeTasks, setActiveTasks] = useState(getInitialTasks())
  const [commitHistory, setCommitHistory] = useState([
    { id: 1, msg: 'Initial dashboard scaffold', hash: 'a1b2c3d' },
  ])
  const [skills, setSkills] = useState(['JS', 'React', 'Tailwind'])
  const [pulseData, setPulseData] = useState(Array(24).fill(0).map(() => Math.floor(Math.random() * 100)))
  const [loc, setLoc] = useState(12402)
  const [buildTime, setBuildTime] = useState(1.42)
  const [waveData, setWaveData] = useState(Array(30).fill(50))
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Dev_Alpha', msg: 'Re-syncing neural core...', time: '10:42' },
    { id: 2, user: 'Cyber_Siren', msg: 'Vibrant pulse detected.', time: '10:45' },
  ])
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'Dev_Alpha', score: 9820, rank: 1, status: 'Online' },
    { id: 2, name: 'Byte_Knight', score: 8540, rank: 2, status: 'Coding' },
    { id: 3, name: 'Cyber_Siren', score: 7210, rank: 3, status: 'Away' },
    { id: 4, name: 'Neo_Coder', score: 6950, rank: 4, status: 'Online' },
  ])

  const logEndRef = useRef(null)
  const terminalEndRef = useRef(null)

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('cp_tasks', JSON.stringify(activeTasks))
  }, [activeTasks])

  useEffect(() => {
    localStorage.setItem('cp_session', sessionTime.toString())
  }, [sessionTime])

  // Auto-scroll
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalHistory])

  // --- Real-time Loop ---
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1)
      if (sessionTime % 50 === 0) setEnergyLevel(prev => Math.max(0, prev - 1))
      setHeatMap(prev => prev.map(h => Math.min(100, Math.max(10, h + (Math.random() - 0.5) * 15))))
      setPulseData(prev => [...prev.slice(1), Math.floor(Math.random() * 100)])
      setWaveData(prev => [...prev.slice(1), 30 + Math.sin(Date.now() / 500) * 20 + Math.random() * 20])
      setLoc(prev => prev + (Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0))
      setBuildTime(prev => Math.max(0.5, Math.min(5, prev + (Math.random() - 0.5) * 0.1)))
      setComplexity(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 2)))
      if (Math.random() > 0.98) {
        const bots = ['Dev_Alpha', 'Byte_Knight', 'Cyber_Siren']
        const msgs = ['Neural sync at 98%', 'Optimizing UI...', 'Vibrant pulse locked.', 'Ping at 12ms.']
        const user = bots[Math.floor(Math.random() * bots.length)]
        const msg = msgs[Math.floor(Math.random() * msgs.length)]
        setChatMessages(prev => [...prev.slice(-4), { id: Date.now(), user, msg, time: new Date().toLocaleTimeString().substr(0, 5) }])
      }
      setTechDebt(prev => Math.max(0, Math.min(50, prev + (Math.random() - 0.5) * 1)))
      setServices(prev => prev.map(s => ({ ...s, load: `${Math.floor(Math.random() * 90)}%`, status: Math.random() > 0.98 ? 'Degraded' : 'Up' })))
      setLatency(prev => Math.max(10, Math.min(150, prev + (Math.random() - 0.5) * 15)))
      if (Math.random() > 0.995 && securityAlerts.length < 2) triggerSecurityAlert()
      if (Math.random() > 0.985) {
        const aiMsgs = ['Syncing Neural patterns...', 'Vibrant pulse detected.', 'Optimizing colors...', 'Analyzing code flow...']
        setAiResponse(aiMsgs[Math.floor(Math.random() * aiMsgs.length)])
      }
      if (Math.random() > 0.96) setCollaborators(prev => prev.map(c => Math.random() > 0.85 ? { ...c, active: !c.active } : c))
      if (Math.random() > 0.85) setHealthScore(prev => Math.min(100, Math.max(50, prev + (Math.random() - 0.5) * 6)))
      if (Math.random() > 0.99) setLeaderboard(prev => prev.map(u => ({ ...u, score: u.score + Math.floor(Math.random() * 50) })))
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionTime, securityAlerts])

  // --- Pomodoro Loop ---
  useEffect(() => {
    let interval = null
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(prev => prev - 1), 1000)
    } else if (pomoTime === 0) {
      clearInterval(interval)
      handlePomoFinish()
    }
    return () => clearInterval(interval)
  }, [pomoActive, pomoTime])

  // --- Handlers ---
  const showToast = (msg, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev.slice(-12), { id: Date.now(), time: new Date().toLocaleTimeString(), msg, type }])
  }

  const triggerSecurityAlert = () => {
    const threats = ['Shadow Packet Detected', 'DDoS Pattern Locked', 'Registry Breach Attempt']
    const newAlert = { id: Date.now(), msg: threats[Math.floor(Math.random() * threats.length)], time: new Date().toLocaleTimeString() }
    setSecurityAlerts(prev => [newAlert, ...prev]); setThreatLevel('High'); showToast(`ALERT: ${newAlert.msg}`, 'warning'); addLog(`SEC: ${newAlert.msg}`, 'warning')
  }

  const resolveAlert = (id) => {
    setSecurityAlerts(prev => prev.filter(a => a.id !== id)); if (securityAlerts.length <= 1) setThreatLevel('Low')
    showToast('Threat Neutralized', 'success'); addLog('Security patch applied', 'success')
  }

  const handleCoffeeBreak = () => {
    setEnergyLevel(prev => Math.min(100, prev + 35)); showToast('Energy Restored', 'success'); addLog('Caffeine spike active', 'success')
  }

  const handleCommit = () => {
    const hash = Math.random().toString(36).substring(2, 9)
    setCommitHistory(prev => [{ id: Date.now(), msg: `feat: vibrant update ${hash}`, hash }, ...prev.slice(0, 3)])
    showToast(`Committed: ${hash}`, 'success'); addLog(`Git push: ${hash}`, 'success'); setProductivity(prev => Math.min(100, prev + 4))
  }

  const handleAddTask = () => {
    const techs = ['Rust', 'Go', 'K8s', 'Docker', 'Python']
    const tech = techs[Math.floor(Math.random() * techs.length)]
    setActiveTasks(prev => [{ id: Date.now(), title: `${tech} Module Sync`, status: 'Pending', progress: 0, tech }, ...prev])
    showToast(`New Task: ${tech}`, 'info'); addLog(`Sprint: New task added`, 'info')
  }

  const handleUpdateTask = (id) => {
    setActiveTasks(prev => prev.map(t => {
      if (t.id === id && t.progress < 100) {
        const next = t.progress + 25
        if (next === 100) {
          showToast(`Done: ${t.title}`, 'success'); addLog(`Verified: ${t.title}`, 'success')
          if (!skills.includes(t.tech)) setSkills(s => [...s, t.tech])
          return { ...t, progress: 100, status: 'Completed' }
        }
        return { ...t, progress: next, status: 'In Progress' }
      }
      return t
    }))
  }

  const handlePomoFinish = () => {
    setPomoActive(false)
    if (pomoMode === 'focus') {
      setPomoMode('break'); setPomoTime(5 * 60); showToast('Focus Session Done!', 'success'); addLog('Focus complete', 'success')
    } else {
      setPomoMode('focus'); setPomoTime(25 * 60); showToast('Back to Focus!', 'info'); addLog('Break over', 'info')
    }
  }

  const handleTerminalSubmit = (e) => {
    e.preventDefault(); if (!terminalInput.trim()) return
    const cmd = terminalInput.trim().toLowerCase()
    setTerminalHistory(prev => [...prev, { type: 'user', content: `> ${terminalInput}` }])
    let response = ''
    if (cmd === 'help') response = 'Commands: help, status, clear, task, reboot'
    else if (cmd === 'status') response = `codepulser v0.9.1 | Health: ${Math.round(healthScore)} | Latency: ${Math.round(latency)}ms`
    else if (cmd === 'clear') { setTerminalHistory([]); setTerminalInput(''); return }
    else if (cmd === 'task') { handleAddTask(); response = 'Task vector initiated.' }
    else if (cmd === 'reboot') response = 'Rebooting core... Success.'; else response = `Unknown command: ${cmd}`
    if (response) setTimeout(() => setTerminalHistory(prev => [...prev, { type: 'sys', content: response }]), 300)
    setTerminalInput('')
  }

  const formatSeconds = (seconds) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans selection:bg-sky-500/30 relative overflow-x-hidden antialiased">
      
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-500/5 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
      </div>

      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-3 rounded-xl border backdrop-blur-2xl shadow-2xl animate-fadeIn pointer-events-auto ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : t.type === 'warning' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-sky-500/10 border-sky-500/30 text-sky-400'} font-black text-[10px] uppercase tracking-widest`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* HEADER */}
      {!focusMode && (
        <header className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.3)] transform hover:rotate-6 transition-transform">
               <svg className="w-9 h-9 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-sky-400 via-white to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">codepulser</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[9px] font-black text-sky-400 uppercase tracking-widest">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative z-10">
             <div className="bg-slate-950/50 px-5 py-3 rounded-2xl border border-slate-800 text-center min-w-[120px]">
                <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Session</div>
                <div className="font-mono text-lg font-black text-sky-400">{new Date(sessionTime * 1000).toISOString().substr(11, 8)}</div>
             </div>
             <div className="bg-slate-950/50 px-5 py-3 rounded-2xl border border-slate-800 text-center min-w-[120px]">
                <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Project LOC</div>
                <div className="font-mono text-lg font-black text-emerald-400">{loc.toLocaleString()}</div>
             </div>
             <button onClick={() => setFocusMode(true)} className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20">Deep Focus</button>
          </div>
        </header>
      )}

      {focusMode && (
        <button onClick={() => setFocusMode(false)} className="fixed top-10 right-10 px-6 py-3 bg-slate-900/50 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all backdrop-blur-xl border border-sky-500/20 z-50">Exit Focus</button>
      )}

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 relative z-10">
        
        {/* LEFT COLUMN: SYSTEM HUB */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SYSTEM CORE */}
          <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col items-center group relative overflow-hidden">
             <div className="absolute inset-0 bg-sky-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 relative z-10">System Core</h3>
             <div className="relative w-40 h-40 z-10">
                <svg className="w-full h-full -rotate-90">
                   <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                   <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 72} strokeDashoffset={2 * Math.PI * 72 * (1 - healthScore / 100)} className="text-sky-400 transition-all duration-1000" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black text-white">{Math.round(healthScore)}</span>
                   <span className="text-[8px] font-black text-sky-400 uppercase mt-1 tracking-widest">Stability</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-8 w-full mt-10 relative z-10">
                <div className="text-center">
                   <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Latency</div>
                   <div className="text-lg font-black font-mono text-emerald-400">{Math.round(latency)}ms</div>
                </div>
                <div className="text-center">
                   <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Energy</div>
                   <div className="text-lg font-black font-mono text-amber-400">{energyLevel}%</div>
                </div>
             </div>
          </section>

          {/* SECURITY RADAR */}
          <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-rose-500/20 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 z-20">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${threatLevel === 'Low' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10 animate-pulse'}`}>{threatLevel}</span>
             </div>
             <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 relative z-10">Security Radar</h3>
             <div className="relative w-32 h-32 mx-auto z-10">
                <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-rose-500/10 rounded-full scale-75"></div>
                <div className="absolute inset-0 border-2 border-rose-500/5 rounded-full scale-50"></div>
                <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/50 to-rose-500/0 origin-left animate-spin-slow"></div>
                {securityAlerts.map((a, i) => (
                  <div key={a.id} className="absolute w-2 h-2 bg-rose-500 rounded-full animate-ping" style={{ top: `${20 + i * 30}%`, left: `${30 + i * 25}%` }}></div>
                ))}
             </div>
             <div className="mt-8 space-y-2 relative z-10">
                {securityAlerts.length > 0 ? securityAlerts.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-2 bg-rose-500/5 rounded-lg border border-rose-500/10">
                     <span className="text-[9px] font-black text-rose-400 uppercase truncate pr-2">{a.msg}</span>
                     <button onClick={() => resolveAlert(a.id)} className="p-1 bg-rose-500 text-slate-950 rounded hover:bg-rose-400 transition-colors"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></button>
                  </div>
                )) : (
                  <div className="text-center py-2 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Shield Active</div>
                )}
             </div>
          </section>

          {/* POMO TIMER */}
          <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-1000" style={{ width: `${(pomoTime / (pomoMode === 'focus' ? 1500 : 300)) * 100}%` }}></div>
             </div>
             <div className="text-center relative z-10">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Sync</h4>
                <div className="text-6xl font-black tabular-nums text-white mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{formatSeconds(pomoTime)}</div>
                <div className="flex gap-3">
                   <button onClick={() => setPomoActive(!pomoActive)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${pomoActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white text-slate-950 shadow-lg hover:scale-[1.02]'}`}>{pomoActive ? 'Suspend' : 'Initiate'}</button>
                   <button onClick={() => { setPomoActive(false); setPomoTime(pomoMode === 'focus' ? 1500 : 300); }} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>
                </div>
             </div>
          </section>

          {/* RESOURCE ALLOCATIONS */}
          <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
             <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Allocations</h3>
             {Object.entries(powerAllocation).map(([res, val]) => (
               <div key={res} className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>{res}</span>
                    <span className="text-sky-400 font-mono">{val}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={val} onChange={(e) => setPowerAllocation(p => ({ ...p, [res]: parseInt(e.target.value) }))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400" />
               </div>
             ))}
          </section>

        </div>

        {/* RIGHT COLUMN: DEVELOPMENT HUB */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* NEURAL WAVE & PULSE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-sky-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Neural Frequency</h3>
                <div className="h-24 relative z-10">
                   <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <path d={`M 0 100 ${waveData.map((v, i) => `L ${i * 10.34} ${100 - v}`).join(' ')} L 300 100 Z`} fill="url(#waveGradient)" />
                      <defs>
                         <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                         </linearGradient>
                      </defs>
                      <path d={waveData.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * 10.34} ${100 - v}`).join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                   </svg>
                </div>
             </section>
             <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-sky-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Pulse Analyzer</h3>
                <div className="flex items-end gap-1 h-24 relative z-10">
                   {pulseData.map((v, i) => (
                     <div key={i} className="flex-1 bg-sky-500/20 rounded-t-sm transition-all duration-500 group-hover:bg-sky-500/40" style={{ height: `${v}%`, opacity: (i + 1) / pulseData.length }}></div>
                   ))}
                </div>
             </section>
          </div>

           {/* TERMINAL */}
           <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-sky-500/30 h-80 flex flex-col shadow-2xl relative group">
              <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none"></div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sky-500/60 text-[10px] font-black uppercase tracking-[0.3em]">Neural CLI v0.9</h3>
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1 pr-4 custom-scrollbar mb-4 scroll-smooth">
                 {terminalHistory.map((h, i) => (
                   <div key={i} className={h.type === 'user' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]' : 'text-sky-400/80'}>{h.content}</div>
                 ))}
                 <div ref={terminalEndRef}></div>
              </div>
              <form onSubmit={handleTerminalSubmit} className="flex gap-3 items-center bg-slate-900/50 p-3 rounded-xl border border-sky-500/20 focus-within:border-sky-500/50 transition-all">
                 <span className="text-emerald-500 font-bold animate-pulse">$</span>
                 <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="bg-transparent border-none outline-none flex-1 text-sky-400 font-mono text-xs placeholder:text-sky-900" placeholder="Awaiting command..." />
              </form>
           </div>

              {/* NEURAL NETWORK (SKILLS) */}
              <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl overflow-hidden relative">
                 <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Neural Network</h3>
                 <div className="relative h-40 flex items-center justify-center">
                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                       <circle cx="50%" cy="50%" r="30" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                       {skills.map((_, i) => {
                         const angle = (i / skills.length) * Math.PI * 2
                         const x2 = 50 + Math.cos(angle) * 35
                         const y2 = 50 + Math.sin(angle) * 35
                         return <line key={i} x1="50%" y1="50%" x2={`${x2}%`} y2={`${y2}%`} stroke="#10b981" strokeWidth="0.5" />
                       })}
                    </svg>
                    {/* Skill Nodes */}
                    <div className="absolute w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10">
                       <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    {skills.map((s, i) => {
                      const angle = (i / skills.length) * Math.PI * 2
                      const x = Math.cos(angle) * 60
                      const y = Math.sin(angle) * 60
                      return (
                        <div key={s} className="absolute px-3 py-1 bg-slate-950/80 border border-emerald-500/30 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest shadow-lg hover:scale-110 transition-all cursor-default group" style={{ transform: `translate(${x}px, ${y}px)` }}>
                           {s}
                           <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"></div>
                        </div>
                      )
                    })}
                 </div>
              </div>

              {/* RESOURCE ALLOCATOR */}
           <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-sky-500/20 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(powerAllocation).map(([res, val]) => (
                <div key={res} className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>{res}</span>
                    <span className="text-sky-400 font-mono drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]">{val}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={val} onChange={(e) => {
                    const newVal = parseInt(e.target.value)
                    setPowerAllocation(prev => ({ ...prev, [res]: newVal }))
                  }} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400" />
                </div>
              ))}
           </div>

          {/* SPRINT PULSE */}
          <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-sky-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                <div>
                   <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Sprint Pulse</h2>
                   <p className="text-slate-500 text-[9px] font-black uppercase mt-1 tracking-widest">Active Development Cycles</p>
                </div>
                <button onClick={handleAddTask} className="px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-sky-500/10">New Vector</button>
             </div>

             <div className="grid gap-4 relative z-10">
                {activeTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-sky-500/30 transition-all group/task">
                     <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[10px] border ${task.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>{task.tech}</div>
                        <div>
                           <h4 className="text-base font-black text-white group-hover/task:text-sky-400 transition-colors">{task.title}</h4>
                           <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{task.status}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-6 flex-1 w-full max-w-sm">
                        <div className="flex-1 space-y-2">
                           <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest"><span>Sync</span><span>{task.progress}%</span></div>
                           <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5"><div className={`h-full rounded-full transition-all duration-1000 ${task.status === 'Completed' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]'}`} style={{ width: `${task.progress}%` }}></div></div>
                        </div>
                        {task.status !== 'Completed' && <button onClick={() => handleUpdateTask(task.id)} className="px-4 py-2 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 rounded-lg text-[9px] font-black uppercase transition-all">Push</button>}
                     </div>
                  </div>
                ))}
             </div>
          </section>

           {/* SERVICES & SECURITY */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-sky-500/20 h-64 flex flex-col shadow-xl">
                 <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Service Mesh</h3>
                 <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                    {services.map(s => (
                      <div key={s.name} className="flex justify-between p-2.5 bg-slate-950/40 rounded-xl border border-sky-500/10 hover:border-sky-500/30 transition-colors">
                         <span className="text-[11px] font-bold text-slate-400">{s.name}</span>
                         <span className={`text-[10px] font-black tracking-widest ${s.status === 'Up' ? 'text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]' : 'text-rose-400 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]'}`}>{s.status}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-rose-500/20 h-64 flex flex-col shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Security</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${threatLevel === 'Low' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20 animate-pulse'}`}>{threatLevel}</span>
                 </div>
                 <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                    {securityAlerts.map(a => (
                      <div key={a.id} className="flex justify-between items-center p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                         <span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">{a.msg}</span>
                         <button onClick={() => resolveAlert(a.id)} className="p-1 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-md transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></button>
                      </div>
                    ))}
                    {securityAlerts.length === 0 && <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-black tracking-[0.5em] opacity-50">SHIELD: ACTIVE</div>}
                 </div>
              </div>
           </div>

           {/* LEADERBOARD & STATS */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-sky-500/20 shadow-xl">
                 <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Global Leaderboard</h3>
                 <div className="space-y-4">
                    {leaderboard.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs">#{user.rank}</div>
                            <div>
                               <div className="text-sm font-black text-white group-hover:text-sky-400 transition-colors">{user.name}</div>
                               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user.status}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-lg font-black font-mono text-emerald-400">{user.score.toLocaleString()}</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Pulse Points</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="md:col-span-4 space-y-8">
                 <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-sky-500/20 shadow-xl text-center">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Build Performance</h3>
                    <div className="text-4xl font-black font-mono text-sky-400 mb-2">{buildTime.toFixed(2)}s</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg. Compilation</div>
                 </div>
                 <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl text-center">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Uptime</h3>
                    <div className="text-4xl font-black font-mono text-emerald-400 mb-2">99.99%</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Stability</div>
                 </div>
               </div>
            </div>

            {/* COLLABORATOR CHAT FEED */}
            <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Neural Feed</h3>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-emerald-500 font-mono text-[9px] uppercase tracking-widest">Live Connect</span>
                  </div>
               </div>
               <div className="space-y-4">
                  {chatMessages.map(m => (
                    <div key={m.id} className="flex gap-4 items-start p-3 bg-slate-950/20 rounded-xl border border-slate-800/50 hover:border-emerald-500/20 transition-all animate-fadeIn">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-400">{m.user[0]}</div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-emerald-400/80">{m.user}</span>
                             <span className="text-[8px] font-bold text-slate-600 font-mono">{m.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium italic">"{m.msg}"</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
       </main>

    </div>
  )
}

export default App
