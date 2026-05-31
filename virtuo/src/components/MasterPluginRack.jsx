import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Layers, Plus, Trash2, Sliders, Zap, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

const EFFECT_TYPES = [
  { id: 'chorus', name: 'Chorus', class: Tone.Chorus, params: { frequency: 4, delayTime: 2.5, depth: 0.5 } },
  { id: 'phaser', name: 'Phaser', class: Tone.Phaser, params: { frequency: 0.5, octaves: 3, baseFrequency: 350 } },
  { id: 'tremolo', name: 'Tremolo', class: Tone.Tremolo, params: { frequency: 10, depth: 0.5 } },
  { id: 'vibrato', name: 'Vibrato', class: Tone.Vibrato, params: { frequency: 5, depth: 0.1 } },
  { id: 'auto_wah', name: 'AutoWah', class: Tone.AutoWah, params: { baseFrequency: 50, octaves: 6, sensitivity: -40 } },
];

export default function MasterPluginRack() {
  const [slots, setSlots] = useState([null, null, null, null]);
  const effectsRef = useRef([]);

  const addEffect = (slotIndex, effectId) => {
    const config = EFFECT_TYPES.find(e => e.id === effectId);
    if (!config) return;

    const effect = new config.class(config.params).start();
    // Connect in series or parallel? Let's do a simple serial chain for now
    // Actually, connecting to masterBus is easier for this demo
    effect.connect(masterBus);
    
    const newSlots = [...slots];
    newSlots[slotIndex] = { id: effectId, name: config.name, effect };
    setSlots(newSlots);
    effectsRef.current[slotIndex] = effect;
  };

  const removeEffect = (slotIndex) => {
    if (effectsRef.current[slotIndex]) {
      effectsRef.current[slotIndex].dispose();
      effectsRef.current[slotIndex] = null;
    }
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
  };

  useEffect(() => {
    return () => {
      effectsRef.current.forEach(e => e?.dispose());
    };
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Layers size={20} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Master Plugin Rack</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {slots.map((slot, i) => (
          <div key={i} className="glass-panel" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderStyle: slot ? 'solid' : 'dashed', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 800 }}>SLOT {i + 1}</span>
              {slot && (
                <button onClick={() => removeEffect(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {!slot ? (
              <select 
                onChange={(e) => addEffect(i, e.target.value)}
                className="btn-glass"
                style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
                defaultValue=""
              >
                <option value="" disabled>+ Load Effect</option>
                {EFFECT_TYPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--accent-glow)' }}>
                  <Zap size={20} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{slot.name}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>ACTIVE • SERIAL</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center' }}>
        Add up to 4 effects to the master signal chain.
      </div>
    </div>
  );
}
