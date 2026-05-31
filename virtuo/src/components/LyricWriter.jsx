import React, { useState, useEffect } from 'react';
import { FileText, Save, Trash2, Download, Plus, Music, Sparkles, Brain, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LyricWriter() {
  const [lyrics, setLyrics] = useState('');
  const [title, setTitle] = useState('Untitled Song');
  const [savedSongs, setSavedSongs] = useState([]);
  const [isSaved, setIsSaved] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('virtuo_lyrics');
    if (saved) {
      setSavedSongs(JSON.parse(saved));
    }
  }, []);

  const saveLyrics = () => {
    const newSongs = [...savedSongs];
    const existingIndex = newSongs.findIndex(s => s.title === title);
    
    if (existingIndex >= 0) {
      newSongs[existingIndex] = { title, content: lyrics, date: new Date().toLocaleString() };
    } else {
      newSongs.push({ title, content: lyrics, date: new Date().toLocaleString() });
    }
    
    setSavedSongs(newSongs);
    localStorage.setItem('virtuo_lyrics', JSON.stringify(newSongs));
    setIsSaved(true);
  };

  const deleteSong = (t) => {
    const newSongs = savedSongs.filter(s => s.title !== t);
    setSavedSongs(newSongs);
    localStorage.setItem('virtuo_lyrics', JSON.stringify(newSongs));
  };

  const loadSong = (song) => {
    setTitle(song.title);
    setLyrics(song.content);
    setIsSaved(true);
  };

  const downloadLyrics = () => {
    const blob = new Blob([lyrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAILyrics = () => {
    setIsGenerating(true);
    // Mock AI Generation
    const topics = ["midnight neon", "digital heartbeat", "analog nostalgia", "electric storm", "silicon dreams"];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    setTimeout(() => {
      const aiLyrics = `(Verse 1)\nWalking through the ${topic} light\nFading shadows in the night\nCode is pulse and sound is air\nIn this world beyond compare\n\n(Chorus)\nOh, the studio is breathing now\nFeel the rhythm, show me how\nVirtuo dreams in shades of gold\nA story that's never been told.`;
      setLyrics(prev => prev + (prev ? "\n\n" : "") + aiLyrics);
      setIsGenerating(false);
      setIsSaved(false);
    }, 1500);
  };

  const generateRhyme = () => {
    const lastWord = lyrics.trim().split(/\s+/).pop().toLowerCase();
    const mockDictionary = {
      'light': ['night', 'sight', 'bright', 'fight', 'height'],
      'air': ['care', 'flare', 'stare', 'where', 'glare'],
      'gold': ['told', 'sold', 'bold', 'cold', 'hold'],
      'now': ['how', 'wow', 'bow', 'cow', 'plow']
    };
    
    const suggestions = mockDictionary[lastWord] || ["Flow", "Glow", "Know", "Show", "Slow", "Grow"];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    alert(`Rhyme suggestion for "${lastWord}": ${random}`);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <FileText size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Lyric Writer</h3>
        {!isSaved && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => { setTitle(e.target.value); setIsSaved(false); }}
          placeholder="Song Title"
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            color: 'white', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}
        />
        <textarea 
          value={lyrics}
          onChange={(e) => { setLyrics(e.target.value); setIsSaved(false); }}
          placeholder="Write your lyrics here..."
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            height: '200px',
            resize: 'none',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button className="btn-glass" onClick={saveLyrics} title="Save">
          <Save size={14} />
        </button>
        <button className="btn-glass" onClick={downloadLyrics} title="Download">
          <Download size={14} />
        </button>
        <button className="btn-glass" onClick={() => { setLyrics(''); setTitle('Untitled Song'); }} title="New">
          <Plus size={14} />
        </button>
        <button className="btn-glass" onClick={generateRhyme} title="Rhyme Helper">
          <Sparkles size={14} />
        </button>
        <button className={`btn-glass ${isGenerating ? 'active' : ''}`} onClick={generateAILyrics} title="AI Lyric Idea" disabled={isGenerating}>
          {isGenerating ? <Brain size={14} className="animate-pulse" /> : <Wand2 size={14} />}
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <h4 style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' }}>Saved Drafts</h4>
        <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {savedSongs.map((song, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '5px 8px', borderRadius: '4px' }}>
              <span 
                style={{ fontSize: '0.8rem', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}
                onClick={() => loadSong(song)}
              >
                {song.title}
              </span>
              <button 
                onClick={() => deleteSong(song.title)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {savedSongs.length === 0 && <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>No saved drafts</span>}
        </div>
      </div>
    </div>
  );
}
