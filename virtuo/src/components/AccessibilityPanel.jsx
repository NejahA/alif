import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Volume2, VolumeX, Keyboard, MousePointer, ZoomIn, ZoomOut, 
         Contrast, Palette, Clock, AlertCircle, CheckCircle, Activity, 
         Mic, MessageSquare, Settings, RotateCcw } from 'lucide-react';

const AccessibilityPanel = () => {
  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    const saved = localStorage.getItem('virtuo_accessibility');
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      colorBlindMode: 'none',
      audioCues: true,
      visualCues: true,
      fontSize: 'normal',
      animationSpeed: 'normal',
      focusHighlight: true,
      tooltips: true
    };
  });

  const [activeTab, setActiveTab] = useState('visual');
  const [currentShortcut, setCurrentShortcut] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const audioContextRef = useRef(null);
  const beepSoundRef = useRef(null);

  // Accessibility shortcuts
  const shortcuts = {
    'Alt+1': 'Toggle High Contrast',
    'Alt+2': 'Toggle Reduced Motion',
    'Alt+3': 'Toggle Large Text',
    'Alt+4': 'Toggle Screen Reader Mode',
    'Alt+5': 'Toggle Keyboard Navigation',
    'Alt+0': 'Show Accessibility Panel'
  };

  // Color blindness simulations
  const colorBlindTypes = {
    none: { name: 'Normal Vision', filter: '' },
    protanopia: { name: 'Protanopia (Red-Blind)', filter: 'protanopia' },
    deuteranopia: { name: 'Deuteranopia (Green-Blind)', filter: 'deuteranopia' },
    tritanopia: { name: 'Tritanopia (Blue-Blind)', filter: 'tritanopia' },
    achromatopsia: { name: 'Achromatopsia (Total Color Blindness)', filter: 'grayscale(100%)' }
  };

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('virtuo_accessibility', JSON.stringify(accessibilitySettings));
    
    // Apply accessibility settings to document
    applyAccessibilitySettings();
    
    // Initialize audio context for accessibility cues
    if (accessibilitySettings.audioCues && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Setup keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.altKey && e.key >= '0' && e.key <= '5') {
        e.preventDefault();
        handleAccessibilityShortcut(e.key);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accessibilitySettings]);

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // High Contrast
    if (accessibilitySettings.highContrast) {
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-muted', '#cccccc');
      root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.9)');
      root.style.setProperty('--glass-border', '#ffffff');
    } else {
      root.style.removeProperty('--text-main');
      root.style.removeProperty('--text-muted');
      root.style.removeProperty('--glass-bg');
      root.style.removeProperty('--glass-border');
    }
    
    // Reduced Motion
    if (accessibilitySettings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01s');
      root.style.setProperty('--transition-duration', '0.01s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Large Text
    if (accessibilitySettings.largeText) {
      root.style.setProperty('--base-font-size', '18px');
    } else {
      root.style.setProperty('--base-font-size', '16px');
    }
    
    // Focus Highlight
    if (accessibilitySettings.focusHighlight) {
      document.body.classList.add('accessibility-focus-active');
    } else {
      document.body.classList.remove('accessibility-focus-active');
    }
  };

  const toggleSetting = (setting) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    if (accessibilitySettings.audioCues) {
      playFeedbackSound();
    }
  };

  const handleAccessibilityShortcut = (key) => {
    switch (key) {
      case '1': toggleSetting('highContrast'); break;
      case '2': toggleSetting('reducedMotion'); break;
      case '3': toggleSetting('largeText'); break;
      case '4': toggleSetting('screenReader'); break;
      case '5': toggleSetting('keyboardNavigation'); break;
      case '0': setActiveTab('visual'); break;
      default: break;
    }
  };

  const playFeedbackSound = () => {
    if (!audioContextRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.1);
  };

  const resetSettings = () => {
    setAccessibilitySettings({
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      colorBlindMode: 'none',
      audioCues: true,
      visualCues: true,
      fontSize: 'normal',
      animationSpeed: 'normal',
      focusHighlight: true,
      tooltips: true
    });
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  return (
    <div className="accessibility-panel glass-panel" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Settings size={28} color="var(--accent-primary)" />
          <h2 style={{ margin: 0 }}>Accessibility Center</h2>
        </div>
        <button className="btn-glass" onClick={resetSettings}>
          <RotateCcw size={18} /> Reset Defaults
        </button>
      </div>

      <div className="panel-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button 
          className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
          onClick={() => setActiveTab('visual')}
        >
          <Eye size={18} /> Visual
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Volume2 size={18} /> Audio & Feedback
        </button>
        <button 
          className={`tab-btn ${activeTab === 'interaction' ? 'active' : ''}`}
          onClick={() => setActiveTab('interaction')}
        >
          <Keyboard size={18} /> Interaction
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
          onClick={() => setActiveTab('shortcuts')}
        >
          <Clock size={18} /> Shortcuts
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'visual' && (
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.highContrast} 
                onChange={() => toggleSetting('highContrast')}
              />
              <Contrast size={18} />
              High Contrast Mode
              <span className="accessibility-description">Enhances visibility with stark color differences</span>
            </label>

            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.reducedMotion} 
                onChange={() => toggleSetting('reducedMotion')}
              />
              <Activity size={18} />
              Reduced Motion
              <span className="accessibility-description">Minimizes animations and transitions</span>
            </label>

            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.largeText} 
                onChange={() => toggleSetting('largeText')}
              />
              <ZoomIn size={18} />
              Large Text Support
              <span className="accessibility-description">Increases base font size for better readability</span>
            </label>

            <div className="setting-card glass-panel" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Palette size={18} />
                Color Blindness Filter
              </div>
              <select 
                value={accessibilitySettings.colorBlindMode}
                onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, colorBlindMode: e.target.value }))}
                className="select-glass"
                style={{ width: '100%' }}
              >
                {Object.entries(colorBlindTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.audioCues} 
                onChange={() => toggleSetting('audioCues')}
              />
              <Volume2 size={18} />
              Audio Cues
              <span className="accessibility-description">Play sounds for important actions and alerts</span>
            </label>

            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.visualCues} 
                onChange={() => toggleSetting('visualCues')}
              />
              <Eye size={18} />
              Visual Feedback
              <span className="accessibility-description">Flash screen or show indicators for audio events</span>
            </label>

            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.screenReader} 
                onChange={() => toggleSetting('screenReader')}
              />
              <Mic size={18} />
              Screen Reader Mode
              <span className="accessibility-description">Enhanced ARIA labels and semantics</span>
            </label>
          </div>
        )}

        {activeTab === 'interaction' && (
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.keyboardNavigation} 
                onChange={() => toggleSetting('keyboardNavigation')}
              />
              <Keyboard size={18} />
              Keyboard Navigation
              <span className="accessibility-description">Optimize workflow for keyboard-only usage</span>
            </label>

            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.focusHighlight} 
                onChange={() => toggleSetting('focusHighlight')}
              />
              <MousePointer size={18} />
              Enhanced Focus Ring
              <span className="accessibility-description">Stronger visual indication of current focus</span>
            </label>

            <label className="setting-card glass-panel">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.tooltips} 
                onChange={() => toggleSetting('tooltips')}
              />
              <MessageSquare size={18} />
              Enhanced Tooltips
              <span className="accessibility-description">Detailed descriptions for all controls</span>
            </label>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="shortcuts-list glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Accessibility Shortcuts</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {Object.entries(shortcuts).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                  <code style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{key}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="confirmation-toast"
            style={{ 
              position: 'fixed', 
              bottom: '40px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              background: 'var(--accent-primary)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 1000
            }}
          >
            <CheckCircle size={18} /> Settings reset to defaults
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .setting-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          flex-wrap: wrap;
        }
        
        .setting-card:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--accent-primary);
        }
        
        .accessibility-description {
          display: block;
          width: 100%;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 5px;
          margin-left: 33px;
        }
        
        .select-glass {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 8px;
          border-radius: 6px;
          outline: none;
        }
        
        .tab-btn {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }
        
        .tab-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
          box-shadow: 0 0 15px var(--accent-glow);
        }
        
        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
};

export default AccessibilityPanel;
