import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Music, Activity, Disc, Zap, Settings2, Music as GuitarIcon, Layout, Palette, Book, HelpCircle, Cloud, Volume2, AudioWaveform, Skull, Cpu, ListMusic, Mic, Folder, Brain, Share2, Sparkles, Target, BarChart3, Lightbulb, Clock, Timer, CheckCircle2, AlertCircle, TrendingUp, Heart, Eye, Download, Star, Users, Headphones, Video, MessageSquare, UserPlus, Crown, Wifi, Radio, StopCircle, Layers, Plus, RefreshCcw, Shield, Camera, Compass, Lock, Sprout, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Piano from './components/Piano';
import Violin from './components/Violin';
import Cello from './components/Cello';
import Guitar from './components/Guitar';
import DrumSequencer from './components/DrumSequencer';
import DrumPad from './components/DrumPad';
import Sampler from './components/Sampler';
import Synthesizer from './components/Synthesizer';
import MelodicSequencer from './components/MelodicSequencer';
import BassSynth from './components/BassSynth';
import AmbientPad from './components/AmbientPad';
import ScaleExplorer from './components/ScaleExplorer';
import AudioVisualizer from './components/AudioVisualizer';
import Metronome from './components/Metronome';
import Tuner from './components/Tuner';
import Looper from './components/Looper';
import MultiTrackLooper from './components/MultiTrackLooper';
import MasterFX from './components/MasterFX';
import Arpeggiator from './components/Arpeggiator';
import ChordProgression from './components/ChordProgression';
import MidiManager from './components/MidiManager';
import SessionSettings from './components/SessionSettings';
import ChordDictionary from './components/ChordDictionary';
import Recorder from './components/Recorder';
import RecordingGallery from './components/RecordingGallery';
import VocalProcessor from './components/VocalProcessor';
import { weatherEngine } from './audio/weatherEngine';
import { masterBus } from './audio/masterBus';
import Soundboard from './components/Soundboard';
import CommandPalette from './components/CommandPalette';
import ProjectManager from './components/ProjectManager';
import VUMeter from './components/VUMeter';
import SpectrumAnalyser from './components/SpectrumAnalyser';
import Mixer from './components/Mixer';
import PeakMeter from './components/PeakMeter';
import Theremin from './components/Theremin';
import GlitchRack from './components/GlitchRack';
import MidiFileHandler from './components/MidiFileHandler';
import SocialSharing from './components/SocialSharing';
import AIMusicGenerator from './components/AIMusicGenerator';
import WorkflowAutomation from './components/WorkflowAutomation';
import MusicTheoryAnalysis from './components/MusicTheoryAnalysis';
import JamSession from './components/JamSession';
import LyricWriter from './components/LyricWriter';
import BeatSlicer from './components/BeatSlicer';
import RiffGenerator from './components/RiffGenerator';
import MacroDashboard from './components/MacroDashboard';
import WaveformEditor from './components/WaveformEditor';
import PatternArranger from './components/PatternArranger';
import AccessibilityPanel from './components/AccessibilityPanel';
import MobileLayout from './components/MobileLayout';
import LearningProgression from './components/LearningProgression';
import CollaborationMarketplace from './components/CollaborationMarketplace';
import AutomationRecorder from './components/AutomationRecorder';
import ThemeCustomizer from './components/ThemeCustomizer';
import ThemeEditor from './components/ThemeEditor';
import AudioExport from './components/AudioExport';
import MidiMapper from './components/MidiMapper';
import MidiCCManager from './components/MidiCCManager';
import AIChordSuggestions from './components/AIChordSuggestions';
import AIMelodicExplorer from './components/AIMelodicExplorer';
import GranularSynthesizer from './components/GranularSynthesizer';
import SessionLoopRecorder from './components/SessionLoopRecorder';
import OnboardingGuide from './components/OnboardingGuide';
import MasterMetering from './components/MasterMetering';
import SnapshotManager from './components/SnapshotManager';
import PerformanceDashboard from './components/PerformanceDashboard';
import MultibandCompressor from './components/MultibandCompressor';
import FrequencyShifter from './components/FrequencyShifter';
import ParametricMasterEQ from './components/ParametricMasterEQ';
import MasteringLimiter from './components/MasteringLimiter';
import CloudMachine from './components/CloudMachine';
import MasterPluginRack from './components/MasterPluginRack';
import MiniPianoRoll from './components/MiniPianoRoll';
import SidechainCompressor from './components/SidechainCompressor';
import ConvolutionReverb from './components/ConvolutionReverb';
import ModulationMatrix from './components/ModulationMatrix';
import Harmonizer from './components/Harmonizer';
import LoopLibrary from './components/LoopLibrary';
import TrackGrouping from './components/TrackGrouping';
import PatchBay from './components/PatchBay';
import TransientShaper from './components/TransientShaper';
import AutoFilter from './components/AutoFilter';
import PitchShifter from './components/PitchShifter';
import Humanizer from './components/Humanizer';
import StereoImager from './components/StereoImager';
import NoiseGate from './components/NoiseGate';
import BPMTapper from './components/BPMTapper';
import MasterSpectralAnalyzer from './components/MasterSpectralAnalyzer';
import MasterOscilloscope from './components/MasterOscilloscope';
import Virtues from './components/Virtues';
import VirtueNotification from './components/VirtueNotification';
import VirtueFamiliar from './components/VirtueFamiliar';
import VirtueTraining from './components/VirtueTraining';
import VirtueRealms from './components/VirtueRealms';
import VirtuoGarden from './components/VirtuoGarden';
import DailyQuests from './components/DailyQuests';

