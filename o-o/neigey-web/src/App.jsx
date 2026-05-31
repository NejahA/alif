import React, { useState, useEffect, useRef } from 'react';
import { 
  Bolt, LayoutDashboard, Timer, FileText, Terminal, 
  Plus, Trash2, Play, Pause, RefreshCcw, ExternalLink,
  Cpu, Network, Code, Search, Copy, Check, Cloud, Sun,
  DollarSign, Euro, ArrowRightLeft, Activity, Globe,
  Shield, TrendingUp, ChevronRight, Zap, Boxes, 
  Palette, ListTodo, MoreVertical, Star, Settings, Moon,
  Snowflake, BookOpen, Lock, Key, Eye, UserCheck, AlertTriangle,
  Fingerprint, HardDrive, Binary, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoJS from 'crypto-js';

const API_URL = "http://localhost:5000/api";

const App = () => {
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState('dashboard');
  const [theme, setTheme] = useState('cyber');
  const [pomodoro, setPomodoro] = useState({ seconds: 1500, isRunning: false });
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [toolbox, setToolbox] = useState({ input: '', output: '', copyStatus: false });
  const [network, setNetwork] = useState({ ip: 'FETCHING...', news: [], dnsInput: '', dnsResult: '', dnsLoading: false });
  const [terminal, setTerminal] = useState([
    { type: 'sys', msg: 'SYSTEM_BOOT_SEQUENCE_COMPLETE' },
    { type: 'net', msg: 'NEJAHA_NETWORK_ESTABLISHED' },
    { type: 'sys', msg: 'CONNECTED_TO_MONGODB' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef(null);

  // New: Task Board State
  const [tasks, setTasks] = useState([]);

  // Market Data
  const [market] = useState([
    { name: 'BTC', price: '$94,321', change: '+2.4%', up: true },
    { name: 'ETH', price: '$2,845', change: '-1.2%', up: false },
    { name: 'SOL', price: '$142', change: '+5.8%', up: true },
  ]);

  // Health Monitoring
  const [health, setHealth] = useState({ cpu: 12, ram: 45, disk: 78 });
  const [currency, setCurrency] = useState({ amount: 1, from: 'USD', to: 'EUR', result: 0.94 });
  const [weather] = useState({ temp: 24, city: 'Casablanca', condition: 'Sunny' });

  // Code Snippets
  const [snippets, setSnippets] = useState([]);
  const [portfolio, setPortfolio] = useState({ name: '...', role: '...', skills: [], projects: [] });

  // Cyber Suite State
  const [cyberTool, setCyberTool] = useState({ 
    hashInput: '', 
    hashOutput: '', 
    algo: 'SHA256',
    scanTarget: '',
    scanResult: [],
    isScanning: false,    
    passInput: '',
    passStrength: { score: 0, label: 'NONE', color: 'slate-500' },
    subnetIP: '',
    subnetCIDR: '/24',
    subnetResult: null
  });

  const [courseProgress, setCourseProgress] = useState({
    'CIA_TRIAD': true,
    'ATTACK_VECTORS': false,
    'NETWORK_SECURITY': false,
    'CRYPTOGRAPHY': false,
    'WEB_APP_SEC': false,
    'CLOUD_SEC': false,
    'ETHICAL_HACKING': false,
    'REGEX_MASTERY': false
  });
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch from MongoDB
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [notesRes, tasksRes, snippetsRes, portRes] = await Promise.all([
          fetch(`${API_URL}/notes`).then(r => r.json()),
          fetch(`${API_URL}/tasks`).then(r => r.json()),
          fetch(`${API_URL}/snippets`).then(r => r.json()),
          fetch(`${API_URL}/portfolio`).then(r => r.json())
        ]);
        setNotes(notesRes);
        setTasks(tasksRes);
        setSnippets(snippetsRes);
        setPortfolio(portRes);
        addLog('MONGODB_DATA_LOADED', 'sys');
      } catch (e) {
        addLog('MONGODB_SYNC_ERROR', 'err');
      }
    };
    fetchAllData();
  }, []);

  // Health Stats Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth({
        cpu: Math.floor(Math.random() * 40) + 5,
        ram: Math.floor(Math.random() * 20) + 40,
        disk: 78
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Terminal Auto-Scroll
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminal]);

  // Pomodoro
  useEffect(() => {
    let timer;
    if (pomodoro.isRunning && pomodoro.seconds > 0) {
      timer = setInterval(() => setPomodoro(p => ({ ...p, seconds: p.seconds - 1 })), 1000);
    } else if (pomodoro.seconds === 0) {
      setPomodoro(p => ({ ...p, isRunning: false }));
      addLog('POMODORO_SESSION_COMPLETE', 'sys');
    }
    return () => clearInterval(timer);
  }, [pomodoro.isRunning, pomodoro.seconds]);

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        
        const newsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = (await newsRes.json()).slice(0, 5);
        const newsItems = await Promise.all(ids.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())));
        
        setNetwork(n => ({ ...n, ip: ipData.ip, news: newsItems }));
        addLog('TECH_RADAR_SYNCED', 'net');
      } catch (e) { 
        console.error(e);
        addLog('NETWORK_SYNC_ERROR', 'err');
      }
    };
    fetchData();
  }, []);

  const addNote = async () => {
    if (!noteInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noteInput })
      });
      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      setNoteInput('');
      addLog('NEW_NOTE_SAVED_TO_MONGO', 'sys');
    } catch (e) {
      addLog('MONGO_SAVE_ERROR', 'err');
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n._id !== id));
      addLog('NOTE_DELETED_FROM_MONGO', 'sys');
    } catch (e) {
      addLog('MONGO_DELETE_ERROR', 'err');
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(t => t._id === id ? { ...t, ...updatedTask } : t));
      addLog('TASK_UPDATED_IN_MONGO', 'sys');
    } catch (e) {
      addLog('MONGO_TASK_UPDATE_ERROR', 'err');
    }
  };

  const toggleTaskTimer = (id) => {
    setTasks(tasks.map(t => {
      if (t._id === id) {
        const isRunning = !t.isTimerRunning;
        addLog(`TASK_TIMER_${isRunning ? 'STARTED' : 'STOPPED'}: ${t.text.toUpperCase()}`, 'sys');
        return { ...t, isTimerRunning: isRunning };
      }
      return t;
    }));
  };

  // Global Task Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(t => {
        if (t.isTimerRunning) {
          return { ...t, timeSpent: (t.timeSpent || 0) + 1 };
        }
        return t;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTask = async (text, priority) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, priority, status: 'todo', timeSpent: 0 })
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      addLog('NEW_TASK_SAVED_TO_MONGO', 'sys');
    } catch (e) {
      addLog('MONGO_TASK_SAVE_ERROR', 'err');
    }
  };

  const addSnippet = async () => {
    const name = prompt("Snippet Name:");
    const code = prompt("Snippet Code:");
    if (!name || !code) return;
    try {
      const res = await fetch(`${API_URL}/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code })
      });
      const newSnippet = await res.json();
      setSnippets([newSnippet, ...snippets]);
      addLog('NEW_SNIPPET_SAVED_TO_MONGO', 'sys');
    } catch (e) {
      addLog('MONGO_SNIPPET_SAVE_ERROR', 'err');
    }
  };

  const deleteSnippet = async (id) => {
    try {
      await fetch(`${API_URL}/snippets/${id}`, { method: 'DELETE' });
      setSnippets(snippets.filter(s => s._id !== id));
      addLog('SNIPPET_DELETED_FROM_MONGO', 'sys');
    } catch (e) {
      addLog('MONGO_SNIPPET_DELETE_ERROR', 'err');
    }
  };

  const addLog = (msg, type) => {
    setTerminal(t => [...t.slice(-10), { type, msg }]);
  };

  // --- Cyber Security Tools Logic ---
  const generateHash = () => {
    if (!cyberTool.hashInput) return;
    let hash = '';
    const input = cyberTool.hashInput;
    switch(cyberTool.algo) {
      case 'MD5': hash = CryptoJS.MD5(input).toString(); break;
      case 'SHA1': hash = CryptoJS.SHA1(input).toString(); break;
      case 'SHA256': hash = CryptoJS.SHA256(input).toString(); break;
      case 'SHA512': hash = CryptoJS.SHA512(input).toString(); break;
      default: hash = CryptoJS.SHA256(input).toString();
    }
    setCyberTool(prev => ({ ...prev, hashOutput: hash }));
    addLog(`HASH_GEN_${cyberTool.algo}_COMPLETE`, 'sys');
  };

  const simulatePortScan = async () => {
    if (!cyberTool.scanTarget) return;
    setCyberTool(prev => ({ ...prev, isScanning: true, scanResult: [] }));
    addLog(`SCAN_INIT: ${cyberTool.scanTarget.toUpperCase()}`, 'net');
    
    const commonPorts = [21, 22, 23, 25, 53, 80, 443, 3306, 8080];
    const results = [];
    
    for (const port of commonPorts) {
      await new Promise(r => setTimeout(r, 400));
      const status = Math.random() > 0.7 ? 'OPEN' : 'CLOSED';
      results.push({ port, status });
      setCyberTool(prev => ({ ...prev, scanResult: [...results] }));
    }
    
    setCyberTool(prev => ({ ...prev, isScanning: false }));
    addLog(`SCAN_COMPLETE: ${cyberTool.scanTarget.toUpperCase()}`, 'sys');
  };

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    let label = 'WEAK';
    let color = 'rose-400';
    if (score === 4) { label = 'ELITE'; color = 'emerald-400'; }
    else if (score >= 2) { label = 'SECURE'; color = 'amber-400'; }
    
    setCyberTool(prev => ({ ...prev, passInput: pass, passStrength: { score, label, color } }));
  };

  const calculateSubnet = () => {
    const ip = cyberTool.subnetIP || '192.168.1.0';
    const cidr = parseInt(cyberTool.subnetCIDR.replace('/', ''));
    const hosts = Math.pow(2, 32 - cidr) - 2;
    const mask = Array(4).fill(0).map((_, i) => {
      const bits = Math.min(Math.max(cidr - i * 8, 0), 8);
      return 256 - Math.pow(2, 8 - bits);
    }).join('.');
    
    setCyberTool(prev => ({ ...prev, subnetResult: { mask, hosts } }));
    addLog('SUBNET_CALCULATION_COMPLETE', 'sys');
  };

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const cmd = terminalInput.trim().toLowerCase();
      setTerminalInput('');
      addLog(`> ${cmd.toUpperCase()}`, 'sys');
      
      if (cmd === 'clear') {
        setTerminal([]);
      } else if (cmd === 'help') {
        addLog('AVAIL_CMD: CLEAR, HELP, STATS, TIME, ECHO, RELOAD, SPEAK', 'net');
      } else if (cmd === 'stats') {
        addLog(`CPU: ${health.cpu}% | RAM: ${health.ram}% | DISK: ${health.disk}%`, 'net');
      } else if (cmd === 'time') {
        addLog(`CURRENT_OS_TIME: ${now.toLocaleTimeString()}`, 'net');
      } else if (cmd.startsWith('echo ')) {
        addLog(`OUT: ${cmd.slice(5).toUpperCase()}`, 'net');
      } else if (cmd === 'speak') {
        const lastMsg = terminal[terminal.length - 1]?.msg;
        if (lastMsg) {
          const utterance = new SpeechSynthesisUtterance(lastMsg);
          window.speechSynthesis.speak(utterance);
          addLog('VOICE_SYNTH_ACTIVE: READING_LAST_BUFFER', 'sys');
        }
      } else if (cmd === 'reload') {
        window.location.reload();
      } else {
        addLog(`CMD_ERR: ${cmd.toUpperCase()} NOT FOUND`, 'err');
      }
    }
  };

  const b64Encode = () => {
    setToolbox(t => ({ ...t, output: btoa(t.input) }));
    addLog('B64_ENCODE_COMPLETE', 'sys');
  };
  const b64Decode = () => {
    try { 
      setToolbox(t => ({ ...t, output: atob(t.input) })); 
      addLog('B64_DECODE_COMPLETE', 'sys');
    } catch { 
      setToolbox(t => ({ ...t, output: 'INVALID BASE64' })); 
      addLog('B64_DECODE_ERROR', 'err');
    }
  };
  const copyOutput = () => {
    navigator.clipboard.writeText(toolbox.output);
    setToolbox(t => ({ ...t, copyStatus: true }));
    setTimeout(() => setToolbox(t => ({ ...t, copyStatus: false })), 2000);
    addLog('OUTPUT_COPIED_TO_CLIPBOARD', 'sys');
  };

  const convertCurrency = () => {
    const rate = currency.from === 'USD' ? 0.94 : 1.06;
    setCurrency(c => ({ ...c, result: (c.amount * rate).toFixed(2) }));
    addLog('CURRENCY_CONVERSION_DONE', 'sys');
  };

  const lookupDns = async () => {
    if (!network.dnsInput) return;
    setNetwork(n => ({ ...n, dnsLoading: true, dnsResult: 'LOOKING UP...' }));
    addLog(`DNS_LOOKUP: ${network.dnsInput}`, 'net');
    try {
      const res = await fetch(`https://dns.google/resolve?name=${network.dnsInput}`);
      const data = await res.json();
      const result = data.Answer?.map(a => a.data).join('\n') || 'NO RECORDS';
      setNetwork(n => ({ ...n, dnsResult: result, dnsLoading: false }));
    } catch {
      setNetwork(n => ({ ...n, dnsResult: 'ERROR', dnsLoading: false }));
      addLog('DNS_RESOLVE_FAILED', 'err');
    }
  };

  const themes = {
    cyber: 'neigey-primary',
    midnight: 'indigo-500',
    emerald: 'emerald-400',
    amber: 'amber-400'
  };

  return (
    <div className={`flex h-screen bg-[#020617] text-slate-200 font-inter overflow-hidden relative bg-grid-pattern selection:bg-${themes[theme]}/30`}>
      {/* Decorative Particles */}
      <div className={`absolute top-20 left-1/4 w-1 h-1 bg-${themes[theme]} rounded-full animate-ping opacity-20`} />
      <div className={`absolute bottom-40 right-1/3 w-1 h-1 bg-neigey-secondary rounded-full animate-ping opacity-20 delay-700`} />
      
      {/* Sidebar */}
      <aside className="w-24 bg-slate-900/40 backdrop-blur-3xl flex flex-col items-center py-12 border-r border-white/5 relative z-20">
        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
          <Snowflake className={`text-slate-300 w-10 h-10 mb-20 animate-pulse-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} />
        </motion.div>
        <div className="flex flex-col gap-12 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'timer', icon: Timer },
            { id: 'notes', icon: FileText },
            { id: 'board', icon: ListTodo },
            { id: 'snippets', icon: Code },
            { id: 'cyber', icon: Shield },
            { id: 'course', icon: BookOpen },
            { id: 'portfolio', icon: Star },
            { id: 'toolbox', icon: Terminal }
          ].map(({ id, icon: Icon }) => (
            <motion.div 
              key={id}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setView(id)}
              className={`p-4 rounded-[1.5rem] cursor-pointer transition-all duration-500 relative group ${view === id ? `bg-white/5 text-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10` : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <Icon size={28} />
              {view === id && <motion.div layoutId="activeTab" className={`absolute -left-12 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-300 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]`} />}
            </motion.div>
          ))}
        </div>
        <div className="relative group cursor-pointer mb-8">
           <Palette className="text-slate-500 hover:text-white" size={24} />
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 border border-white/5 p-2 rounded-2xl hidden group-hover:flex flex-col gap-2 shadow-2xl backdrop-blur-xl">
             {Object.keys(themes).map(t => (
               <div key={t} onClick={() => setTheme(t)} className={`w-6 h-6 rounded-full bg-${themes[t]} cursor-pointer border-2 ${theme === t ? 'border-white' : 'border-transparent'}`} />
             ))}
           </div>
        </div>
        <div className="relative group cursor-pointer">
          <div className={`w-12 h-12 bg-gradient-to-tr from-slate-400 to-slate-200 rounded-[1.5rem] flex items-center justify-center text-sm font-black text-slate-900 shadow-2xl group-hover:scale-110 transition-all duration-500`}>N</div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#020617]" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-16 custom-scrollbar relative z-10">
        {/* Header */}
        <header className="flex justify-between items-start mb-16 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black tracking-tight text-white neon-text uppercase tracking-tighter">NEJAHA_OS</h1>
              <span className={`bg-${themes[theme]}/10 text-${themes[theme]} text-[10px] font-black px-3 py-1 rounded-full border border-${themes[theme]}/20 tracking-widest`}>CORE_BUILD_V2.0.4</span>
            </div>
            <p className="text-slate-500 flex items-center gap-3 font-semibold text-sm">
              <span className="uppercase tracking-widest">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
              <span className={`flex items-center gap-2 text-${themes[theme]}/60 bg-${themes[theme]}/5 px-3 py-1 rounded-lg`}>
                <Sun size={14} className="animate-spin-slow" /> {weather.temp}°C {weather.city}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`bg-slate-900/60 backdrop-blur-2xl px-10 py-5 rounded-[2.5rem] font-mono text-4xl font-black text-${themes[theme]} border border-white/5 shadow-2xl tracking-tighter neon-border`}>
              {now.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="flex gap-4 pr-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${themes[theme]} animate-pulse`} />
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Kernel Active</span>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="grid grid-cols-1 xl:grid-cols-4 gap-10"
            >
              <div className="xl:col-span-3 space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'CPU', val: health.cpu, color: themes[theme], icon: Activity },
                    { label: 'RAM', val: health.ram, color: '#818CF8', icon: Cpu },
                    { label: 'DISK', val: health.disk, color: '#34D399', icon: Shield },
                    { label: 'NETWORK', val: 98, color: '#FBBF24', icon: Globe },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card p-6 rounded-[2.5rem] group hover:neon-border transition-all duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-2xl bg-white/5 text-slate-300 group-hover:text-white transition-colors">
                          <stat.icon size={20} />
                        </div>
                        <TrendingUp size={16} className="text-slate-800 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] relative z-10">{stat.label} LOAD</span>
                      <div className="text-3xl font-black font-mono mt-1 text-white relative z-10">{stat.val}%</div>
                      <div className="w-full bg-slate-950/50 h-2 rounded-full mt-4 overflow-hidden relative z-10 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{ backgroundColor: stat.color, boxShadow: `0 0 15px ${stat.color}80` }}
                          className="h-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Rows */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Focus Card */}
                  <section className={`relative overflow-hidden group bg-gradient-to-br from-${themes[theme]} to-neigey-secondary p-10 rounded-[3rem] shadow-2xl shadow-black/20 border border-white/10 transition-all duration-500 hover:scale-[1.01]`}>
                    <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <Timer size={200} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <Zap size={16} className="text-white/60" />
                        <span className="text-white/60 text-xs font-black tracking-[0.3em] uppercase">Temporal Protocol</span>
                      </div>
                      <div className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
                        {Math.floor(pomodoro.seconds / 60).toString().padStart(2, '0')}:
                        {(pomodoro.seconds % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setPomodoro(p => ({ ...p, isRunning: !p.isRunning }))}
                          className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all shadow-2xl shadow-black/20"
                        >
                          {pomodoro.isRunning ? 'Pause' : 'Start Protocol'}
                        </button>
                        <button 
                          onClick={() => setPomodoro({ seconds: 1500, isRunning: false })}
                          className="bg-black/20 hover:bg-black/30 p-4 rounded-2xl backdrop-blur-md transition-all border border-white/5"
                        >
                          <RefreshCcw size={24} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Market Tracker */}
                  <section className="glass-card p-10 rounded-[3rem] group">
                    <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 mb-8 uppercase flex items-center gap-3">
                      <Boxes size={18} className={`text-${themes[theme]}`} /> Asset Streams
                    </h3>
                    <div className="space-y-5">
                      {market.map((coin) => (
                        <div key={coin.name} className="flex items-center justify-between p-5 rounded-3xl bg-slate-950/30 border border-white/5 group/coin hover:border-white/10 hover:bg-slate-950/50 transition-all duration-500">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xs text-${themes[theme]} border border-white/5 group-hover/coin:scale-110 transition-transform`}>{coin.name}</div>
                            <div>
                              <p className="text-sm font-black text-white">{coin.name}/USDT</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Binance_Cloud</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-mono font-black text-white">{coin.price}</p>
                            <div className={`flex items-center justify-end gap-1 text-[10px] font-black ${coin.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {coin.up ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                              {coin.change}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* System Diagnostics (New) */}
                <section className="glass-card p-10 rounded-[3rem] group overflow-hidden relative">
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase flex items-center gap-3">
                      <Activity size={18} className={`text-${themes[theme]}`} /> Diagnostics_Matrix
                    </h3>
                    <div className="flex gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-black text-slate-600 uppercase">Live_Telemetry</span>
                    </div>
                  </div>
                  <div className="h-48 flex items-end gap-3 relative z-10">
                    {[40, 70, 45, 90, 65, 80, 30, 50, 85, 60, 75, 45].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className={`flex-1 bg-${themes[theme]}/20 rounded-t-lg border-t border-${themes[theme]}/40 relative group/bar hover:bg-${themes[theme]}/40 transition-all`}
                      >
                        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-${themes[theme]} opacity-0 group-hover/bar:opacity-100 transition-opacity`}>{h}%</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-50 pointer-events-none" />
                </section>

                {/* System Terminal */}
                <section className="bg-slate-950/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative scanline-effect group">
                  <div className="bg-white/5 px-8 py-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500/20" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/20" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Terminal size={12} className="text-slate-600" />
                      <span className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase">Kernel_Core_Output</span>
                    </div>
                  </div>
                  <div 
                    ref={terminalRef}
                    className="p-8 h-48 overflow-y-auto font-mono text-xs space-y-2.5 custom-scrollbar"
                  >
                    {terminal.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="flex gap-4 group"
                      >
                        <span className={`text-[10px] font-black tracking-widest min-w-[60px] ${log.type === 'err' ? 'text-rose-400' : log.type === 'net' ? `text-slate-300` : 'text-emerald-400'}`}>[{log.type.toUpperCase()}]</span>
                        <span className="text-slate-500 group-hover:text-slate-200 transition-colors tracking-tight">{log.msg}</span>
                      </motion.div>
                    ))}
                    <div className="flex gap-4 items-center pt-2">
                      <span className="text-[10px] font-black text-emerald-400 tracking-widest min-w-[60px]">[USER@NEJAHA]</span>
                      <input 
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={handleTerminalCommand}
                        placeholder="Type command... (help)"
                        className="bg-transparent border-none outline-none text-slate-300 flex-1 placeholder:text-slate-800"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar Right */}
              <div className="space-y-10">
                {/* Task Board Mini */}
                <section className="glass-card p-10 rounded-[3rem] h-fit">
                  <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 mb-8 uppercase flex items-center justify-between">
                    <span>Task Board</span>
                    <ListTodo size={18} className={`text-${themes[theme]}`} />
                  </h3>
                  <div className="space-y-4">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                         <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'progress' ? `bg-${themes[theme]}` : 'bg-slate-700'}`} />
                         <span className={`text-xs font-bold ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task.text}</span>
                      </div>
                    ))}
                    <button onClick={() => setView('board')} className="w-full py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest mt-2">Manage Board</button>
                  </div>
                </section>

                {/* Tech Feed */}
                <section className="glass-card p-10 rounded-[3rem] h-fit">
                  <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 mb-8 uppercase flex items-center justify-between">
                    <span>Tech Radar</span>
                    <Globe size={18} className={`text-${themes[theme]} animate-spin-slow opacity-50`} />
                  </h3>
                  <div className="space-y-6">
                    {network.news.map((item, i) => (
                      <motion.a 
                        whileHover={{ x: 5 }}
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`group block relative pl-4 border-l-2 border-white/5 hover:border-${themes[theme]}/40 transition-all duration-300`}
                      >
                        <p className="text-sm text-slate-500 group-hover:text-white transition-all font-bold line-clamp-2 leading-relaxed">{item.title}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] text-slate-700 font-black tracking-widest uppercase">Node_{i}</span>
                          <ChevronRight size={12} className={`text-slate-800 group-hover:text-${themes[theme]} transition-all`} />
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {/* New: Full Task Board View */}
          {view === 'board' && (
             <motion.div 
               key="board"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 md:grid-cols-3 gap-10"
             >
                {['todo', 'progress', 'done'].map(status => (
                  <section key={status} className="glass-card p-10 rounded-[3.5rem] flex flex-col h-full min-h-[600px]">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-sm font-black tracking-[0.3em] text-slate-500 uppercase">{status}_Stream</h3>
                      <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-slate-600">{tasks.filter(t => t.status === status).length}</span>
                    </div>
                    <div className="space-y-6 flex-1">
                      {tasks.filter(t => t.status === status).map(task => (
                        <motion.div 
                          layoutId={task._id}
                          key={task._id}
                          className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group hover:neon-border transition-all duration-500"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${task.priority === 'high' ? 'text-rose-400 border-rose-400/20' : task.priority === 'medium' ? 'text-amber-400 border-amber-400/20' : 'text-emerald-400 border-emerald-400/20'}`}>{task.priority.toUpperCase()}</span>
                            <button onClick={() => {
                               fetch(`${API_URL}/tasks/${task._id}`, { method: 'DELETE' });
                               setTasks(tasks.filter(t => t._id !== task._id));
                               addLog('TASK_DELETED_FROM_MONGO', 'sys');
                            }}>
                              <Trash2 size={14} className="text-slate-700 hover:text-rose-400 transition-colors" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-slate-300 leading-relaxed mb-6">{task.text}</p>
                          <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Time_Spent</span>
                               <span className="text-xs font-mono font-black text-slate-300">{formatTime(task.timeSpent || 0)}</span>
                             </div>
                             <button 
                               onClick={() => toggleTaskTimer(task._id)}
                               className={`p-3 rounded-xl transition-all ${task.isTimerRunning ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'} hover:scale-110`}
                             >
                               {task.isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                             </button>
                          </div>
                          <div className="flex gap-2">
                             {status !== 'todo' && <button onClick={() => updateTask(task._id, { status: status === 'done' ? 'progress' : 'todo' })} className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"><ChevronRight size={14} className="rotate-180" /></button>}
                             {status !== 'done' && <button onClick={() => updateTask(task._id, { status: status === 'todo' ? 'progress' : 'done' })} className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all ml-auto"><ChevronRight size={14} /></button>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const text = prompt("Enter intelligence task:");
                        if (text) addTask(text, 'medium');
                      }}
                      className="w-full py-5 rounded-[1.5rem] border border-dashed border-white/10 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-white/20 hover:text-slate-400 transition-all mt-8"
                    >
                      + Add Intelligence
                    </button>
                  </section>
                ))}
             </motion.div>
          )}

          {view === 'cyber' && (
            <motion.div 
              key="cyber"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-6xl font-black text-white neon-text uppercase tracking-tighter">Cyber_Suite</h2>
                  <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-2">Active_Shield: Online | Node_Integrity: 98%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Hash Generator */}
                <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                     <Fingerprint size={120} />
                   </div>
                   <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 mb-10 uppercase flex items-center gap-3">
                     <Binary size={20} className="text-emerald-400" /> Hash_Gen_Engine
                   </h3>
                   <div className="space-y-6 relative z-10">
                     <div className="flex gap-4">
                       <select 
                         value={cyberTool.algo}
                         onChange={(e) => setCyberTool({ ...cyberTool, algo: e.target.value })}
                         className="bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black text-slate-400 outline-none"
                       >
                         {['MD5', 'SHA1', 'SHA256', 'SHA512'].map(a => <option key={a}>{a}</option>)}
                       </select>
                       <input 
                         type="text" 
                         value={cyberTool.hashInput}
                         onChange={(e) => setCyberTool({ ...cyberTool, hashInput: e.target.value })}
                         placeholder="Input plain-text payload..."
                         className="flex-1 bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-400/20"
                       />
                     </div>
                     <button 
                       onClick={generateHash}
                       className="w-full py-5 rounded-[1.5rem] bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-emerald-400/20"
                     >
                       Compute_Hash_Sequence
                     </button>
                     {cyberTool.hashOutput && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-[2rem] bg-slate-950/80 border border-emerald-400/20 font-mono text-[10px] text-emerald-400 break-all relative group/hash">
                         {cyberTool.hashOutput}
                         <button 
                            onClick={() => {
                              navigator.clipboard.writeText(cyberTool.hashOutput);
                              addLog('HASH_COPIED', 'sys');
                            }}
                            className="absolute top-2 right-2 p-2 opacity-0 group-hover/hash:opacity-100 transition-opacity text-slate-500 hover:text-white"
                         >
                           <Copy size={14} />
                         </button>
                       </motion.div>
                     )}
                   </div>
                </section>

                {/* Port Scanner */}
                <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                     <Activity size={120} />
                   </div>
                   <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 mb-10 uppercase flex items-center gap-3">
                     <Network size={20} className="text-rose-400" /> Port_Scanner_Probe
                   </h3>
                   <div className="space-y-6 relative z-10">
                     <div className="flex gap-4">
                       <input 
                         type="text" 
                         value={cyberTool.scanTarget}
                         onChange={(e) => setCyberTool({ ...cyberTool, scanTarget: e.target.value })}
                         placeholder="Target IP / Host..."
                         className="flex-1 bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-4 text-sm font-bold outline-none focus:ring-2 ring-rose-400/20"
                       />
                       <button 
                         onClick={simulatePortScan}
                         disabled={cyberTool.isScanning}
                         className="bg-rose-500/10 text-rose-400 px-8 rounded-2xl border border-rose-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                       >
                         {cyberTool.isScanning ? 'SCANNING...' : 'SCAN'}
                       </button>
                     </div>
                     <div className="h-48 bg-slate-950/40 rounded-[2rem] border border-white/5 p-6 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2">
                        {cyberTool.scanResult.length === 0 && <div className="text-slate-800 italic">No probe data active...</div>}
                        {cyberTool.scanResult.map((res, i) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                            <span className="text-slate-400">PORT: {res.port}</span>
                            <span className={res.status === 'OPEN' ? 'text-emerald-400' : 'text-rose-400'}>[{res.status}]</span>
                          </div>
                        ))}
                     </div>
                   </div>
                </section>

                {/* Secure Vault Info */}
                <section className="glass-card p-12 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10">
                   <div className="flex items-center gap-6 mb-8">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><Database size={32} /></div>
                     <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Vulnerability_Index</h3>
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">CVE_CORE_DATABASE_V1.2</p>
                     </div>
                   </div>
                   <div className="space-y-4">
                     {[
                       { id: 'CVE-2024-1234', risk: 'CRITICAL', score: 9.8 },
                       { id: 'CVE-2024-5678', risk: 'HIGH', score: 7.5 },
                       { id: 'CVE-2023-9999', risk: 'MEDIUM', score: 5.4 }
                     ].map(cve => (
                       <div key={cve.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/40 border border-white/5">
                         <div className="flex flex-col">
                           <span className="text-xs font-black text-white">{cve.id}</span>
                           <span className="text-[8px] font-black text-slate-700 tracking-[0.2em] mt-1">RISK_NODE: {cve.risk}</span>
                         </div>
                         <div className={`text-lg font-mono font-black ${cve.score > 9 ? 'text-rose-400' : cve.score > 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                           {cve.score}
                         </div>
                       </div>
                     ))}
                   </div>
                </section>

                {/* Subnet Calculator Mini */}
                <section className="glass-card p-12 rounded-[3.5rem] bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
                   <div className="flex items-center gap-6 mb-8">
                     <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400"><Binary size={32} /></div>
                     <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Subnet_Calc</h3>
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Network_Addressing_Protocol</p>
                     </div>
                   </div>
                   <div className="space-y-6">
                      <div className="flex gap-4">
                        <input 
                          placeholder="192.168.1.0" 
                          value={cyberTool.subnetIP}
                          onChange={(e) => setCyberTool({ ...cyberTool, subnetIP: e.target.value })}
                          className="flex-1 bg-slate-950/40 border border-white/5 rounded-xl px-6 py-3 text-xs outline-none text-white" 
                        />
                        <select 
                          value={cyberTool.subnetCIDR}
                          onChange={(e) => setCyberTool({ ...cyberTool, subnetCIDR: e.target.value })}
                          className="w-24 bg-slate-950/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-slate-400"
                        >
                          {['/8', '/16', '/24', '/25', '/26', '/27', '/28', '/29', '/30'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <button 
                        onClick={calculateSubnet}
                        className="w-full py-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all"
                      >
                        Calculate_Map
                      </button>
                      {cyberTool.subnetResult && (
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                             <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest block mb-1">Mask</span>
                             <span className="text-xs font-mono text-amber-400">{cyberTool.subnetResult.mask}</span>
                           </div>
                           <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                             <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest block mb-1">Hosts</span>
                             <span className="text-xs font-mono text-amber-400">{cyberTool.subnetResult.hosts} Nodes</span>
                           </div>
                        </div>
                      )}
                   </div>
                </section>

                {/* Password Strength Checker */}
                <section className="glass-card p-12 rounded-[3.5rem] bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
                   <div className="flex items-center gap-6 mb-8">
                     <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400"><Lock size={32} /></div>
                     <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Pass_Armor</h3>
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Entropy_Analysis_Engine</p>
                     </div>
                   </div>
                   <div className="space-y-6">
                      <input 
                        type="password"
                        placeholder="Analyze password strength..."
                        onChange={(e) => checkPasswordStrength(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-4 text-sm font-bold outline-none focus:ring-2 ring-purple-400/20 text-white"
                      />
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Security_Level</span>
                            <span className={`text-${cyberTool.passStrength.color}`}>{cyberTool.passStrength.label}</span>
                         </div>
                         <div className="h-2 bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              animate={{ width: `${(cyberTool.passStrength.score / 4) * 100}%` }}
                              className={`h-full bg-${cyberTool.passStrength.color}`}
                            />
                         </div>
                      </div>
                   </div>
                </section>
              </div>
            </motion.div>
          )}

          {view === 'course' && (
            <motion.div 
              key="course"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-12"
            >
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-6xl font-black text-white neon-text uppercase tracking-tighter">Cyber_Academy_Pro</h2>
                  <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-2">Level: Elite_Initiate | Path: Full_Stack_Security_Engineer</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-2xl border border-emerald-400/20 text-[10px] font-black tracking-widest uppercase">MASTER_CLASS_ACCESS</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Course Navigation */}
                <nav className="lg:col-span-1 space-y-4">
                  {[
                    { id: 'CIA_TRIAD', title: '01. The CIA Triad', icon: Shield, locked: false },
                    { id: 'ATTACK_VECTORS', title: '02. Attack Vectors', icon: AlertTriangle, locked: false },
                    { id: 'NETWORK_SECURITY', title: '03. Network Defense', icon: Network, locked: false },
                    { id: 'CRYPTOGRAPHY', title: '04. Cryptography', icon: Key, locked: false },
                    { id: 'WEB_APP_SEC', title: '05. Web App Sec', icon: Globe, locked: false },
                    { id: 'CLOUD_SEC', title: '06. Cloud Security', icon: Cloud, locked: false },
                    { id: 'ETHICAL_HACKING', title: '07. Ethical Hacking', icon: Terminal, locked: false },
                    { id: 'REGEX_MASTERY', title: '08. Regex Mastery', icon: Code, locked: false },
                  ].map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson.id)}
                      className={`w-full p-6 rounded-[2rem] flex items-center gap-4 border transition-all duration-300 ${
                        selectedLesson === lesson.id 
                        ? `bg-${themes[theme]}/10 border-${themes[theme]}/40 text-white shadow-lg` 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                      }`}
                    >
                      <lesson.icon size={20} className={selectedLesson === lesson.id ? `text-${themes[theme]}` : ''} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-left">{lesson.title}</span>
                      {courseProgress[lesson.id] && <Check size={14} className="ml-auto text-emerald-400" />}
                    </button>
                  ))}
                </nav>

                {/* Lesson Content Area */}
                <section className="lg:col-span-3 space-y-10">
                  {!selectedLesson ? (
                    <div className="glass-card p-20 rounded-[4rem] text-center space-y-8 flex flex-col items-center justify-center min-h-[600px]">
                      <div className={`w-32 h-32 rounded-[3rem] bg-${themes[theme]}/10 flex items-center justify-center text-${themes[theme]} mb-8`}>
                        <BookOpen size={64} />
                      </div>
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Initialize_Learning_Sequence</h3>
                      <p className="text-slate-500 max-w-md mx-auto font-medium">Select a module from the data-stream on the left to begin your cyber security indoctrination.</p>
                    </div>
                  ) : (
                    <motion.div
                      key={selectedLesson}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-10"
                    >
                      {/* Lesson Header */}
                      <div className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                          <Shield size={200} />
                        </div>
                        <div className="relative z-10 space-y-6">
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {selectedLesson.replace('_', ' ')}
                          </h3>
                          <div className="h-1 w-24 bg-emerald-400 rounded-full" />
                          <p className="text-slate-400 leading-relaxed font-medium text-lg">
                            {selectedLesson === 'CIA_TRIAD' && "Learn the foundational three-pillar architecture of information security."}
                            {selectedLesson === 'ATTACK_VECTORS' && "Analyze the most common entry points and exploit techniques used by adversaries."}
                            {selectedLesson === 'NETWORK_SECURITY' && "Master the art of securing data-in-transit and hardening network infrastructure."}
                            {selectedLesson === 'CRYPTOGRAPHY' && "Unlock the secrets of data obfuscation and mathematical security protocols."}
                            {selectedLesson === 'WEB_APP_SEC' && "Secure the modern web. From OWASP Top 10 to real-time payload analysis."}
                            {selectedLesson === 'CLOUD_SEC' && "Navigate the shared responsibility model and secure cloud-native infrastructure."}
                            {selectedLesson === 'ETHICAL_HACKING' && "Adopt the mindset of the adversary to better defend your own nodes."}
                            {selectedLesson === 'REGEX_MASTERY' && "Master the art of pattern matching with Regular Expressions."}
                          </p>
                        </div>
                      </div>

                      {/* Detailed Content (Dynamic based on selection) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {selectedLesson === 'WEB_APP_SEC' && [
                          { title: 'SQL Injection', text: 'Protecting database queries from malicious payload injection. Use prepared statements.', icon: Database, link: 'https://tryhackme.com/room/sqlivulnerabilities' },
                          { title: 'Cross-Site Scripting', text: 'Preventing malicious scripts from executing in user browsers. Sanitize all inputs.', icon: Eye, link: 'https://tryhackme.com/room/xss' },
                          { title: 'Broken Auth', text: 'Hardening session management and preventing credential stuffing attacks.', icon: UserCheck, link: 'https://owasp.org/www-project-top-ten/' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-300"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'CLOUD_SEC' && [
                          { title: 'Shared Responsibility', text: 'Understanding what you secure vs what the provider secures (AWS/Azure/GCP).', icon: Cloud, link: 'https://aws.amazon.com/compliance/shared-responsibility-model/' },
                          { title: 'IAM Governance', text: 'Identity & Access Management. Least privilege access for all cloud identities.', icon: Key, link: 'https://tryhackme.com/room/introtoiam' },
                          { title: 'S3 Bucket Security', text: 'Preventing data leaks through misconfigured cloud storage buckets.', icon: HardDrive, link: 'https://tryhackme.com/room/s3security' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-300"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'CIA_TRIAD' && [
                          { title: 'Confidentiality', text: 'Encryption, Access Control, Biometrics. Ensuring data is for authorized eyes only.', icon: Eye, link: 'https://tryhackme.com/module/intro-to-cyber-security' },
                          { title: 'Integrity', text: 'Hashing, Digital Signatures, Version Control. Protecting data from unauthorized change.', icon: Zap, link: 'https://www.cybrary.it/course/intro-to-it-and-cybersecurity' },
                          { title: 'Availability', text: 'Redundancy, Backups, DDoS Protection. Ensuring systems stay online 24/7.', icon: Activity, link: 'https://www.coursera.org/learn/foundations-of-cybersecurity' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-300"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'ATTACK_VECTORS' && [
                          { title: 'Social Engineering', text: 'Phishing, Pretexting, Baiting. Exploiting the weakest link: Humans.', icon: AlertTriangle, link: 'https://tryhackme.com/room/socialengineering' },
                          { title: 'Malware', text: 'Viruses, Worms, Trojans, Ransomware. Malicious code execution.', icon: Lock, link: 'https://www.malware-traffic-analysis.net/' },
                          { title: 'Network Attacks', text: 'Man-in-the-Middle (MitM), Packet Sniffing, ARP Poisoning.', icon: Network, link: 'https://hackthebox.com/hacker/starting-point' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-rose-500/10 rounded-2xl w-fit text-rose-400"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'NETWORK_SECURITY' && [
                          { title: 'Firewall Protocol', text: 'Packet filtering, Stateful inspection, Next-Gen firewalls.', icon: Shield, link: 'https://tryhackme.com/room/introtonetworking' },
                          { title: 'VPN Tunnels', text: 'AES-256 encrypted tunnels for secure remote access.', icon: Network, link: 'https://www.netacad.com/courses/packet-tracer' },
                          { title: 'IDS/IPS', text: 'Intrusion Detection & Prevention systems.', icon: Activity, link: 'https://www.snort.org/' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-300"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'ETHICAL_HACKING' && [
                          { title: 'Reconnaissance', text: 'OSINT, Nmap scans, sub-domain enumeration.', icon: Search, link: 'https://tryhackme.com/module/network-security' },
                          { title: 'Exploitation', text: 'Metasploit, SQL Injection, Buffer Overflows.', icon: Zap, link: 'https://www.offensive-security.com/metasploit-unleashed/' },
                          { title: 'Reporting', text: 'Documenting vulnerabilities and remediation.', icon: FileText, link: 'https://github.com/pwndoc/pwndoc' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-amber-500/10 rounded-2xl w-fit text-amber-400"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'CRYPTOGRAPHY' && [
                          { title: 'Symmetric Encryption', text: 'Same key for lock/unlock. Examples: AES, DES.', icon: Key, link: 'https://cryptopals.com/' },
                          { title: 'Asymmetric Encryption', text: 'Public/Private key pairs. Examples: RSA, ECC.', icon: Lock, link: 'https://www.khanacademy.org/computing/computer-science/cryptography' },
                          { title: 'Hashing Protocols', text: 'One-way math. Examples: SHA-256.', icon: Binary, link: 'https://tryhackme.com/room/cryptographyforbeginners' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit text-emerald-400"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}

                        {selectedLesson === 'REGEX_MASTERY' && [
                          { title: 'Anchor Matching', text: 'Use ^ and $ to match the start and end of a string exactly.', icon: Code, link: 'https://regex101.com/' },
                          { title: 'Quantifiers', text: 'Control how many times a character can repeat. Examples: *, +, ?, {n}.', icon: Zap, link: 'https://regexr.com/' },
                          { title: 'Character Classes', text: 'Match groups of characters. Examples: [a-z], \\d, \\w.', icon: Search, link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions' }
                        ].map((item, i) => (
                          <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-4 hover:neon-border transition-all flex flex-col h-full">
                            <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-300"><item.icon size={24} /></div>
                            <h4 className="text-lg font-black text-white uppercase">{item.title}</h4>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed flex-1">{item.text}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 flex items-center gap-2 hover:opacity-70">Study_Resource <ExternalLink size={12} /></a>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Lab Section */}
                      <div className="glass-card p-12 rounded-[3.5rem] bg-gradient-to-tr from-emerald-500/5 to-transparent border border-emerald-500/10">
                        <div className="flex items-center gap-4 mb-8">
                          <Terminal size={24} className="text-emerald-400" />
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">Active_Lab: Practice_Arena</h4>
                        </div>
                        
                        {selectedLesson === 'CIA_TRIAD' && (
                          <div className="space-y-6">
                            <p className="text-sm text-slate-400 font-medium">Scenario: A database containing user passwords was leaked. Which pillar was breached?</p>
                            <div className="flex gap-4">
                              {['Confidentiality', 'Integrity', 'Availability'].map(ans => (
                                <button key={ans} onClick={() => addLog(`QUIZ_ANSWER: ${ans}`, 'sys')} className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase hover:bg-emerald-400 hover:text-slate-950 transition-all">{ans}</button>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedLesson === 'ATTACK_VECTORS' && (
                          <div className="space-y-6">
                            <p className="text-sm text-slate-400 font-medium">Scenario: You receive an email asking to "Update your credentials" via a shady link. Technique?</p>
                            <div className="flex gap-4">
                              {['Phishing', 'DDoS', 'SQLi'].map(ans => (
                                <button key={ans} onClick={() => addLog(`QUIZ_ANSWER: ${ans}`, 'sys')} className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase hover:bg-rose-400 hover:text-slate-950 transition-all">{ans}</button>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedLesson === 'CRYPTOGRAPHY' && (
                          <div className="space-y-6">
                            <p className="text-sm text-slate-400 font-medium">Challenge: Generate a SHA-256 hash of the string "NEJAHA" using the Cyber Suite.</p>
                            <button onClick={() => setView('cyber')} className="px-6 py-3 rounded-xl bg-emerald-400 text-slate-950 text-[10px] font-black uppercase hover:scale-105 transition-all">Go to Cyber Suite</button>
                          </div>
                        )}

                        {selectedLesson === 'ETHICAL_HACKING' && (
                          <div className="space-y-6">
                            <p className="text-sm text-slate-400 font-medium">CTF_Challenge: A hidden flag is buried in the console logs. Can you find the secret sequence?</p>
                            <button 
                              onClick={() => {
                                console.log('%c FLAG{NEJAHA_ELITE_HACKER} ', 'background: #222; color: #bada55; font-size: 20px');
                                addLog('CTF_PAYLOAD_DEPLOYED_TO_CONSOLE', 'sys');
                              }} 
                              className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black uppercase hover:scale-105 transition-all"
                            >
                              Deploy_Probe
                            </button>
                          </div>
                        )}

                        {selectedLesson === 'REGEX_MASTERY' && (
                          <div className="space-y-6">
                            <p className="text-sm text-slate-400 font-medium">Challenge: Which Regex pattern matches the word "fit" exactly from start to finish?</p>
                            <div className="flex gap-4">
                              {['/fit/', '/^fit$/', '/[f-t]/'].map(ans => (
                                <button key={ans} onClick={() => {
                                  if (ans === '/^fit$/') {
                                    addLog(`CORRECT: ${ans} MATCHES 'FIT' EXACTLY`, 'sys');
                                  } else {
                                    addLog(`INCORRECT: ${ans} IS TOO BROAD`, 'err');
                                  }
                                }} className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase hover:bg-emerald-400 hover:text-slate-950 transition-all">{ans}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lesson Footer / Action */}
                      <div className="flex justify-between items-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                        <div className="flex items-center gap-4">
                          <Check size={20} className={courseProgress[selectedLesson] ? 'text-emerald-400' : 'text-slate-700'} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Module_Status: {courseProgress[selectedLesson] ? 'VERIFIED' : 'PENDING_EXAM'}</span>
                        </div>
                        {!courseProgress[selectedLesson] && (
                          <button 
                            onClick={() => {
                              setCourseProgress({...courseProgress, [selectedLesson]: true});
                              addLog(`LESSON_COMPLETE: ${selectedLesson}`, 'sys');
                            }}
                            className={`bg-${themes[theme]} text-slate-950 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all`}
                          >
                            Finalize_Module
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </section>
              </div>
            </motion.div>
          )}

          {view === 'snippets' && (
            <motion.div 
              key="snippets"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-6xl font-black text-white neon-text uppercase tracking-tighter">Code_Repo</h2>
                  <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-2">Active_Snippets: {snippets.length}</p>
                </div>
                <button 
                  onClick={addSnippet}
                  className={`bg-${themes[theme]} text-slate-950 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl`}
                >
                  + New Snippet
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {snippets.map((snippet) => (
                  <div key={snippet._id} className="glass-card p-10 rounded-[3rem] group hover:neon-border transition-all duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-2xl bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                        <Code size={24} />
                      </div>
                      <button onClick={() => deleteSnippet(snippet._id)}>
                        <Trash2 size={16} className="text-slate-700 hover:text-rose-400 transition-colors" />
                      </button>
                    </div>
                    <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tight">{snippet.name}</h3>
                    <div className="bg-slate-950/80 p-6 rounded-2xl font-mono text-[11px] text-emerald-400/80 border border-white/5 overflow-x-auto custom-scrollbar">
                      <code>{snippet.code}</code>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(snippet.code);
                        addLog(`COPIED_${snippet.name.toUpperCase()}`, 'sys');
                      }}
                      className="w-full mt-6 py-4 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                      Copy Sequence
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'portfolio' && (
            <motion.div 
              key="portfolio"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-5xl mx-auto space-y-12"
            >
              <div className="glass-card p-16 rounded-[4rem] flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-96 h-96 bg-${themes[theme]}/5 rounded-full -mr-48 -mt-48 blur-[100px]`} />
                <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-neigey-primary to-neigey-secondary p-1 relative z-10 shadow-2xl">
                  <div className="w-full h-full rounded-[2.8rem] bg-slate-900 flex items-center justify-center">
                    <span className="text-6xl font-black text-white">{portfolio.name?.[0] || 'N'}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                  <div>
                    <h2 className="text-6xl font-black tracking-tighter text-white mb-2 uppercase">{portfolio.name}</h2>
                    <p className={`text-${themes[theme]} font-black tracking-[0.4em] uppercase text-xs`}>{portfolio.role?.replace(' ', '_')}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {portfolio.skills?.map(s => (
                      <span key={s} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {portfolio.projects?.map((proj, i) => (
                   <div key={i} className="glass-card p-10 rounded-[3rem] group hover:neon-border transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl bg-${themes[theme]}/10 flex items-center justify-center text-${themes[theme]}`}>
                          <ExternalLink size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">PROJ_NODE_{i}</span>
                      </div>
                      <h3 className="text-xl font-black text-white mb-3 uppercase">{proj.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{proj.description}</p>
                      <a href={proj.link} className={`text-[10px] font-black text-${themes[theme]} uppercase tracking-[0.3em] hover:opacity-70 transition-opacity`}>Access_Interface {'->'}</a>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* Toolbox View */}
          {view === 'toolbox' && (
            <motion.div 
              key="toolbox"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              <section className="glass-card p-12 rounded-[3.5rem]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
                    <Code size={20} className={`text-${themes[theme]}`} /> Cipher_Core
                  </h3>
                  <div className="flex gap-3">
                    <button onClick={b64Encode} className={`bg-${themes[theme]} text-slate-950 text-[10px] font-black px-6 py-2.5 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-${themes[theme]}/20`}>ENCODE</button>
                    <button onClick={b64Decode} className="bg-white/5 text-slate-400 text-[10px] font-black px-6 py-2.5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">DECODE</button>
                  </div>
                </div>
                <textarea 
                  value={toolbox.input}
                  onChange={(e) => setToolbox({ ...toolbox, input: e.target.value })}
                  placeholder="Inject raw data buffer..."
                  className="w-full bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-10 text-sm focus:ring-2 ring-white/10 h-64 resize-none font-mono transition-all outline-none text-slate-300 placeholder:text-slate-800"
                />
                <AnimatePresence>
                  {toolbox.output && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 relative group"
                    >
                      <div className={`bg-slate-950/80 p-10 rounded-[2.5rem] font-mono text-xs text-${themes[theme]} break-all border border-${themes[theme]}/20 shadow-inner`}>
                        {toolbox.output}
                      </div>
                      <button 
                        onClick={copyOutput}
                        className="absolute top-6 right-6 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {toolbox.copyStatus ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <div className="space-y-10">
                <section className="glass-card p-12 rounded-[3.5rem]">
                  <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 mb-10 uppercase flex items-center gap-3">
                    <Globe size={20} className="text-amber-400" /> Node_Probe
                  </h3>
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      value={network.dnsInput}
                      onChange={(e) => setNetwork({ ...network, dnsInput: e.target.value })}
                      placeholder="Target address..."
                      className="flex-1 bg-slate-950/40 border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold focus:ring-2 ring-amber-400/20 outline-none"
                    />
                    <button 
                      onClick={lookupDns}
                      className="bg-amber-400 text-slate-950 px-8 rounded-[1.5rem] font-black hover:scale-105 transition-all shadow-xl shadow-amber-400/20"
                    >
                      {network.dnsLoading ? '...' : <Search size={24} />}
                    </button>
                  </div>
                  {network.dnsResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-slate-950/60 p-8 rounded-[2rem] font-mono text-xs text-amber-400 border border-amber-400/10 shadow-inner">
                      {network.dnsResult}
                    </motion.div>
                  )}
                </section>

                <section className="glass-card p-12 rounded-[3.5rem]">
                  <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 mb-10 uppercase flex items-center gap-3">
                    <DollarSign size={20} className="text-emerald-400" /> Fiat_Gateway
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 relative">
                      <input 
                        type="number"
                        value={currency.amount}
                        onChange={(e) => setCurrency({ ...currency, amount: e.target.value })}
                        className="w-full bg-slate-950/40 border border-white/5 rounded-[1.5rem] p-6 text-xl font-black text-white outline-none focus:ring-2 ring-emerald-400/20 pl-16"
                      />
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400 opacity-50" size={24} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-700 tracking-widest ml-4">SOURCE</label>
                      <select 
                        value={currency.from}
                        onChange={(e) => setCurrency({ ...currency, from: e.target.value })}
                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs font-black text-slate-400 outline-none"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-700 tracking-widest ml-4">TARGET</label>
                      <select 
                        value={currency.to}
                        onChange={(e) => setCurrency({ ...currency, to: e.target.value })}
                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs font-black text-slate-400 outline-none"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <button 
                      onClick={convertCurrency}
                      className="col-span-2 bg-emerald-400 text-slate-950 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-emerald-400/20 mt-4"
                    >
                      Convert Intelligence
                    </button>
                  </div>
                  <div className="mt-8 p-8 rounded-[2rem] bg-emerald-400/5 border border-emerald-400/10 flex justify-between items-center group">
                    <span className="text-slate-700 text-[10px] font-black tracking-[0.3em]">GATEWAY_RESULT</span>
                    <span className="text-3xl font-black font-mono text-emerald-400 group-hover:scale-110 transition-transform">{currency.result} <span className="text-sm opacity-50">{currency.to}</span></span>
                  </div>
                </section>

                <section className="glass-card p-12 rounded-[3.5rem]">
                  <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 mb-10 uppercase flex items-center gap-3">
                    <Zap size={20} className="text-purple-400" /> API_Kernel_Probe
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <select className="bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black text-slate-400 outline-none">
                        <option>GET</option>
                        <option>POST</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="https://api.example.com/v1"
                        className="flex-1 bg-slate-950/40 border border-white/5 rounded-xl px-6 py-3 text-xs font-bold outline-none focus:ring-1 ring-purple-400/40"
                      />
                    </div>
                    <button className="w-full py-4 rounded-xl bg-purple-400/10 border border-purple-400/20 text-[10px] font-black text-purple-400 uppercase tracking-widest hover:bg-purple-400 hover:text-slate-950 transition-all">
                      Execute_Request
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {view === 'timer' && (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-5xl mx-auto flex flex-col items-center justify-center py-12"
            >
              <div className="relative w-[30rem] h-[30rem] mb-20 group">
                <div className={`absolute inset-0 bg-${themes[theme]}/5 rounded-full animate-pulse blur-[100px]`} />
                <svg className="absolute inset-0 -rotate-90 w-full h-full filter drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  <circle 
                    cx="240" cy="240" r="220" 
                    fill="transparent" 
                    stroke="rgba(255,255,255,0.02)" 
                    strokeWidth="16"
                  />
                  <motion.circle 
                    cx="240" cy="240" r="220" 
                    fill="transparent" 
                    stroke="url(#timerGradient)" 
                    strokeWidth="16"
                    strokeLinecap="round"
                    animate={{ strokeDashoffset: 220 * 2 * Math.PI * (1 - pomodoro.seconds / 1500) }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{ strokeDasharray: 220 * 2 * Math.PI }}
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={themes[theme] === 'neigey-primary' ? '#38BDF8' : themes[theme] === 'indigo-500' ? '#6366f1' : themes[theme] === 'emerald-400' ? '#34d399' : '#fbbf24'} />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-slate-700 text-xs font-black tracking-[0.5em] uppercase mb-4 opacity-50">Sync_Active</span>
                  <div className="text-[10rem] font-black font-mono tracking-tighter text-white drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] neon-text">
                    {Math.floor(pomodoro.seconds / 60).toString().padStart(2, '0')}:
                    {(pomodoro.seconds % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Activity size={14} className={`text-${themes[theme]} animate-pulse`} />
                    <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase italic">Temporal_Resonance_Engaged</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-10">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPomodoro(p => ({ ...p, isRunning: !p.isRunning }))}
                  className="bg-white text-slate-950 p-14 rounded-[3.5rem] shadow-[0_20px_50px_rgba(255,255,255,0.1)] group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white to-slate-200" />
                  <div className="relative z-10">
                    {pomodoro.isRunning ? <Pause size={64} fill="currentColor" /> : <Play size={64} fill="currentColor" className="ml-2" />}
                  </div>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPomodoro({ seconds: 1500, isRunning: false })}
                  className="bg-white/5 text-slate-700 p-14 rounded-[3.5rem] transition-all border border-white/5 hover:text-white"
                >
                  <RefreshCcw size={56} />
                </motion.button>
              </div>
            </motion.div>
          )}
          {view === 'notes' && (
            <motion.div 
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex justify-between items-end mb-20">
                <div className="space-y-2">
                  <h2 className="text-7xl font-black tracking-tighter text-white neon-text">VAULT</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-neigey-secondary shadow-[0_0_15px_#818CF8]" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">Encryption_Status: Active | Total_Buffer: {notes.length}</p>
                  </div>
                </div>
                <div className="flex gap-4 bg-slate-900/40 p-4 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                  <input 
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Commit intelligence..."
                    className="bg-transparent border-none px-8 py-4 w-96 outline-none font-bold text-white placeholder:text-slate-800"
                  />
                  <button onClick={addNote} className={`bg-${themes[theme]} text-slate-950 px-10 rounded-[1.8rem] font-black shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all`}>
                    COMM_SAVE
                  </button>
                </div>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                <AnimatePresence initial={false}>
                  {notes.map((note) => (
                    <motion.div 
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="break-inside-avoid glass-card p-10 rounded-[3rem] group hover:neon-border transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-neigey-secondary/5 rounded-full blur-2xl group-hover:bg-neigey-secondary/10 transition-all" />
                      <p className="text-slate-400 leading-relaxed text-base font-medium relative z-10">{note.text}</p>
                      <div className="flex justify-between items-center mt-10 pt-8 border-t border-white/5 relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-700 font-black tracking-widest uppercase">DAT_STAMP</span>
                          <span className="text-[10px] text-neigey-secondary font-mono font-bold mt-1 uppercase">{new Date(note.id).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => deleteNote(note.id)}
                          className="p-4 text-slate-800 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all duration-300 border border-transparent hover:border-rose-400/20"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Embedded Global Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .neon-text {
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
        }
        .neon-border {
           border-color: rgba(56, 189, 248, 0.3) !important;
           box-shadow: 0 0 20px rgba(56, 189, 248, 0.05);
        }
        .glass-card {
           background: rgba(15, 23, 42, 0.4);
           backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.03);
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scanline-effect::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(56, 189, 248, 0.01) 50%, transparent);
          animation: scanline 10s linear infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};  
export default App;
