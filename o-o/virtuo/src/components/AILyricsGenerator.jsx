import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Sparkles, RefreshCw, Copy, Check, Music2, Languages, Type } from 'lucide-react';

const GENRES = [
  "Cyberpunk", "Synthwave", "Dark Pop", "Dreamy Indie", "Hardcore Techno", 
  "Ethereal Ambient", "Glitch Hop", "Neo-Soul", "Future Bass", "Lo-Fi"
];

const MOODS = [
  "Melancholy", "Euphoric", "Aggressive", "Mysterious", "Optimistic", 
  "Nostalgic", "Gritty", "Celestial", "Cybernetic", "Haunting"
];

const DICTIONARY = {
  "Cyberpunk": ["neon", "static", "silicon", "wire", "chrome", "signal", "ghost", "shell", "grid", "circuit"],
  "Synthwave": ["horizon", "drive", "retro", "glow", "midnight", "purple", "VHS", "laser", "highway", "analog"],
  "Dark Pop": ["shadow", "glass", "echo", "midnight", "blood", "velvet", "broken", "hollow", "silver", "crown"],
  "Ethereal Ambient": ["cloud", "drift", "light", "infinite", "breath", "whisper", "tide", "void", "starlight", "bloom"]
};

const AILyricsGenerator = () => {
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [topic, setTopic] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLyrics = () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const words = DICTIONARY[genre] || ["rhythm", "sound", "beat", "voice", "soul", "heart"];
      const structure = [
        "[Verse 1]",
        `In the ${mood.toLowerCase()} ${words[0]}, we find the ${words[1]}.`,
        `The ${topic || 'world'} is fading into ${words[2]} and ${words[3]}.`,
        `No more ${words[4]}, just the weight of the ${words[5]}.`,
        "",
        "[Chorus]",
        `Bring the ${genre} ${words[6]} back to life!`,
        `We're dancing on the edge of the ${words[7]}.`,
        `Feel the ${words[8]} in your ${words[9]}.`,
        `Until the ${mood.toLowerCase()} light takes us home.`,
        "",
        "[Bridge]",
        `Static in the air, ${words[0]} in the machine.`,
        `The ${topic || 'echo'} is all that's left between.`,
        "",
        "[Outro]",
        `${words[2]}... ${words[3]}...`,
        `Fading into the ${mood.toLowerCase()}...`
      ];
      
      setLyrics(structure.join('\n'));
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-lyrics-generator" style={{ width: '100%', color: 'white' }}>
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '10px' }}>
            <Sparkles color="var(--accent-primary)" /> AI Lyrics Generator
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
            Generate thematic lyrics for your tracks using simulated neural patterns.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Genre Profile</label>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Mood Setting</label>
              <select 
                value={mood} 
                onChange={(e) => setMood(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
              >
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Specific Topic (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Type size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Lost in Space, Neon Rain..."
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              onClick={generateLyrics}
              disabled={isGenerating}
              className="btn-glass"
              style={{ 
                marginTop: '10px',
                padding: '15px', 
                background: 'var(--accent-primary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                opacity: isGenerating ? 0.7 : 1
              }}
            >
              {isGenerating ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} />}
              {isGenerating ? 'ANALYZING PATTERNS...' : 'GENERATE LYRICS'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1.5, position: 'relative' }}>
          <div style={{ 
            height: '500px', 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '25px',
            overflowY: 'auto',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            color: 'rgba(255,255,255,0.9)'
          }}>
            {!lyrics && !isGenerating && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <PenTool size={48} style={{ marginBottom: '15px' }} />
                <p>Lyrics will appear here...</p>
              </div>
            )}
            
            {isGenerating && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-primary)', filter: 'blur(20px)' }}
                />
                <p style={{ marginTop: '20px', fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.6 }}>WRITING...</p>
              </div>
            )}

            {lyrics && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {lyrics}
              </motion.div>
            )}
          </div>

          {lyrics && !isGenerating && (
            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={copyToClipboard}
                className="btn-glass"
                style={{ padding: '8px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ textAlign: 'center' }}>
          <Music2 size={20} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>RHYTHM ANALYSIS</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>OPTIMIZED</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Languages size={20} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>LANGUAGE MODEL</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>V4.2 CORE</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={20} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>CREATIVITY INDEX</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>98.4%</p>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .input-group select:focus, .input-group input:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AILyricsGenerator;
