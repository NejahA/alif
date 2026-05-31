import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Music } from 'lucide-react';

export default function PresetManager({ instrumentType, currentSettings, onLoadPreset }) {
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem(`virtuo_presets_${instrumentType}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem(`virtuo_presets_${instrumentType}`, JSON.stringify(presets));
  }, [presets, instrumentType]);

  const saveCurrentPreset = () => {
    const name = prompt("Enter preset name:");
    if (!name) return;
    
    const newPreset = {
      id: Date.now(),
      name,
      instrument: instrumentType,
      settings: currentSettings,
      timestamp: new Date().toISOString()
    };
    
    setPresets(prev => [...prev, newPreset]);
  };

  const loadPreset = (preset) => {
    if (onLoadPreset) {
      onLoadPreset(preset.settings);
    }
  };

  const deletePreset = (id) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      setPresets(prev => prev.filter(p => p.id !== id));
    }
  };

  const exportPresets = () => {
    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `virtuo_${instrumentType}_presets.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importPresets = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          // Filter to only include presets for this instrument type
          const validPresets = imported.filter(p => p.instrument === instrumentType);
          if (validPresets.length > 0) {
            setPresets(prev => [...prev, ...validPresets]);
            alert(`Imported ${validPresets.length} presets successfully!`);
          } else {
            alert("No valid presets found for this instrument type.");
          }
        }
      } catch (error) {
        alert("Invalid preset file format.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllPresets = () => {
    if (confirm("Are you sure you want to delete ALL presets for this instrument?")) {
      setPresets([]);
    }
  };

  return (
    <div className="glass-panel" style={{ 
      padding: '20px', 
      width: '300px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Music size={20} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Preset Manager</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          className="btn-glass"
          onClick={saveCurrentPreset}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Save size={16} />
          Save Current
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-glass"
            onClick={exportPresets}
            disabled={presets.length === 0}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Download size={16} />
            Export
          </button>
          
          <label className="btn-glass" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}>
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importPresets}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {presets.length > 0 && (
          <button
            className="btn-glass"
            onClick={clearAllPresets}
            style={{ 
              width: '100%', 
              justifyContent: 'center',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      {presets.length > 0 && (
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          padding: '10px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '6px'
        }}>
          <div style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '5px'
          }}>
            Saved Presets ({presets.length})
          </div>
          
          {presets.map(preset => (
            <div key={preset.id} style={{ 
              display: 'flex', 
              gap: '5px',
              alignItems: 'center'
            }}>
              <button
                className="btn-glass"
                onClick={() => loadPreset(preset)}
                style={{ 
                  flex: 1, 
                  justifyContent: 'flex-start', 
                  fontSize: '0.8rem', 
                  padding: '6px 10px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                title={preset.name}
              >
                {preset.name}
              </button>
              
              <button
                className="btn-glass"
                onClick={() => deletePreset(preset.id)}
                style={{ 
                  padding: '6px', 
                  borderColor: 'rgba(239, 68, 68, 0.3)', 
                  color: '#ef4444' 
                }}
                title="Delete preset"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {presets.length === 0 && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          No presets saved yet. <br />
          Adjust settings and click "Save Current" to create your first preset!
        </div>
      )}
    </div>
  );
}