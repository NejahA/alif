import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wind, Code, Brain, PenTool, Trophy, Activity, Timer, 
  Maximize2, Minimize2, Volume2, VolumeX, Play, Pause, 
  CloudRain, Flame, Waves, Radio, Zap, Command, Heart,
  Sparkles, Coffee, BookOpen, Settings, Layers, MousePointer2,
  ChevronRight, ArrowRight, Share2, Download, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ZenMode = () => {
  const [isZen, setIsZen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale');
  const [timer, setTimer] = useState(1500); 
  const [isActive, setIsActive] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [activeSound, setActiveSound] = useState('Rain');
  const [code, setCode] = useState('// Inhale... Exhale... Connect to the Source\n\nfunction ecosystem() {\n  const mind = "clear";\n  const flow = "deep";\n  \n  while(mind === "clear") {\n    create_impact();\n  }\n}');
  const [view, setView] = useState('editor'); 
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalInput, setJournalInput] = useState('');
  const [flowRate, setFlowRate] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('Logic');
  const [isHovering, setIsHovering] = useState(false);
  
  const particles = useMemo(() => [...Array(40)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 10
  })), []);

  const tabs = ['Logic', 'Creative', 'Refactor'];

  // Custom Cursor Logic
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Breathing Logic (4s cycle)
  useEffect(() => {
    let interval;
    if (isZen || isActive) {
      interval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold') return 'Exhale';
          return 'Inhale';
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isZen, isActive]);

  // Flow Simulation
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setFlowRate(Math.floor(Math.random() * 15) + 85);
      }, 3000);
      return () => clearInterval(interval);
    }
    setFlowRate(0);
  }, [isActive]);

  // Pomodoro Timer
  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addJournalEntry = () => {
    if (!journalInput.trim()) return;
    setJournalEntries([{ id: Date.now(), text: journalInput, time: new Date().toLocaleTimeString() }, ...journalEntries]);
    setJournalInput('');
  };

  return (
    <div className={`min-h-screen w-full transition-all duration-1000 ${isZen ? 'bg-[#010103]' : 'bg-[#020205]'} text-slate-300 font-sans selection:bg-purple-500/40 overflow-hidden relative mesh-gradient`}>
      
      {/* Custom Hyper-Cursor */}
      {!isZen && (
        <motion.div 
          className="custom-cursor flex items-center justify-center"
          animate={{ 
            x: mousePos.x - 12, 
            y: mousePos.y - 12,
            scale: isHovering ? 2.5 : 1,
            backgroundColor: isHovering ? 'rgba(255,255,255,0.1)' : 'transparent'
          }}
          transition={{ type: 'spring', damping: 35, stiffness: 350, mass: 0.4 }}
        >
          {isHovering && <div className="w-1 h-1 bg-white rounded-full animate-ping" />}
        </motion.div>
      )}

      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${isZen ? 'opacity-30' : 'opacity-60'} zen-gradient-bg`} />
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="floating-particle"
            animate={{
              y: ['-10vh', '110vh'],
              opacity: [0, 0.4, 0],
              scale: [1, 1.8, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}vw`,
            }}
          />
        ))}
      </div>

      {/* Navigation Sidebar */}
      {!isZen && (
        <motion.nav 
          initial={{ x: -120 }}
          animate={{ x: 0 }}
          className="fixed left-10 top-1/2 -translate-y-1/2 flex flex-col gap-10 z-50 p-6 glass-morphism rounded-[3.5rem] border border-white/5"
        >
          {[
            { id: 'editor', icon: Brain, label: 'Neural_Flow' },
            { id: 'journal', icon: PenTool, label: 'Reflections' },
            { id: 'achievements', icon: Trophy, label: 'Evolution' },
            { id: 'stats', icon: Activity, label: 'Telemetry' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`p-5 rounded-[2rem] transition-all group relative ${view === item.id ? 'bg-purple-500/20 text-purple-400' : 'text-slate-700 hover:text-slate-300'}`}
            >
              <item.icon size={24} className={view === item.id ? 'animate-pulse' : ''} />
              <div className="absolute left-full ml-8 px-5 py-3 rounded-2xl bg-[#050508]/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl z-[100]">
                {item.label}
              </div>
            </button>
          ))}
        </motion.nav>
      )}

      {/* Top Interface Bar */}
      <AnimatePresence>
        {!isZen && (
          <motion.header 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-0 right-0 p-12 flex justify-between items-center z-50 pointer-events-none"
          >
            <div className="flex items-center gap-10 ml-28 pointer-events-auto">
              <motion.div 
                whileHover={{ rotate: 90, scale: 1.1 }}
                className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-purple-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float"
              >
                <Wind className="text-white" size={32} />
              </motion.div>
              <div className="space-y-1.5">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic syntax-shimmer">Meeme_Pro</h1>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <p className="text-[11px] font-black text-slate-700 tracking-[0.6em] uppercase">Hyper_Neural_Interface_V.03</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 pointer-events-auto mr-12">
              <div className="flex items-center gap-10 px-12 py-6 rounded-[3rem] glass-morphism border-white/10 relative group shadow-2xl">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Temporal_Shift</span>
                  <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tighter">{formatTime(timer)}</span>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Neural_Sync</span>
                  <span className="text-2xl font-mono font-bold text-purple-400 tabular-nums tracking-tighter">{flowRate}%</span>
                </div>
              </div>
              <button 
                onClick={() => setIsZen(!isZen)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="p-6 rounded-[2rem] glass-morphism hover:bg-white/5 transition-all group border-white/10"
              >
                <Maximize2 size={26} className="group-hover:scale-110 transition-transform text-slate-500 group-hover:text-white" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Primary Interaction Canvas */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-12 pt-24">
        <AnimatePresence mode="wait">
          {view === 'editor' && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className={`w-full max-w-[1400px] grid transition-all duration-1000 gap-24 ${isZen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}
            >
              
              {/* Left Wing: Bio-Rhythm */}
              <div className={`${isZen ? 'flex flex-col items-center' : 'lg:col-span-4'} space-y-24`}>
                {/* Advanced Bio-Sphere */}
                <div className="flex flex-col items-center justify-center space-y-20 py-12">
                  <div className="relative group">
                    <motion.div 
                      animate={{ 
                        scale: breathingPhase === 'Inhale' ? 1.8 : breathingPhase === 'Hold' ? 1.8 : 1,
                        opacity: breathingPhase === 'Inhale' ? 0.4 : breathingPhase === 'Hold' ? 0.5 : 0.2
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-80 h-80 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-emerald-500 blur-[100px]"
                    />
                    <motion.div 
                      animate={{ 
                        scale: breathingPhase === 'Inhale' ? 1.6 : breathingPhase === 'Hold' ? 1.6 : 1 
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 m-auto w-56 h-56 rounded-full border border-white/10 glass-morphism breathing-sphere flex flex-col items-center justify-center overflow-hidden shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
                      <Wind className="text-purple-400/80 mb-6 animate-pulse" size={56} />
                      <div className="flex gap-2">
                        {[...Array(8)].map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ 
                              height: breathingPhase === 'Inhale' ? [20, 40, 20] : 10,
                              opacity: breathingPhase === 'Inhale' ? 0.8 : 0.2
                            }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1.5 bg-purple-500 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  <div className="text-center space-y-6">
                    <motion.h3 
                      key={breathingPhase}
                      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      className="text-6xl font-black text-white uppercase tracking-[0.25em] syntax-shimmer italic"
                    >
                      {breathingPhase}
                    </motion.h3>
                    <div className="flex justify-center gap-4">
                      {['Inhale', 'Hold', 'Exhale'].map(p => (
                        <div key={p} className={`h-1.5 rounded-full transition-all duration-700 ${breathingPhase === p ? 'w-12 bg-purple-500 shadow-[0_0_15px_rgba(167,139,250,0.5)]' : 'w-2 bg-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Frequency Mixer Module */}
                {!isZen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism p-16 rounded-[4.5rem] space-y-16 relative overflow-hidden group border border-white/5 shadow-2xl"
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-4">
                        <Waves size={20} className="text-blue-500" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600">Frequency_Matrix</h4>
                      </div>
                      <Volume2 size={16} className="text-slate-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                      {[
                        { id: 'Rain', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                        { id: 'Waves', icon: Waves, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                        { id: 'Fire', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/5' },
                        { id: 'Deep', icon: Radio, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                      ].map((sound) => (
                        <button 
                          key={sound.id} 
                          onClick={() => setActiveSound(sound.id)}
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          className={`p-8 rounded-[2.5rem] transition-all text-left border relative overflow-hidden group/btn ${activeSound === sound.id ? 'bg-white/[0.04] border-white/20 shadow-xl' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                        >
                          <sound.icon size={26} className={`${sound.color} ${activeSound === sound.id ? 'opacity-100 scale-110' : 'opacity-20'} mb-6 transition-all duration-500`} />
                          <span className={`text-[11px] font-black uppercase tracking-widest block transition-colors ${activeSound === sound.id ? 'text-white' : 'text-slate-700 group-hover/btn:text-slate-400'}`}>{sound.id}</span>
                          {activeSound === sound.id && (
                            <motion.div layoutId="activeSound" className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Center Wing: Neural Canvas */}
              <div className={`${isZen ? 'max-w-[1000px] mx-auto' : 'lg:col-span-8'}`}>
                <motion.div 
                  layout
                  className={`glass-morphism rounded-[5rem] overflow-hidden transition-all duration-1000 border border-white/10 relative shadow-2xl ${isZen ? 'shadow-[0_0_250px_rgba(167,139,250,0.25)] border-purple-500/20' : ''}`}
                >
                  {/* Context Switcher */}
                  <div className="px-20 py-12 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex gap-12">
                      {tabs.map(tab => (
                        <button 
                          key={tab} 
                          onClick={() => setActiveTab(tab)}
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          className={`text-[12px] font-black uppercase tracking-[0.4em] transition-all relative py-2 ${activeTab === tab ? 'text-white' : 'text-slate-700 hover:text-slate-500'}`}
                        >
                          {tab}
                          {activeTab === tab && (
                            <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 w-full h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#8b5cf6]" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-4 px-6 py-2.5 rounded-full glass-morphism border-white/10">
                        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse' : 'bg-slate-800'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{isActive ? 'Flow_Engaged' : 'Sync_Pending'}</span>
                      </div>
                      <Terminal size={20} className="text-slate-800" />
                    </div>
                  </div>

                  {/* High-Fidelity Editor */}
                  <div className="relative">
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-[700px] bg-transparent p-24 font-mono text-xl leading-relaxed text-slate-400 outline-none resize-none custom-scrollbar selection:bg-purple-500/30"
                      spellCheck="false"
                      placeholder="// Inhale... Connect... Create..."
                    />
                    <div className="absolute bottom-20 right-20 flex gap-10">
                      <motion.button 
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsActive(!isActive)}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className={`group px-16 py-8 rounded-[3rem] font-black text-[14px] uppercase tracking-[0.5em] transition-all flex items-center gap-6 shadow-2xl ${isActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white text-black shadow-white/10'}`}
                      >
                        {isActive ? <Pause size={24} /> : <Play size={24} />}
                        {isActive ? 'Suspend_Neural_Link' : 'Initiate_Source_Code'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Neural Telemetry Grid */}
                <AnimatePresence>
                  {!isZen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 60 }}
                      className="mt-24 grid grid-cols-4 gap-12"
                    >
                      {[
                        { label: 'Neural_Pulse', val: (isActive ? flowRate : 0) + ' bpm', icon: Heart, color: 'text-rose-500' },
                        { label: 'Entropy_Level', val: '0.00012', icon: Sparkles, color: 'text-amber-400' },
                        { label: 'Sync_Protocol', val: 'Active', icon: Waves, color: 'text-cyan-400' },
                        { label: 'Zen_Rank', val: 'Architect', icon: Command, color: 'text-purple-400' },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-morphism p-14 rounded-[4rem] flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all border border-white/5 glow-card shadow-xl">
                          <stat.icon size={32} className={`${stat.color} mb-8 opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700`} />
                          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 mb-3">{stat.label}</span>
                          <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{stat.val}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Additional views (Reflect, Evolve, Telemetry) follow same high-fidelity pattern */}
          {view === 'journal' && (
            <motion.div 
              key="journal"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-5xl space-y-24"
            >
              <div className="text-center space-y-8">
                <h2 className="text-8xl font-black text-white tracking-tighter uppercase syntax-shimmer italic">Reflect</h2>
                <p className="text-slate-600 text-sm font-black tracking-[0.8em] uppercase">Document the evolution of your neural architecture</p>
              </div>
              <div className="glass-morphism p-20 rounded-[6rem] space-y-12 relative overflow-hidden border border-white/10 shadow-2xl">
                <textarea 
                  value={journalInput}
                  onChange={(e) => setJournalInput(e.target.value)}
                  placeholder="What patterns emerged in the silence?"
                  className="w-full bg-transparent border-none outline-none text-slate-300 font-medium text-2xl leading-relaxed resize-none h-64 custom-scrollbar"
                />
                <div className="flex justify-end">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={addJournalEntry}
                    className="px-16 py-8 bg-white text-black rounded-[3rem] font-black text-[14px] uppercase tracking-[0.5em] shadow-2xl"
                  >
                    Commit_State_Change
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[1400px]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-8 glass-morphism p-24 rounded-[7rem] relative overflow-hidden border border-white/10 shadow-2xl">
                   <h3 className="text-5xl font-black text-white uppercase tracking-tighter mb-24 italic">Neural_Resonance_Logs</h3>
                   <div className="h-[500px] flex items-end gap-8 relative z-10">
                      {[50, 85, 40, 95, 75, 90, 45, 65, 95, 70, 85, 100].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05, duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                          className="flex-1 bg-gradient-to-t from-purple-500/30 via-blue-500/20 to-emerald-500/20 rounded-full border border-white/10 glow-card group relative"
                        >
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 px-4 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-2xl">
                              {h}%
                           </div>
                        </motion.div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-16 px-4 text-[12px] font-black text-slate-600 uppercase tracking-[0.6em]">
                      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <span key={d}>{d}</span>)}
                   </div>
                </div>
                <div className="lg:col-span-4 space-y-20">
                   <div className="glass-morphism p-16 rounded-[6rem] space-y-16 border border-white/10 shadow-2xl">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Ecosystem_Health</h3>
                      <div className="space-y-12">
                         {[
                           { label: 'Neural_Focus', val: 94, color: 'bg-purple-500 shadow-[0_0_20px_#8b5cf6]' },
                           { label: 'Breath_Sync', val: 88, color: 'bg-blue-500 shadow-[0_0_20px_#3b82f6]' },
                           { label: 'Ecosystem_Stability', val: 76, color: 'bg-emerald-500 shadow-[0_0_20px_#10b981]' },
                         ].map(stat => (
                           <div key={stat.label} className="space-y-6">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.4em]">
                                 <span className="text-slate-600">{stat.label}</span>
                                 <span className="text-white">{stat.val}%</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${stat.val}%` }}
                                   transition={{ duration: 2, ease: "easeOut" }}
                                   className={`h-full rounded-full ${stat.color}`}
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Zen Overlay UI */}
      <AnimatePresence>
        {isZen && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-16 right-16 flex items-center gap-10 z-50"
          >
            <div className="flex items-center gap-8 px-10 py-5 rounded-[2.5rem] glass-morphism border-white/20 shadow-2xl">
               <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 mb-1">State</span>
                 <span className="text-sm font-black text-white uppercase">{breathingPhase}</span>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 mb-1">Drift</span>
                 <span className="text-sm font-mono font-bold text-white">{formatTime(timer)}</span>
               </div>
            </div>
            <button 
              onClick={() => setIsZen(false)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="p-8 rounded-[2.5rem] glass-morphism hover:bg-white/10 transition-all text-slate-600 hover:text-white group border border-white/20 shadow-2xl"
            >
              <Minimize2 size={32} className="group-hover:rotate-180 transition-transform duration-1000" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Mute Toggle */}
      <button 
        onClick={() => setSoundOn(!soundOn)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="fixed bottom-16 left-16 p-8 rounded-[2.5rem] glass-morphism hover:bg-white/10 transition-all text-slate-600 hover:text-white z-50 group border border-white/10 shadow-2xl"
      >
        {soundOn ? <Volume2 size={32} className="text-purple-400" /> : <VolumeX size={32} />}
      </button>

    </div>
  );
};

export default ZenMode;
