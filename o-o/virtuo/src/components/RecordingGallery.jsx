import React from 'react';
import { Download, Play, Trash2, Calendar } from 'lucide-react';

export default function RecordingGallery({ recordings }) {
  const handleDownload = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePlay = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  if (recordings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <p>No recordings yet. Start playing and use the recorder above!</p>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
      gap: '20px',
      padding: '20px',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      {recordings.map((rec) => (
        <div 
          key={rec.id} 
          className="glass-panel" 
          style={{ 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{rec.name}</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {rec.date}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button 
              className="btn-glass" 
              onClick={() => handlePlay(rec.blob)}
              style={{ padding: '8px', flex: 1, justifyContent: 'center' }}
              title="Play"
            >
              <Play size={16} />
            </button>
            <button 
              className="btn-glass" 
              onClick={() => handleDownload(rec.blob, rec.name)}
              style={{ padding: '8px', flex: 1, justifyContent: 'center' }}
              title="Download"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
