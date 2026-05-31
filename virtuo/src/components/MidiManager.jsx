import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Keyboard, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MidiManager({ onNoteOn, onNoteOff }) {
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState('checking'); // 'checking' | 'supported' | 'unsupported'
  const [midiLog, setMidiLog] = useState([]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setStatus('unsupported');
      return;
    }

    const onMIDISuccess = (midiAccess) => {
      setStatus('supported');
      updateDevices(midiAccess);
      midiAccess.onstatechange = () => updateDevices(midiAccess);
    };

    const onMIDIFailure = () => {
      setStatus('unsupported');
    };

    const updateDevices = (midiAccess) => {
      const inputs = [];
      midiAccess.inputs.forEach((input) => {
        inputs.push({ id: input.id, name: input.name, manufacturer: input.manufacturer });
        input.onmidimessage = handleMidiMessage;
      });
      setDevices(inputs);
    };

    const handleMidiMessage = (message) => {
      const [command, data1, data2] = message.data;
      
      // command 144 = note on, 128 = note off, 176-191 = CC (on channels 1-16)
      if (command >= 144 && command <= 159 && data2 > 0) {
        const noteName = Tone.Frequency(data1, "midi").toNote();
        if (onNoteOn) onNoteOn(noteName, data2 / 127);
        addLog(`Note On: ${noteName} (${data2})`);
      } else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && data2 === 0)) {
        const noteName = Tone.Frequency(data1, "midi").toNote();
        if (onNoteOff) onNoteOff(noteName);
        addLog(`Note Off: ${noteName}`);
      } else if (command >= 176 && command <= 191) {
        // Control Change
        const ccNumber = data1;
        const ccValue = data2 / 127;
        window.dispatchEvent(new CustomEvent('virtuo-midi-cc', {
          detail: { ccNumber, ccValue }
        }));
        addLog(`CC: ${ccNumber} Val: ${data2}`);
      }
    };

    const addLog = (msg) => {
      setMidiLog(prev => [msg, ...prev].slice(0, 5));
    };

    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  }, [onNoteOn, onNoteOff]);

  return (
    <div className="glass-panel" style={{ padding: '15px 20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Keyboard size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>MIDI Input</h3>
        </div>
        {status === 'supported' ? (
          <CheckCircle2 size={16} color="#22c55e" />
        ) : (
          <AlertCircle size={16} color="#ef4444" />
        )}
      </div>

      <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {status === 'unsupported' && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Web MIDI not supported in this environment.
          </p>
        )}
        {status === 'supported' && devices.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            No MIDI devices detected. Connect a keyboard!
          </p>
        )}
        {devices.map(device => (
          <div key={device.id} style={{ 
            padding: '8px 12px', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '6px',
            fontSize: '0.75rem',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ fontWeight: 600 }}>{device.name}</div>
            <div style={{ opacity: 0.5, fontSize: '0.65rem' }}>{device.manufacturer || 'Generic'}</div>
          </div>
        ))}
      </div>

      {midiLog.length > 0 && (
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Recent Activity</div>
          {midiLog.map((log, i) => (
            <div key={i} style={{ fontSize: '0.7rem', opacity: 1 - i * 0.2, color: 'var(--accent-primary)' }}>
              {log}
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Notes are routed to the active instrument.
      </p>
    </div>
  );
}
