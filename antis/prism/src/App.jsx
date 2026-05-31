import React, { useState, useEffect, useCallback } from 'react';
import PrismHeader from './components/PrismHeader';
import PrismPulse from './components/PrismPulse';
import PrismLock from './components/PrismLock';
import SpectralDock from './components/SpectralDock';
import CrystallineCore from './components/CrystallineCore';
import SpectrumController from './components/SpectrumController';
import NeuralNotes from './components/NeuralNotes';
import SpectralTasks from './components/SpectralTasks';
import UtilityHub from './components/UtilityHub';
import AtmosphericParticles from './components/AtmosphericParticles';
import HolographicProfile from './components/HolographicProfile';
import SpectralTicker from './components/SpectralTicker';
import GithubPulse from './components/GithubPulse';
import DraggableWindow from './components/DraggableWindow';
import CommandPalette from './components/CommandPalette';
import WorldClock from './components/WorldClock';
import SpectralTerminal from './components/SpectralTerminal';
import SystemPulseMonitor from './components/SystemPulseMonitor';
import NebulaAudio from './components/NebulaAudio';
import QuantumMarket from './components/QuantumMarket';
import QuantumCalculator from './components/QuantumCalculator';
import EncryptedSignal from './components/EncryptedSignal';
import NebulaWeather from './components/NebulaWeather';
import SpectralCalendar from './components/SpectralCalendar';
import NeuralHabits from './components/NeuralHabits';
import HardwareXRay from './components/HardwareXRay';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Layout, RotateCcw, Settings, Terminal, Zap, Edit3, ListTodo, Activity, Monitor, Music, TrendingUp, Cpu, MessageCircle, CloudRain, Calendar, CheckCircle } from 'lucide-react';

