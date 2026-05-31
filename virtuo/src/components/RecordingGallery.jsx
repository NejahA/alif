import React from 'react';
import { Download, Play, Trash2, Calendar, Edit2, Check, X } from 'lucide-react';

export default function RecordingGallery({ recordings, onDelete, onRename }) {
  const [editingId, setEditingId] = React.useState(null);
  const [editName, setEditName] = React.useState('');

  const handleRename = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = (id) => {
    if (editName.trim()) {
      onRename(id, editName);
    }
    setEditingId(null);
  };
  const handleDownload = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.webm`;
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
            {editingId === rec.id ? (
              <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                <input 
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveRename(rec.id)}
                  style={{ 
                    flex: 1, 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px solid var(--accent-primary)', 
                    color: 'white',
                    fontSize: '0.9rem',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                />
                <button onClick={() => saveRename(rec.id)} style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16} /></button>
                <button onClick={() => setEditingId(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{rec.name}</h4>
                  <button 
                    onClick={() => handleRename(rec.id, rec.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: 0 }}
                  >
                    <Edit2 size={12} color="var(--text-muted)" />
                  </button>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {rec.date}
                </span>
              </>
            )}
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
            <button 
              className="btn-glass" 
              onClick={() => onDelete(rec.id)}
              style={{ padding: '8px', flex: 0.5, justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
