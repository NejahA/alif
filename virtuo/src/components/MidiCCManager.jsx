import React, { useState, useEffect } from 'react';
import { Settings, Link, Unlink, MousePointer2 } from 'lucide-react';

export default function MidiCCManager() {
  const [mappings, setMappings] = useState(() => {
    const saved = localStorage.getItem('virtuo_midi_cc_mappings');
    return saved ? JSON.parse(saved) : {};
  });
  const [learningParam, setLearningParam] = useState(null); // { instrumentId, paramId }

  useEffect(() => {
    const handleMidiCC = (e) => {
      const { ccNumber, ccValue } = e.detail;

      if (learningParam) {
        // Map current CC to the parameter being learned
        const newMappings = { ...mappings };
        newMappings[ccNumber] = { 
          instrumentId: learningParam.instrumentId, 
          paramId: learningParam.paramId 
        };
        setMappings(newMappings);
        localStorage.setItem('virtuo_midi_cc_mappings', JSON.stringify(newMappings));
        setLearningParam(null);
        
        // Notify user
        window.dispatchEvent(new CustomEvent('virtuo-notification', {
          detail: { 
            message: `Linked CC ${ccNumber} to ${learningParam.paramId}`,
            type: 'success'
          }
        }));
      } else {
        // Apply existing mapping
        const mapping = mappings[ccNumber];
        if (mapping) {
          window.dispatchEvent(new CustomEvent('virtuo-automation-play', {
            detail: {
              instrumentId: mapping.instrumentId,
              paramId: mapping.paramId,
              value: ccValue
            }
          }));
        }
      }
    };

    const handleStartLearn = (e) => {
      setLearningParam(e.detail);
      window.dispatchEvent(new CustomEvent('virtuo-notification', {
        detail: { 
          message: `Move a MIDI knob to link ${e.detail.paramId}...`,
          type: 'info'
        }
      }));
    };

    window.addEventListener('virtuo-midi-cc', handleMidiCC);
    window.addEventListener('virtuo-midi-learn-start', handleStartLearn);
    
    return () => {
      window.removeEventListener('virtuo-midi-cc', handleMidiCC);
      window.removeEventListener('virtuo-midi-learn-start', handleStartLearn);
    };
  }, [learningParam, mappings]);

  const clearMappings = () => {
    setMappings({});
    localStorage.removeItem('virtuo_midi_cc_mappings');
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Link size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>MIDI CC Mapping</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
        {Object.entries(mappings).length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No mappings yet. Right-click a slider to Learn!</p>
        ) : (
          Object.entries(mappings).map(([cc, map]) => (
            <div key={cc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>
              <span>CC {cc}</span>
              <span style={{ opacity: 0.5 }}>→</span>
              <span style={{ color: 'var(--accent-primary)' }}>{map.paramId}</span>
              <button 
                onClick={() => {
                  const newMappings = { ...mappings };
                  delete newMappings[cc];
                  setMappings(newMappings);
                  localStorage.setItem('virtuo_midi_cc_mappings', JSON.stringify(newMappings));
                }}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 5px' }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <button className="btn-glass" onClick={clearMappings} style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
        <Unlink size={14} /> Clear All Mappings
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.6 }}>
        <MousePointer2 size={12} />
        <span style={{ fontSize: '0.6rem' }}>Tip: Right-click any control to MIDI Learn</span>
      </div>
    </div>
  );
}