const LightFlare = () => (
  <motion.div
    animate={{ x: ['-10%', '110%'], opacity: [0, 0.4, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '400px',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
      transform: 'skewX(-20deg)',
      zIndex: 10,
      pointerEvents: 'none'
    }}
  />
);

function App() {
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); 
  const [activeThemeId, setActiveThemeId] = useState('sunset');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [atmosphere, setAtmosphere] = useState('CLEAR');
  const [isGlitching, setIsGlitching] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);
  const [activeWidgets, setActiveWidgets] = useState({
      audio: true,
      market: true,
      calc: true,
      signal: true,
      weather: true,
      calendar: true,
      habits: true,
      xray: true
  });

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'MORNING_PHASE' : currentHour < 18 ? 'DAYLIGHT_PHASE' : 'EVENING_PHASE';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let timer;
    if (isFocusActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsFocusActive(false);
    }
    return () => clearInterval(timer);
  }, [isFocusActive, timeLeft]);

  const toggleFocus = () => {
    setIsFocusActive(!isFocusActive);
    if (!isFocusActive && timeLeft === 0) setTimeLeft(1500);
  };

  const handleFocusModeToggle = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => {
        setIsFocusMode(prev => !prev);
        setIsGlitching(false);
    }, 300);
  }, []);

  const resetLayout = () => {
      setLayoutKey(prev => prev + 1);
      setActiveWidgets({ audio: true, market: true, calc: true, signal: true, weather: true, calendar: true, habits: true, xray: true });
  };

  const toggleWidget = (id) => {
      setActiveWidgets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTerminalCommand = (type, value) => {
    if (type === 'theme') setActiveThemeId(value);
    if (type === 'focus') handleFocusModeToggle();
  };

  const commandActions = [
    { icon: <Zap size={18} />, label: 'TOGGLE_FOCUS_MODE', description: 'Enable distraction-free workspace', onSelect: handleFocusModeToggle },
    { icon: <RotateCcw size={18} />, label: 'RESET_WINDOW_LAYOUT', description: 'Snap all widgets back to grid', onSelect: resetLayout },
    { icon: <Terminal size={18} />, label: 'SYNC_ATMOSPHERE', description: 'Fetch latest real-world conditions', onSelect: () => setAtmosphere(prev => prev === 'CLEAR' ? 'ELECTRIC' : 'CLEAR') },
    { icon: <Music size={18} />, label: 'NEBULA_AUDIO_DRIVER', description: 'Toggle ambient focus sounds', onSelect: () => toggleWidget('audio') },
    { icon: <TrendingUp size={18} />, label: 'QUANTUM_MARKET_FLUX', description: 'Toggle market data stream', onSelect: () => toggleWidget('market') },
    { icon: <Cpu size={18} />, label: 'QUANTUM_LOGIC_PROCESSOR', description: 'Toggle holographic calculator', onSelect: () => toggleWidget('calc') },
    { icon: <MessageCircle size={18} />, label: 'ENCRYPTED_SIGNAL_NODE', description: 'Toggle secure comms terminal', onSelect: () => toggleWidget('signal') },
    { icon: <CloudRain size={18} />, label: 'NEBULA_WEATHER_SYNC', description: 'Toggle atmospheric forecast', onSelect: () => toggleWidget('weather') },
    { icon: <Calendar size={18} />, label: 'SPECTRAL_PLANNER', description: 'Toggle neural event calendar', onSelect: () => toggleWidget('calendar') },
    { icon: <CheckCircle size={18} />, label: 'NEURAL_HABIT_TRACKER', description: 'Toggle gamified daily goals', onSelect: () => toggleWidget('habits') },
    { icon: <Activity size={18} />, label: 'HARDWARE_XRAY_DIAGNOSTICS', description: 'Toggle system performance monitor', onSelect: () => toggleWidget('xray') },
    { icon: <Edit3 size={18} />, label: 'NEW_NEURAL_NOTE', description: 'Jump to scratchpad interface', onSelect: () => {} },
    { icon: <ListTodo size={18} />, label: 'ADD_SPECTRAL_TASK', description: 'Define a new focus objective', onSelect: () => {} }
  ];

  return (
    <div className={`App ${isGlitching ? 'hyper-shift-active' : ''}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <LightFlare />
        <AtmosphericParticles condition={atmosphere} />
        <SpectralTicker />
        <CommandPalette 
            isOpen={isCommandOpen} 
            onClose={() => setIsCommandOpen(false)} 
            actions={commandActions} 
        />
        
        <PrismHeader>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <WorldClock />
                <SpectrumController activeThemeId={activeThemeId} onThemeChange={setActiveThemeId} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-prism" onClick={() => setIsCommandOpen(true)} style={{ padding: '8px 12px' }}>
                        <Command size={14} />
                    </button>
                    <button className="btn-prism" onClick={resetLayout} style={{ padding: '8px 12px' }}>
                        <RotateCcw size={14} />
                    </button>
                    <button 
                        className="btn-prism"
                        onClick={handleFocusModeToggle}
                        style={{ 
                            fontSize: '0.65rem', padding: '8px 16px', borderRadius: '20px',
                            background: isFocusMode ? 'var(--s-primary)' : 'rgba(255,255,255,0.05)',
                            borderColor: isFocusMode ? 'var(--s-primary)' : 'var(--border-glass)',
                            color: isFocusMode ? 'white' : 'var(--text-main)'
                        }}
                    >
                        {isFocusMode ? 'EXIT_FOCUS' : 'ENTER_FOCUS'}
                    </button>
                </div>
            </div>
        </PrismHeader>

        <main 
            style={{ flex: 1, padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }} 
            className="custom-scrollbar"
        >
            <AnimatePresence mode="wait">
                {!isFocusMode && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}
                    >
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'white', letterSpacing: '2px' }}>
                                {greeting}.USER
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>SYSTEM_ROOT::ADVANCED_CMD_V5.0.1</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--s-glow)' }}>{new Date().toLocaleDateString()}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>CONTROL_PALETTE_READY [CMD+K]</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!isFocusMode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <PrismPulse />
                    </motion.div>
                )}
            </AnimatePresence>

            <div key={layoutKey} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', flex: 1, position: 'relative' }}>
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}
                        >
                            <HolographicProfile />
                            <DraggableWindow title="GITHUB_ACTIVITY_SYNC" id="gh">
                                <GithubPulse username="antigravity-ai" />
                            </DraggableWindow>
                            {activeWidgets.audio && (
                                <DraggableWindow title="NEBULA_AUDIO_CONTROLLER" id="audio">
                                    <NebulaAudio />
                                </DraggableWindow>
                            )}
                            {activeWidgets.signal && (
                                <DraggableWindow title="ENCRYPTED_SIGNAL_NODE" id="signal">
                                    <EncryptedSignal />
                                </DraggableWindow>
                            )}
                            {activeWidgets.weather && (
                                <DraggableWindow title="NEBULA_WEATHER_SYNC" id="weather">
                                    <NebulaWeather />
                                </DraggableWindow>
                            )}
                            {activeWidgets.xray && (
                                <DraggableWindow title="HARDWARE_XRAY_DIAGNOSTICS" id="xray">
                                    <HardwareXRay />
                                </DraggableWindow>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ flex: isFocusMode ? '1' : '1.5', display: 'flex', flexDirection: 'column', transition: 'all 0.5s ease', zIndex: 5 }}>
                    <CrystallineCore isActive={isFocusActive} timeLeft={timeLeft} onToggle={toggleFocus} />
                    <AnimatePresence>
                        {!isFocusMode && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: '30px' }}>
                                <DraggableWindow title="SYSTEM_TELEMETRY" id="pulse">
                                    <SystemPulseMonitor />
                                </DraggableWindow>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                            style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '30px' }}
                        >
                            <DraggableWindow title="SPECTRAL_TASK_SINK" id="tasks">
                                <SpectralTasks />
                            </DraggableWindow>
                            {activeWidgets.market && (
                                <DraggableWindow title="QUANTUM_MARKET_FLUX" id="market">
                                    <QuantumMarket />
                                </DraggableWindow>
                            )}
                            {activeWidgets.calc && (
                                <DraggableWindow title="QUANTUM_LOGIC_PROCESSOR" id="calc">
                                    <QuantumCalculator />
                                </DraggableWindow>
                            )}
                            {activeWidgets.calendar && (
                                <DraggableWindow title="SPECTRAL_PLANNER" id="calendar">
                                    <SpectralCalendar />
                                </DraggableWindow>
                            )}
                            {activeWidgets.habits && (
                                <DraggableWindow title="NEURAL_HABIT_TRACKER" id="habits">
                                    <NeuralHabits />
                                </DraggableWindow>
                            )}
                            <DraggableWindow title="NEURAL_SCRATCHPAD" id="notes">
                                <NeuralNotes />
                            </DraggableWindow>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {!isFocusMode && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        style={{ display: 'flex', gap: '30px', marginTop: '10px' }}
                    >
                         <DraggableWindow title="COMMAND_INTERFACE" id="terminal">
                            <SpectralTerminal onCommand={handleTerminalCommand} />
                        </DraggableWindow>
                        <DraggableWindow title="ATMOSPHERIC_DIAGNOSTICS" id="utility">
                            <UtilityHub condition={atmosphere} setCondition={setAtmosphere} />
                        </DraggableWindow>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'center', opacity: isFocusMode ? 0.3 : 1, transition: 'opacity 0.5s', paddingBottom: '30px' }}>
                <SpectralDock activeWidgets={activeWidgets} onToggleWidget={toggleWidget} />
                {!isFocusMode && (
                    <div style={{ position: 'absolute', right: '40px', bottom: '40px' }}>
                         <PrismLock />
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}

export default App;