function App() {
  const [activeTab, setActiveTab] = useState('piano'); // 'piano' | 'violin' | 'cello' | 'guitar' | 'drums' | 'pads' | 'sampler' | 'synth' | 'seq' | 'bass' | 'ambient' | 'vocal' | 'scales' | 'studio' | 'project' | 'theremin' | 'ai' | 'social' | 'workflow' | 'analysis' | 'jam' | 'arranger' | 'market' | 'learning' | 'granular' | 'looper' | 'themes' | 'performance' | 'cloud' | 'virtues' | 'training' | 'realms' | 'garden' | 'quests'
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [showUtilities, setShowUtilities] = useState(false);
  const [theme, setTheme] = useState('default');
  const [customAccent, setCustomAccent] = useState('#8a2be2');
  const [showGuide, setShowGuide] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [auraPulse, setAuraPulse] = useState(null);
  const [moodColor, setMoodColor] = useState('var(--accent-glow)');
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  useEffect(() => {
    const handlePulse = (e) => {
      setAuraPulse(e.detail.color);
      setTimeout(() => setAuraPulse(null), 1000);
    };
    window.addEventListener('virtuo-aura-pulse', handlePulse);
    return () => window.removeEventListener('virtuo-aura-pulse', handlePulse);
  }, []);
  const [scenes, setScenes] = useState(() => {
    const saved = localStorage.getItem('virtuo_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [quickSnapshots, setQuickSnapshots] = useState(() => {
    const saved = localStorage.getItem('virtuo_quick_snapshots');
    return saved ? JSON.parse(saved) : [];
  });

  const takeQuickSnapshot = () => {
    const snap = {
      id: Date.now(),
      name: `Snap ${quickSnapshots.length + 1}`,
      data: {
        activeTab,
        masterVolume,
        theme,
        customAccent,
        timestamp: Date.now()
      }
    };
    const newSnaps = [snap, ...quickSnapshots].slice(0, 5);
    setQuickSnapshots(newSnaps);
    localStorage.setItem('virtuo_quick_snapshots', JSON.stringify(newSnaps));
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', { detail: { virtue: 'innovation', amount: 10 } }));
  };

  const [virtues, setVirtues] = useState(() => {
    const saved = localStorage.getItem('virtuo_virtues');
    return saved ? JSON.parse(saved) : {
      harmony: { xp: 150 },
      rhythm: { xp: 450 },
      timbre: { xp: 80 },
      expression: { xp: 200 },
      innovation: { xp: 300 },
      theory: { xp: 120 }
    };
  });

  const [streak, setStreak] = useState(0);
  const [lastXpTime, setLastXpTime] = useState(0);
  const [recentVirtues, setRecentVirtues] = useState([]);
  const [activePowers, setActivePowers] = useState({});
  const [sessionStats, setSessionStats] = useState(() => {
    const saved = localStorage.getItem('virtuo_session_stats');
    return saved ? JSON.parse(saved) : {
      totalTime: 0,
      xpDistribution: { harmony: 0, rhythm: 0, timbre: 0, expression: 0, innovation: 0, theory: 0 },
      lastSessionDate: Date.now(),
      timeline: []
    };
  });

  const [anomaly, setAnomaly] = useState(null);
  const [weather, setWeather] = useState('clear'); // 'clear' | 'harmonic_rain' | 'rhythmic_wind' | 'timbral_mist'

  useEffect(() => {
    const handleInteraction = async () => {
      await Tone.start();
      weatherEngine.init();
      masterBus.init();
      weatherEngine.setWeather(weather);
      setIsAudioStarted(true);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    weatherEngine.setWeather(weather);
  }, [weather]);

  useEffect(() => {
    const dominant = getDominantVirtue();
    const weatherMap = {
      harmony: 'harmonic_rain',
      rhythm: 'rhythmic_wind',
      timbre: 'timbral_mist',
      expression: 'clear',
      innovation: 'cyberpunk_neon',
      theory: 'deep_forest'
    };
    setWeather(weatherMap[dominant] || 'clear');
  }, [virtues]);

  const [prophecy, setProphecy] = useState(() => {
    const saved = localStorage.getItem('virtuo_daily_prophecy');
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed;
    }
    return null;
  });

  useEffect(() => {
    if (!prophecy) {
      const virtues = ['harmony', 'rhythm', 'timbre', 'expression', 'innovation', 'theory'];
      const selected = virtues[Math.floor(Math.random() * virtues.length)];
      const prophecies = [
        `The stars align for ${selected}. XP gain increased by 20% today!`,
        `${selected.charAt(0).toUpperCase() + selected.slice(1)} resonates through the studio. Expect rare findings.`,
        `A surge of ${selected} energy detected. Specializations are 10% cheaper.`,
        `Mastery in ${selected} will reveal hidden paths today.`
      ];
      const newProphecy = {
        text: prophecies[Math.floor(Math.random() * prophecies.length)],
        virtue: selected,
        date: new Date().toDateString()
      };
      setProphecy(newProphecy);
      localStorage.setItem('virtuo_daily_prophecy', JSON.stringify(newProphecy));
    }
  }, [prophecy]);

  useEffect(() => {
    const triggerAnomaly = () => {
      const types = [
        { id: 'a1', name: 'Rhythm Rift', desc: 'Sync your beats to stabilize the rift!', virtue: 'rhythm', goal: 500, current: 0 },
        { id: 'a2', name: 'Timbral Void', desc: 'Experiment with sound design to fill the void!', virtue: 'timbre', goal: 300, current: 0 },
        { id: 'a3', name: 'Harmonic Storm', desc: 'Perform lush chords to calm the storm!', virtue: 'harmony', goal: 400, current: 0 },
        { id: 'a4', name: 'Theory Glitch', desc: 'Apply correct theory logic to fix the glitch!', virtue: 'theory', goal: 200, current: 0 },
        { id: 'a5', name: 'Expression Surge', desc: 'Channel your emotions to balance the surge!', virtue: 'expression', goal: 450, current: 0 }
      ];
      const selected = types[Math.floor(Math.random() * types.length)];
      setAnomaly({ ...selected, endTime: Date.now() + 600000 }); // 10 minutes
      
      // Global Audio Effect for Anomaly
      if (isAudioStarted) {
        const noise = new Tone.Noise("pink").toDestination();
        noise.volume.value = -40;
        noise.start();
        setTimeout(() => {
          noise.stop();
          noise.dispose();
        }, 2000);
      }

      window.dispatchEvent(new CustomEvent('virtuo-notification', {
        detail: { title: 'ANOMALY DETECTED', message: selected.name, type: 'warning' }
      }));
    };

    const interval = setInterval(() => {
      if (!anomaly && Math.random() < 0.1) triggerAnomaly();
      if (anomaly && Date.now() > anomaly.endTime) setAnomaly(null);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [anomaly]);

  useEffect(() => {
    const handleMidiOn = (e) => {
      const { note, velocity } = e.detail;
      const freq = Tone.Frequency(note).toFrequency();
      
      // Calculate a color based on pitch (high = blue/purple, low = red/orange)
      const hue = Math.floor((freq % 1000) / 1000 * 360);
      const newColor = `hsla(${hue}, 70%, 50%, 0.1)`;
      setMoodColor(newColor);

      if (hasSynergy('harmony', 'rhythm')) {
        setAuraPulse('#3b82f6'); // Harmony color for rhythmic pulse
        setTimeout(() => setAuraPulse(null), 100);
      }
    };
    window.addEventListener('virtuo-midi-on', handleMidiOn);
    return () => window.removeEventListener('virtuo-midi-on', handleMidiOn);
  }, [virtues]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionStats(prev => {
        const next = { ...prev, totalTime: prev.totalTime + 1 };
        localStorage.setItem('virtuo_session_stats', JSON.stringify(next));
        return next;
      });

      // Update Garden Growth
      const gardenStr = localStorage.getItem('virtuo_garden');
      if (gardenStr) {
        const garden = JSON.parse(gardenStr);
        if (garden.length > 0) {
          const newGarden = garden.map(seed => ({
            ...seed,
            growth: seed.growth + 1 // Simple time-based growth
          }));
          localStorage.setItem('virtuo_garden', JSON.stringify(newGarden));
        }
      }

      // Virtue Soundscape Logic
      const dominant = getDominantVirtue();
      const level = Math.floor(Math.sqrt(virtues[dominant].xp / 100));
      if (isAudioStarted && level >= 5 && Math.random() < 0.05) { // Occasional background textures
        const frequencies = {
          harmony: [261.63, 329.63, 392.00], // C Major
          rhythm: [100, 150, 200],
          timbre: [440, 880, 1320],
          expression: [349.23, 440.00, 523.25], // F Major
          innovation: [277.18, 349.23, 415.30], // Db Major
          theory: [293.66, 369.99, 440.00] // D Major
        };
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: dominant === 'timbre' ? 'sawtooth' : 'sine' },
          envelope: { attack: 2, release: 4 }
        }).toDestination();
        synth.volume.value = -30;
        synth.triggerAttackRelease(frequencies[dominant] || [440], '4s');
        setTimeout(() => synth.dispose(), 10000);
      }
    }, 1000); // Track seconds
    return () => clearInterval(timer);
  }, [virtues]);
  const [collectibles, setCollectibles] = useState(() => {
    const saved = localStorage.getItem('virtuo_collectibles');
    return saved ? JSON.parse(saved) : [];
  });

  const COLLECTIBLE_TYPES = [
    { id: 'c1', name: 'Ancient Tuning Fork', virtue: 'theory', rarity: 'Rare', icon: '🔱' },
    { id: 'c2', name: 'Golden Metronome', virtue: 'rhythm', rarity: 'Epic', icon: '⏳' },
    { id: 'c3', name: 'Prismatic Oscillator', virtue: 'timbre', rarity: 'Legendary', icon: '💎' }
  ];

  const checkForCollectible = (virtue) => {
    if (Math.random() < 0.005) { // 0.5% chance
      const possible = COLLECTIBLE_TYPES.filter(c => c.virtue === virtue);
      if (possible.length > 0) {
        const found = possible[Math.floor(Math.random() * possible.length)];
        if (!collectibles.find(c => c.id === found.id)) {
          setCollectibles(prev => {
            const next = [...prev, found];
            localStorage.setItem('virtuo_collectibles', JSON.stringify(next));
            return next;
          });
          window.dispatchEvent(new CustomEvent('virtuo-notification', {
            detail: { title: 'COLLECTIBLE FOUND!', message: `You found a ${found.name}!`, type: 'success' }
          }));
        }
      }
    }
  };

  const virtuePowers = {
    harmony: { name: 'Harmony Bloom', icon: <Music size={12} />, description: 'Auto-harmonizes performance.', duration: 15000 },
    rhythm: { name: 'Rhythm Lock', icon: <Disc size={12} />, description: 'Perfect quantization.', duration: 15000 },
    timbre: { name: 'Timbre Shift', icon: <Zap size={12} />, description: 'Dynamic sound shifting.', duration: 10000 },
    expression: { name: 'Expressive Surge', icon: <Heart size={12} />, description: 'Dynamic performance boost.', duration: 12000 },
    innovation: { name: 'Innovation Spark', icon: <Sparkles size={12} />, description: 'AI idea generation.', duration: 8000 },
    theory: { name: 'Theory Insight', icon: <Brain size={12} />, description: 'Scale highlighting.', duration: 20000 }
  };

  const activatePower = (virtue) => {
    const level = Math.floor(Math.sqrt(virtues[virtue].xp / 100));
    if (level < 5) {
      alert(`${virtuePowers[virtue].name} unlocks at Level 5!`);
      return;
    }

    if (activePowers[virtue]) return;

    setActivePowers(prev => ({ ...prev, [virtue]: true }));
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'POWER ACTIVATED', message: virtuePowers[virtue].name, type: 'info' }
    }));

    setTimeout(() => {
      setActivePowers(prev => {
        const next = { ...prev };
        delete next[virtue];
        return next;
      });
    }, virtuePowers[virtue].duration);
  };

  const calculateTotalLevel = () => {
    return Object.values(virtues).reduce((acc, v) => acc + Math.floor(Math.sqrt(v.xp / 100)), 0);
  };

  const getRank = (totalLevel) => {
    const level10Virtues = Object.values(virtues).filter(v => Math.floor(Math.sqrt(v.xp / 100)) >= 10).length;
    if (level10Virtues > 0) return `VIRTUE MASTER (${level10Virtues})`;
    
    if (totalLevel < 5) return 'NOVICE';
    if (totalLevel < 15) return 'APPRENTICE';
    if (totalLevel < 30) return 'JOURNEYMAN';
    if (totalLevel < 50) return 'ADEPT';
    return 'VIRTUOSO';
  };

  const getDominantVirtue = () => {
    let maxXP = -1;
    let dominant = 'innovation';
    Object.entries(virtues).forEach(([v, data]) => {
      if (data.xp > maxXP) {
        maxXP = data.xp;
        dominant = v;
      }
    });
    return dominant;
  };

  const getAuraColor = () => {
    const virtueColors = {
      harmony: '#3b82f6',
      rhythm: '#ef4444',
      timbre: '#f59e0b',
      expression: '#ec4899',
      innovation: '#8b5cf6',
      theory: '#10b981'
    };
    
    const dominantVirtue = getDominantVirtue();
    const maxXP = virtues[dominantVirtue].xp;
    
    const intensity = Math.min(0.3, (maxXP / 10000));
    const baseColor = virtueColors[dominantVirtue];
    
    if (hasSonicResonance()) {
      // Return a special gold-ish color for resonance
      return `rgba(16, 185, 129, ${0.1 + intensity})`;
    }
    
    return `${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
  };

  const getPowerBackground = () => {
    if (activePowers.timbre && activePowers.expression && hasSynergy('timbre', 'expression')) {
      return 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)';
    }

    const activeV = Object.keys(activePowers)[0];
    if (!activeV) return 'transparent';
    
    const virtueColors = {
      harmony: 'rgba(59, 130, 246, 0.05)',
      rhythm: 'rgba(239, 68, 68, 0.05)',
      timbre: 'rgba(245, 158, 11, 0.05)',
      expression: 'rgba(236, 72, 153, 0.05)',
      innovation: 'rgba(139, 92, 246, 0.05)',
      theory: 'rgba(16, 185, 129, 0.05)'
    };
    return virtueColors[activeV];
  };

  const hasSonicResonance = () => {
    const highLevelVirtues = Object.values(virtues).filter(v => Math.floor(Math.sqrt(v.xp / 100)) >= 5).length;
    return highLevelVirtues >= 3;
  };

  const hasSynergy = (v1, v2) => {
    return Math.floor(Math.sqrt(virtues[v1].xp / 100)) >= 10 && 
           Math.floor(Math.sqrt(virtues[v2].xp / 100)) >= 10;
  };

  useEffect(() => {
    Object.entries(virtues).forEach(([v, data]) => {
      const level = Math.floor(Math.sqrt(data.xp / 100));
      const savedLevel = localStorage.getItem(`virtuo_level_${v}`) || 0;
      if (level > Number(savedLevel)) {
        localStorage.setItem(`virtuo_level_${v}`, level);
        setSessionStats(prev => ({
          ...prev,
          timeline: [{
            id: Date.now(),
            type: 'level_up',
            virtue: v,
            level,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev.timeline].slice(0, 20)
        }));
      }
    });
  }, [virtues]);

  useEffect(() => {
    const handleGainXP = (e) => {
      const { virtue, amount, isCombo } = e.detail;
      const now = Date.now();
      
      if (virtues[virtue]) {
        checkForCollectible(virtue);
        
        // Gear Boost Logic
        let gearMultiplier = 1;
        const savedGear = localStorage.getItem('virtuo_equipped_gear');
        if (savedGear) {
          const gear = JSON.parse(savedGear);
          if (gear.virtue === virtue) {
            gearMultiplier = gear.boost;
          }
        }

        if (!isCombo) {
          setRecentVirtues(prev => {
            const updated = [virtue, ...prev.filter(v => v !== virtue)].slice(0, 3);
            
            // Check for Virtuoso Combo (3 different virtues in short succession)
            if (updated.length === 3 && now - lastXpTime < 10000) {
              // Bonus XP for all 3 virtues
              updated.forEach(v => {
                window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
                  detail: { virtue: v, amount: 50, isCombo: true }
                }));
              });
            }
            return updated;
          });
        }

        setVirtues(prev => {
          // Streak Logic
          let streakMultiplier = 1;
          if (now - lastXpTime < 5000) { // 5 second window
            setStreak(s => Math.min(s + 1, 10));
            streakMultiplier = 1 + (streak * 0.1);
          } else {
            setStreak(0);
          }
          setLastXpTime(now);

          // Archetype Multiplier
          let archetypeMultiplier = 1;
          const savedArc = localStorage.getItem('virtuo_archetype');
          if (savedArc) {
            const arcData = {
              arc1: { virtues: ['harmony', 'theory'] },
              arc2: { virtues: ['timbre', 'innovation'] },
              arc3: { virtues: ['expression', 'rhythm'] }
            }[savedArc];
            if (arcData && arcData.virtues.includes(virtue)) {
              archetypeMultiplier = 1.25;
            }
          }

          // Prestige Multiplier
          const pTier = Number(localStorage.getItem('virtuo_prestige_tier')) || 0;
          const prestigeMultiplier = 1 + (pTier === 1 ? 0.1 : pTier === 2 ? 0.2 : pTier === 3 ? 0.5 : 0);

          // Oracle Multiplier
          let oracleMultiplier = 1;
          if (prophecy && prophecy.virtue === virtue && prophecy.text.includes('20%')) {
            oracleMultiplier = 1.2;
          }

          // Synergy Multiplier
          let synergyMultiplier = 1;
          if (hasSynergy('timbre', 'expression') && activePowers.timbre && activePowers.expression) {
            synergyMultiplier = 2; // Spectral Soul
            if (!activePowers.spectral_soul_notified) {
              window.dispatchEvent(new CustomEvent('virtuo-notification', {
                detail: { title: 'SPECTRAL SOUL ACTIVE', message: '2x XP Multiplier!', type: 'success' }
              }));
              setActivePowers(prev => ({ ...prev, spectral_soul_notified: true }));
              setTimeout(() => {
                setActivePowers(prev => {
                  const next = { ...prev };
                  delete next.spectral_soul_notified;
                  return next;
                });
              }, 10000);
            }
          }

          const xpGain = Math.round(amount * streakMultiplier * gearMultiplier * archetypeMultiplier * prestigeMultiplier * oracleMultiplier * synergyMultiplier);
          
          // Update Session Stats
          setSessionStats(prevStats => {
            const nextStats = {
              ...prevStats,
              xpDistribution: {
                ...prevStats.xpDistribution,
                [virtue]: prevStats.xpDistribution[virtue] + xpGain
              }
            };
            localStorage.setItem('virtuo_session_stats', JSON.stringify(nextStats));
            return nextStats;
          });

          // Update Anomaly Progress
          if (anomaly && anomaly.virtue === virtue) {
            setAnomaly(prev => {
              const next = { ...prev, current: prev.current + xpGain };
              if (next.current >= next.goal) {
                window.dispatchEvent(new CustomEvent('virtuo-notification', {
                  detail: { title: 'ANOMALY STABILIZED', message: `Great work on the ${next.name}!`, type: 'success' }
                }));
                return null;
              }
              return next;
            });
          }

          const newState = {
            ...prev,
            [virtue]: { ...prev[virtue], xp: prev[virtue].xp + xpGain }
          };
          localStorage.setItem('virtuo_virtues', JSON.stringify(newState));
          return newState;
        });
      }
    };
    window.addEventListener('virtuo-gain-xp', handleGainXP);
    return () => window.removeEventListener('virtuo-gain-xp', handleGainXP);
  }, [virtues, streak, lastXpTime]);

  const instrumentInfo = {
    piano: "Grand Piano - 88-key polyphonic synthesizer with realistic envelope.",
    violin: "Orchestral Strings - Expressive bowed string simulation with vibrato control.",
    cello: "Deep Strings - Rich, low-frequency bowed string synthesis with warm resonance.",
    guitar: "Electric Guitar - Plucked string synthesis with harmonic richness.",
    drums: "Drum Machine - 16-step grid sequencer for creating custom beats.",
    pads: "Performance Pads - Velocity-sensitive pads for finger drumming.",
    sampler: "Voice Sampler - Load and manipulate audio clips with real-time controls.",
    synth: "Wavetable Synth - Custom oscillator shapes and filter modulation.",
    seq: "Step Sequencer - Monophonic melodic sequencer for lead lines.",
    bass: "Deep Bass - Low-frequency monophonic synth for foundation lines.",
    ambient: "Atmospheric Pads - Ethereal, evolving soundscapes with long release.",
    vocal: "Vocal Processor - Real-time microphone input with pitch shifting.",
    theremin: "Experimental Theremin - Control frequency and volume with your mouse position.",
    scales: "Music Theory - Explore different scales and their harmonic structures.",
    studio: "Recording Studio - Manage and play back your captured performances.",
    ai: "AI Music Generator - Machine learning-powered composition creation with style and mood controls.",
    social: "Social Sharing - Share your creations across platforms with export and statistics.",
    workflow: "Workflow Automation - AI-powered production optimization and time-saving tools.",
    analysis: "Music Theory Analysis - Advanced harmonic, melodic, and emotional analysis.",
    jam: "Jam Session - Real-time multiplayer music collaboration platform.",
    arranger: "Song Arranger - Combine patterns into full musical arrangements.",
    market: "Marketplace - Discover and share custom presets and patterns.",
    learning: "Learning Center - Track your musical journey and skill development.",
    granular: "Granular Synth - Manipulate audio grains to create unique, evolving textures.",
    performance: "Performance Mode - Simplified dashboard for live sets and streamlined control.",
    cloud: "Cloud Machine - Generative polyphonic soundscape engine for infinite atmospheres.",
    sidechain: "Sidechain Compressor - Pumping ducking effects with internal sidechain oscillator.",
    convreverb: "Convolution Reverb - Realistic space simulation with custom IR loading.",
    modulation: "Modulation Matrix - Route LFOs, envelopes, and MIDI to any parameter.",
    harmonizer: "Harmonizer - Multi-voice pitch shifter for lush vocal/instrument harmonies.",
    loops: "Loop Library - Browse and preview built-in loops across genres.",
    grouping: "Track Grouping - Organize tracks into buses for collective processing.",
    patchbay: "Patch Bay - Visual audio routing between sources and effect buses.",
    shaper: "Transient Shaper - Shape attack and sustain of audio signals for punchier drums.",
    autofilter: "Auto Filter - LFO-driven filter sweeps with selectable filter types.",
    pitch: "Pitch Shifter - Independent pitch shifting with semitone and cent precision.",
    humanizer: "Humanizer - Add swing, velocity randomness, and timing jitter for natural feel.",
    imager: "Stereo Imager - Stereo width, pan, and phase correlation visualization.",
    gate: "Noise Gate - Threshold-based gate with attack, hold, release, and ratio controls.",
    virtues: "Musical Virtues - Track your growth across different musical disciplines and unlock achievements."
  };

  // Persistence: Load recordings on mount
  useEffect(() => {
    const savedRecordings = localStorage.getItem('virtuo_recordings');
    if (savedRecordings) {
      try {
        // We can't save Blobs directly to localStorage as strings efficiently,
        // so for now we persist metadata and names. 
        // Real song mode would save MIDI/JSON sequences.
        // For this task, we'll implement session-based persistence for settings.
        const savedTheme = localStorage.getItem('virtuo_theme');
        if (savedTheme) handleThemeChange(savedTheme);
        
        const savedCustomAccent = localStorage.getItem('virtuo_custom_accent');
        if (savedCustomAccent) setCustomAccent(savedCustomAccent);
      } catch (e) { console.error("Persistence error", e); }
    }
  }, []);

  useEffect(() => {
    Tone.Destination.volume.rampTo(masterVolume, 0.1);
  }, [masterVolume]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate CPU load based on audio context state
      setCpuUsage(Math.round(Tone.context.lookAhead * 1000 + Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      
      // Don't switch if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const keyMap = {
        '1': 'piano', '2': 'violin', '3': 'guitar', '4': 'drums', 
        '5': 'pads', '6': 'sampler', '7': 'synth', '8': 'seq', '9': 'bass'
      };
      
      if (keyMap[e.key]) {
        setActiveTab(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommand = (id) => {
    if (id === 'zen') {
      setIsZenMode(prev => !prev);
    } else if (id === 'random_all') {
      window.dispatchEvent(new CustomEvent('virtuo-randomize'));
    } else if (id.startsWith('theme_')) {
      handleThemeChange(id.replace('theme_', ''));
    } else {
      setActiveTab(id);
    }
  };

  const themes = [
    { id: 'default', name: 'Cyberpunk', color: '#8a2be2' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'ocean', name: 'Ocean', color: '#3b82f6' },
    { id: 'sunset', name: 'Sunset', color: '#f43f5e' },
    { id: 'custom', name: 'Custom', color: 'linear-gradient(45deg, red, blue, green)' }
  ];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme === 'default' ? '' : newTheme);
    localStorage.setItem('virtuo_theme', newTheme);
    
    // If switching to a preset, update accent color
    if (newTheme !== 'custom') {
      const themeColor = themes.find(t => t.id === newTheme)?.color || '#8a2be2';
      handleAccentChange(themeColor);
    }
  };

  const handleAccentChange = (color) => {
    setCustomAccent(color);
    document.documentElement.style.setProperty('--accent-primary', color);
    const glow = `${color}80`; 
    document.documentElement.style.setProperty('--accent-glow', glow);
    localStorage.setItem('virtuo_custom_accent', color);
  };

  const loadScene = (data) => {
    if (data.theme) handleThemeChange(data.theme);
    if (data.customAccent) setCustomAccent(data.customAccent);
    if (data.activeTab) setActiveTab(data.activeTab);
    if (data.masterVolume !== undefined) setMasterVolume(data.masterVolume);
  };

  useEffect(() => {
    if (theme === 'custom') {
      document.documentElement.style.setProperty('--accent-primary', customAccent);
      document.documentElement.style.setProperty('--accent-glow', `${customAccent}80`);
      localStorage.setItem('virtuo_custom_accent', customAccent);
    }
  }, [customAccent, theme]);

  const addRecording = (blob) => {
    const newRecording = {
      id: Date.now(),
      blob: blob,
      date: new Date().toLocaleString(),
      name: `Recording ${recordings.length + 1}`
    };
    setRecordings(prev => [newRecording, ...prev]);
  };

  const deleteRecording = (id) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const renameRecording = (id, newName) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, name: newName } : r));
  };

  const handleMidiNoteOn = (note, velocity) => {
    window.dispatchEvent(new CustomEvent('virtuo-midi-on', { detail: { note, velocity } }));
  };

  const handleMidiNoteOff = (note) => {
    window.dispatchEvent(new CustomEvent('virtuo-midi-off', { detail: { note } }));
  };

  return (
    <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div 
        className="app-container" 
        data-active-tab={activeTab} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', 
          overflow: 'hidden',
          boxShadow: auraPulse ? `inset 0 0 200px ${auraPulse}` : (moodColor ? `inset 0 0 150px ${moodColor}` : `inset 0 0 100px ${getAuraColor()}`),
          background: getPowerBackground(),
          transition: 'all 2s ease-in-out'
        }}
      >
        <AnimatePresence>
          {!isZenMode && (
            <motion.div 
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              style={{ height: '30px', WebkitAppRegion: 'drag', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--glass-border)', zIndex: 1000 }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', opacity: 0.6, color: 'var(--text-main)' }}>VIRTUO</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.5, fontSize: '10px', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--glass-border)', paddingRight: '15px' }}>
                  <Shield size={12} color="#f59e0b" />
                  <span style={{ color: '#f59e0b' }}>VIRTUO STATUS:</span>
                  <span style={{ color: 'var(--text-main)' }}>{getRank(calculateTotalLevel())}</span>
                </div>
                
                <VirtueFamiliar 
                  dominantVirtue={getDominantVirtue()} 
                  level={Math.floor(Math.sqrt(virtues[getDominantVirtue()].xp / 100))} 
                />

                {anomaly && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      padding: '5px 15px', 
                      borderRadius: '20px', 
                      border: '1px solid #ef444440' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 900 }}>ANOMALY: {anomaly.name.toUpperCase()}</span>
                      <div style={{ width: '80px', height: '4px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                        <div style={{ width: `${(anomaly.current / anomaly.goal) * 100}%`, height: '100%', background: '#ef4444' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {hasSonicResonance() && (
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', textShadow: '0 0 10px #10b98180' }}
                  >
                    <Sparkles size={12} />
                    <span style={{ fontSize: '9px', fontWeight: 800 }}>SONIC RESONANCE ACTIVE</span>
                  </motion.div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Cpu size={12} />
                  <span>{cpuUsage}ms</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  <span>ENGINE READY</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <AnimatePresence>
        {!isZenMode && (
          <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={{ 
              padding: '10px 40px', 
              display: 'flex', 
              flexDirection: 'column',
              gap: '10px',
              background: 'rgba(0,0,0,0.1)', 
              zIndex: 900,
              borderBottom: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <h1 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Virtuo</h1>
                  {prophecy && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        whiteSpace: 'nowrap',
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '2px',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <Lightbulb size={10} color="#f59e0b" />
                      <span style={{ fontWeight: 600 }}>ORACLE:</span> {prophecy.text}
                    </motion.div>
                  )}
                </div>
                
                {/* Essential Global Options */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '30px' }}>
                  <Recorder onRecordingComplete={addRecording} />
                  <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)', margin: '0 5px' }} />
                  <button 
                    className={`btn-glass ${activeTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai')}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--accent-primary)' }}
                  >
                    <Brain size={14} /> AI
                  </button>
                  <button 
                    className={`btn-glass ${showUtilities ? 'active' : ''}`}
                    onClick={() => setShowUtilities(!showUtilities)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--accent-primary)' }}
                  >
                    <Settings2 size={14} /> Tools
                  </button>
                  <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)', margin: '0 5px' }} />
                  <button 
                    className="btn-glass"
                    onClick={takeQuickSnapshot}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#10b981', borderColor: '#10b981' }}
                    title="Quick Snapshot"
                  >
                    <Camera size={14} />
                  </button>
                  <button 
                    className="btn-glass"
                    onClick={() => window.dispatchEvent(new CustomEvent('virtuo-randomize'))}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f59e0b', borderColor: '#f59e0b' }}
                    title="Randomize Everything"
                  >
                    <RefreshCcw size={14} />
                  </button>
                  <button 
                    className={`btn-glass ${isZenMode ? 'active' : ''}`}
                    onClick={() => setIsZenMode(!isZenMode)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                    title="Zen Mode"
                  >
                    <Zap size={14} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '5px 15px', borderRadius: '20px' }}>
                  <Volume2 size={14} color="var(--text-muted)" />
                  <input 
                    type="range" min="-60" max="0" step="1" 
                    value={masterVolume} 
                    onChange={(e) => setMasterVolume(Number(e.target.value))}
                    style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
                  />
                  <PeakMeter />
                </div>
                
                <div 
                  onClick={() => setActiveTab('virtues')}
                  style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '5px 12px', borderRadius: '20px', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                >
                  <Shield size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b' }}>LVL {calculateTotalLevel()}</span>
                  
                  {streak > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '-5px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                      }}
                    >
                      {streak}x STREAK
                    </motion.div>
                  )}
                </div>

                {/* Virtue Powers UI */}
                <div style={{ display: 'flex', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '20px' }}>
                  {Object.entries(virtuePowers).map(([v, power]) => {
                    const level = Math.floor(Math.sqrt(virtues[v].xp / 100));
                    const isUnlocked = level >= 5;
                    const isActive = activePowers[v];
                    
                    return (
                      <button
                        key={v}
                        onClick={(e) => { e.stopPropagation(); activatePower(v); }}
                        className={isActive ? 'pulse' : ''}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isActive ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                          border: isUnlocked ? '1px solid #f59e0b40' : '1px solid rgba(255,255,255,0.1)',
                          color: isActive ? 'black' : (isUnlocked ? '#f59e0b' : 'rgba(255,255,255,0.2)'),
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          transition: 'all 0.3s ease'
                        }}
                        title={isUnlocked ? `${power.name}: ${power.description}` : `Unlocks at ${v} Level 5`}
                      >
                        {isUnlocked ? power.icon : <Lock size={10} />}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '20px', alignItems: 'center' }}>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: t.color,
                        border: theme === t.id ? '2px solid white' : 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Instrument Bar */}
            <nav 
              className="no-scrollbar"
              style={{ 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center', 
                overflowX: 'auto', 
                padding: '5px 0',
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
              }}
            >
              <button 
                className={`btn-glass ${activeTab === 'piano' ? 'active' : ''}`}
                onClick={() => setActiveTab('piano')}
                onMouseEnter={() => setHoveredTab('piano')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Music size={14} /> Piano
              </button>
              <button 
                className={`btn-glass ${activeTab === 'violin' ? 'active' : ''}`}
                onClick={() => setActiveTab('violin')}
                onMouseEnter={() => setHoveredTab('violin')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Activity size={14} /> Violin
              </button>
              <button 
                className={`btn-glass ${activeTab === 'cello' ? 'active' : ''}`}
                onClick={() => setActiveTab('cello')}
                onMouseEnter={() => setHoveredTab('cello')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Activity size={14} /> Cello
              </button>
              <button 
                className={`btn-glass ${activeTab === 'guitar' ? 'active' : ''}`}
                onClick={() => setActiveTab('guitar')}
                onMouseEnter={() => setHoveredTab('guitar')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <GuitarIcon size={14} /> Guitar
              </button>
              <button 
                className={`btn-glass ${activeTab === 'drums' ? 'active' : ''}`}
                onClick={() => setActiveTab('drums')}
                onMouseEnter={() => setHoveredTab('drums')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Disc size={14} /> Beats
              </button>
              <button 
                className={`btn-glass ${activeTab === 'pads' ? 'active' : ''}`}
                onClick={() => setActiveTab('pads')}
                onMouseEnter={() => setHoveredTab('pads')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Layout size={14} /> Pads
              </button>
              <button 
                className={`btn-glass ${activeTab === 'sampler' ? 'active' : ''}`}
                onClick={() => setActiveTab('sampler')}
                onMouseEnter={() => setHoveredTab('sampler')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <AudioWaveform size={14} /> Sampler
              </button>
              <button 
                className={`btn-glass ${activeTab === 'synth' ? 'active' : ''}`}
                onClick={() => setActiveTab('synth')}
                onMouseEnter={() => setHoveredTab('synth')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Zap size={14} /> Synth
              </button>
              <button 
                className={`btn-glass ${activeTab === 'seq' ? 'active' : ''}`}
                onClick={() => setActiveTab('seq')}
                onMouseEnter={() => setHoveredTab('seq')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <ListMusic size={14} /> Sequencer
              </button>
              <button 
                className={`btn-glass ${activeTab === 'bass' ? 'active' : ''}`}
                onClick={() => setActiveTab('bass')}
                onMouseEnter={() => setHoveredTab('bass')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Activity size={14} /> Bass
              </button>
              <button 
                className={`btn-glass ${activeTab === 'granular' ? 'active' : ''}`}
                onClick={() => setActiveTab('granular')}
                onMouseEnter={() => setHoveredTab('granular')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Sparkles size={14} /> Granular
              </button>
              <button 
                className={`btn-glass ${activeTab === 'looper' ? 'active' : ''}`}
                onClick={() => setActiveTab('looper')}
                onMouseEnter={() => setHoveredTab('looper')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Layers size={14} /> Looper
              </button>
              <button 
                className={`btn-glass ${activeTab === 'themes' ? 'active' : ''}`}
                onClick={() => setActiveTab('themes')}
                onMouseEnter={() => setHoveredTab('themes')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Palette size={14} /> Themes
              </button>
              <button 
                className={`btn-glass ${activeTab === 'cloud' ? 'active' : ''}`}
                onClick={() => setActiveTab('cloud')}
                onMouseEnter={() => setHoveredTab('cloud')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Cloud size={14} /> Cloud
              </button>
              <button 
                className={`btn-glass ${activeTab === 'ambient' ? 'active' : ''}`}
                onClick={() => setActiveTab('ambient')}
                onMouseEnter={() => setHoveredTab('ambient')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Cloud size={14} /> Ambient
              </button>
              <button 
                className={`btn-glass ${activeTab === 'vocal' ? 'active' : ''}`}
                onClick={() => setActiveTab('vocal')}
                onMouseEnter={() => setHoveredTab('vocal')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Mic size={14} /> Vocal
              </button>
              <button 
                className={`btn-glass ${activeTab === 'theremin' ? 'active' : ''}`}
                onClick={() => setActiveTab('theremin')}
                onMouseEnter={() => setHoveredTab('theremin')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Zap size={14} /> Theremin
              </button>
              <button 
                className={`btn-glass ${activeTab === 'scales' ? 'active' : ''}`}
                onClick={() => setActiveTab('scales')}
                onMouseEnter={() => setHoveredTab('scales')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Book size={14} /> Scales
              </button>
              <button 
                className={`btn-glass ${activeTab === 'studio' ? 'active' : ''}`}
                onClick={() => setActiveTab('studio')}
                onMouseEnter={() => setHoveredTab('studio')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Activity size={14} /> Studio
              </button>
              <button 
                className={`btn-glass ${activeTab === 'project' ? 'active' : ''}`}
                onClick={() => setActiveTab('project')}
                onMouseEnter={() => setHoveredTab('project')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Folder size={14} /> Project
              </button>
              <button 
                className={`btn-glass ${activeTab === 'virtues' ? 'active' : ''}`}
                onClick={() => setActiveTab('virtues')}
                onMouseEnter={() => setHoveredTab('virtues')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Shield size={14} /> Virtues
              </button>
              <button 
                className={`btn-glass ${activeTab === 'training' ? 'active' : ''}`}
                onClick={() => setActiveTab('training')}
                onMouseEnter={() => setHoveredTab('training')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Target size={14} /> Training
              </button>
              <button 
                className={`btn-glass ${activeTab === 'garden' ? 'active' : ''}`}
                onClick={() => setActiveTab('garden')}
                onMouseEnter={() => setHoveredTab('garden')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Sprout size={14} /> Garden
              </button>
              <button 
                className={`btn-glass ${activeTab === 'quests' ? 'active' : ''}`}
                onClick={() => setActiveTab('quests')}
                onMouseEnter={() => setHoveredTab('quests')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Trophy size={14} /> Quests
              </button>
              <button 
                className={`btn-glass ${activeTab === 'realms' ? 'active' : ''}`}
                onClick={() => setActiveTab('realms')}
                onMouseEnter={() => setHoveredTab('realms')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Compass size={14} /> Realms
              </button>
              <button 
                className={`btn-glass ${activeTab === 'social' ? 'active' : ''}`}
                onClick={() => setActiveTab('social')}
                onMouseEnter={() => setHoveredTab('social')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Share2 size={14} /> Share
              </button>
              <button 
                className={`btn-glass ${activeTab === 'workflow' ? 'active' : ''}`}
                onClick={() => setActiveTab('workflow')}
                onMouseEnter={() => setHoveredTab('workflow')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Sparkles size={14} /> Workflow
              </button>
              <button 
                className={`btn-glass ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
                onMouseEnter={() => setHoveredTab('analysis')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <BarChart3 size={14} /> Analysis
              </button>
              <button 
                className={`btn-glass ${activeTab === 'jam' ? 'active' : ''}`}
                onClick={() => setActiveTab('jam')}
                onMouseEnter={() => setHoveredTab('jam')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Users size={14} /> Jam
              </button>
              <button 
                className={`btn-glass ${activeTab === 'arranger' ? 'active' : ''}`}
                onClick={() => setActiveTab('arranger')}
                onMouseEnter={() => setHoveredTab('arranger')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Layers size={14} /> Arranger
              </button>
              <button 
                className={`btn-glass ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
                onMouseEnter={() => setHoveredTab('performance')}
                onMouseLeave={() => setHoveredTab(null)}
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
              >
                <Zap size={14} /> Live
              </button>
              <button 
                className={`btn-glass ${activeTab === 'market' ? 'active' : ''}`}
                onClick={() => setActiveTab('market')}
                onMouseEnter={() => setHoveredTab('market')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Crown size={14} /> Market
              </button>
              <button 
                className={`btn-glass ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => setActiveTab('learning')}
                onMouseEnter={() => setHoveredTab('learning')}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Book size={14} /> Learning
              </button>
              <button 
                className={`btn-glass ${activeTab === 'training' ? 'active' : ''}`}
                onClick={() => setActiveTab('training')}
                onMouseEnter={() => setHoveredTab('training')}
                onMouseLeave={() => setHoveredTab(null)}
                style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
              >
                <Target size={14} /> Training
              </button>
              <button 
                className={`btn-glass ${activeTab === 'realms' ? 'active' : ''}`}
                onClick={() => setActiveTab('realms')}
                onMouseEnter={() => setHoveredTab('realms')}
                onMouseLeave={() => setHoveredTab(null)}
                style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
              >
                <Compass size={14} /> Realms
              </button>
              <button 
                className={`btn-glass ${activeTab === 'virtues' ? 'active' : ''}`}
                onClick={() => setActiveTab('virtues')}
                onMouseEnter={() => setHoveredTab('virtues')}
                onMouseLeave={() => setHoveredTab(null)}
                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                <Shield size={14} /> Virtues
              </button>
            </nav>
          </motion.header>
    )}
  </AnimatePresence>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence>
            {isZenMode && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="btn-glass"
                onClick={() => setIsZenMode(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  zIndex: 2000,
                  background: 'rgba(0,0,0,0.6)',
                  borderColor: 'var(--accent-primary)',
                  boxShadow: '0 0 20px var(--accent-glow)'
                }}
              >
                <Zap size={16} color="var(--accent-primary)" /> Exit Zen Mode
              </motion.button>
            )}
          </AnimatePresence>
        <div style={{ flex: 1, padding: '20px 40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'piano' && (
              <motion.div
                key="piano"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Grand Piano</h2>
                <Piano />
              </motion.div>
            )}

            {activeTab === 'violin' && (
              <motion.div
                key="violin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Synthesized Violin</h2>
                <Violin />
              </motion.div>
            )}

            {activeTab === 'cello' && (
              <motion.div
                key="cello"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Resonant Cello</h2>
                <Cello />
              </motion.div>
            )}

            {activeTab === 'guitar' && (
              <motion.div
                key="guitar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Virtual Guitar</h2>
                <Guitar />
              </motion.div>
            )}

            {activeTab === 'drums' && (
              <motion.div
                key="drums"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Drum Sequencer</h2>
                <DrumSequencer />
              </motion.div>
            )}

            {activeTab === 'pads' && (
              <motion.div
                key="pads"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '600px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Drum Pads</h2>
                <DrumPad />
              </motion.div>
            )}

            {activeTab === 'sampler' && (
              <motion.div
                key="sampler"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Sound Sampler</h2>
                <Sampler />
              </motion.div>
            )}

            {activeTab === 'synth' && (
              <motion.div
                key="synth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Custom Synthesizer</h2>
                <Synthesizer />
              </motion.div>
            )}

            {activeTab === 'seq' && (
              <motion.div
                key="seq"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Melodic Step Sequencer</h2>
                <MelodicSequencer />
              </motion.div>
            )}

            {activeTab === 'bass' && (
              <motion.div
                key="bass"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Monophonic Bass Synth</h2>
                <BassSynth />
              </motion.div>
            )}

            {activeTab === 'granular' && (
              <motion.div
                key="granular"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <GranularSynthesizer />
              </motion.div>
            )}

            {activeTab === 'looper' && (
              <motion.div
                key="looper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Multi-track Looper</h2>
                <MultiTrackLooper />
              </motion.div>
            )}

            {activeTab === 'cloud' && (
              <motion.div
                key="cloud"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <CloudMachine />
              </motion.div>
            )}

            {activeTab === 'ambient' && (
              <motion.div
                key="ambient"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Ambient Pad Synth</h2>
                <AmbientPad />
              </motion.div>
            )}

            {activeTab === 'vocal' && (
              <motion.div
                key="vocal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Vocal Processor</h2>
                <VocalProcessor />
              </motion.div>
            )}

            {activeTab === 'scales' && (
              <motion.div
                key="scales"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Scale Explorer</h2>
                <ScaleExplorer />
              </motion.div>
            )}

            {activeTab === 'theremin' && (
              <motion.div
                key="theremin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Experimental Theremin</h2>
                <Theremin />
              </motion.div>
            )}

            {activeTab === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Recording Studio</h2>
                <RecordingGallery recordings={recordings} onDelete={deleteRecording} onRename={renameRecording} />
              </motion.div>
            )}

            {activeTab === 'project' && (
              <motion.div
                key="project"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <ProjectManager 
                  onSave={() => {}} // Not strictly needed as logic is inside ProjectManager
                  onLoad={(data) => {
                    if (data.theme) handleThemeChange(data.theme);
                    if (data.customAccent) setCustomAccent(data.customAccent);
                    if (data.activeTab) setActiveTab(data.activeTab);
                    if (data.masterVolume !== undefined) setMasterVolume(data.masterVolume);
                    // For recordings, we'd need to handle blobs carefully if they were saved
                  }}
                  currentData={{
                    theme,
                    customAccent,
                    activeTab,
                    masterVolume,
                    timestamp: Date.now()
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>AI Music Generator</h2>
                <AIMusicGenerator onGenerate={(composition) => console.log('AI Composition:', composition)} />
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Social Sharing</h2>
                <SocialSharing composition={{}} onShareComplete={(id, link) => console.log('Shared:', id, link)} />
              </motion.div>
            )}

            {activeTab === 'workflow' && (
              <motion.div
                key="workflow"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Workflow Automation</h2>
                <WorkflowAutomation />
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Music Theory Analysis</h2>
                <MusicTheoryAnalysis />
              </motion.div>
            )}

            {activeTab === 'jam' && (
              <motion.div
                key="jam"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Jam Session</h2>
                <JamSession />
              </motion.div>
            )}

            {activeTab === 'arranger' && (
              <motion.div
                key="arranger"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Pattern Arranger</h2>
                <PatternArranger />
              </motion.div>
            )}

            {activeTab === 'themes' && (
              <motion.div
                key="themes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Studio Theme Editor</h2>
                <ThemeEditor 
                  currentTheme={theme} 
                  onThemeChange={handleThemeChange}
                  customAccent={customAccent}
                  onAccentChange={handleAccentChange}
                />
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <PerformanceDashboard />
              </motion.div>
            )}

            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Collaboration Marketplace</h2>
                <CollaborationMarketplace />
              </motion.div>
            )}

            {activeTab === 'learning' && (
              <motion.div
                key="learning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1200px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
              >
                <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.8 }}>Learning Progression</h2>
                <LearningProgression />
              </motion.div>
            )}

            {activeTab === 'training' && (
              <motion.div
                key="training"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <VirtueTraining />
              </motion.div>
            )}

            {activeTab === 'realms' && (
              <motion.div
                key="realms"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <VirtueRealms />
              </motion.div>
            )}

            {activeTab === 'virtues' && (
              <motion.div
                key="virtues"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Virtues stats={sessionStats} />
              </motion.div>
            )}

            {activeTab === 'garden' && (
              <motion.div
                key="garden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <VirtuoGarden />
              </motion.div>
            )}

            {activeTab === 'quests' && (
              <motion.div
                key="quests"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <DailyQuests />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Persistent Visualizer at bottom */}
        <div style={{ height: '80px', padding: '0 40px', marginBottom: '10px' }}>
          <AudioVisualizer />
        </div>

        {/* Collapsible Utility Panel */}
        <AnimatePresence>
          {showUtilities && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderTop: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                padding: '20px 40px', 
                display: 'flex', 
                gap: '20px', 
                alignItems: 'flex-start', 
                overflowX: 'auto',
                paddingBottom: '30px',
                scrollSnapType: 'x proximity'
              }} className="no-scrollbar">
                {/* Categorized Tools */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Audio Analysis Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Analysis</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <MasterSpectralAnalyzer />
                      <MasterOscilloscope />
                      <SpectrumAnalyser />
                      <MasterMetering />
                    </div>
                  </div>

                  {/* Processing Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>Dynamics & FX</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <MasterFX />
                      <VUMeter />
                      <Mixer />
                      <MultibandCompressor />
                      <ParametricMasterEQ />
                      <MasteringLimiter />
                      <FrequencyShifter />
                      <GlitchRack />
                      <SidechainCompressor />
                      <ConvolutionReverb />
                      <TransientShaper />
                      <AutoFilter />
                      <PitchShifter />
                      <StereoImager />
                      <NoiseGate />
                    </div>
                  </div>

                  {/* Performance & Utilities Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>Performance</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <BPMTapper />
                      <Metronome />
                      <Tuner />
                      <Arpeggiator />
                      <Looper />
                      <Soundboard />
                      <SessionLoopRecorder />
                    </div>
                  </div>

                  {/* Routing & Modulation Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '1px' }}>Routing & Modulation</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <ModulationMatrix />
                      <PatchBay />
                      <TrackGrouping />
                    </div>
                  </div>

                  {/* Composition Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>Composition</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <ChordProgression />
                      <AIChordSuggestions />
                      <AIMelodicExplorer />
                      <ChordDictionary />
                      <MiniPianoRoll />
                      <LyricWriter />
                      <BeatSlicer />
                      <RiffGenerator />
                      <MacroDashboard />
                      <Harmonizer />
                      <LoopLibrary />
                      <Humanizer />
                    </div>
                  </div>

                  {/* System & Export Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Studio</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <SessionSettings />
                      <SnapshotManager />
                      <MasterPluginRack />
                      <AudioExport />
                      <MidiManager onNoteOn={handleMidiNoteOn} onNoteOff={handleMidiNoteOff} />
                      <MidiFileHandler />
                      <MidiMapper />
                      <MidiCCManager />
                      <ThemeCustomizer />
                      <AccessibilityPanel />
                    </div>
                  </div>

                  {/* Emergency Group */}
                  <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', width: '200px', alignItems: 'center', justifyContent: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ef4444' }}>Emergency</h4>
                    <button 
                      className="btn-glass"
                      onClick={() => {
                        Tone.Destination.mute = true;
                        setTimeout(() => { Tone.Destination.mute = false; }, 100);
                        Tone.Transport.stop();
                      }}
                      style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <Skull size={16} /> PANIC
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onCommand={handleCommand}
      />

      <AnimatePresence>
        {showGuide && (
          <OnboardingGuide onClose={() => {
            setShowGuide(false);
            localStorage.setItem('virtuo_onboarding_seen', 'true');
          }} />
        )}
      </AnimatePresence>
      
      <VirtueNotification />
    </div>
    </MobileLayout>
  );
}

export default App;
