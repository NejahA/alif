import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Radio, StopCircle, Play, Trash2, Clock, Activity, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutomationRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [automationData, setAutomationData] = useState([]);
  const [capturedParams, setCapturedParams] = useState(new Set());
  const recordingStartTime = useRef(0);
  const playbackTimeoutRefs = useRef([]);

  useEffect(() => {
    const handleParamChange = (e) => {
      if (!isRecording) return;
      
      const { paramId, value, instrumentId } = e.detail;
      const timestamp = Tone.Transport.seconds;
      
      setAutomationData(prev => [...prev, {
        timestamp,
        paramId,
        value,
        instrumentId
      }]);
      
      setCapturedParams(prev => new Set(prev).add(`${instrumentId}.${paramId}`));
    };

    window.addEventListener('virtuo-param-change', handleParamChange);
    return () => window.removeEventListener('virtuo-param-change', handleParamChange);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setAutomationData([]);
    setCapturedParams(new Set());
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const startPlayback = () => {
    if (automationData.length === 0) return;
    setIsPlaying(true);
    
    // Clear any existing timeouts
    playbackTimeoutRefs.current.forEach(clearTimeout);
    playbackTimeoutRefs.current = [];

    const startTime = Tone.Transport.seconds;
    
    automationData.forEach(event => {
      const delay = (event.timestamp - automationData[0].timestamp) * 1000;
      const timeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('virtuo-automation-play', {
          detail: event
        }));
      }, delay);
      playbackTimeoutRefs.current.push(timeout);
    });

    // Reset playing state after last event
    const totalDuration = (automationData[automationData.length - 1].timestamp - automationData[0].timestamp) * 1000;
    setTimeout(() => setIsPlaying(false), totalDuration + 100);
  };

  const stopPlayback = () => {
    playbackTimeoutRefs.current.forEach(clearTimeout);
    playbackTimeoutRefs.current = [];
    setIsPlaying(false);
  };

  const clearData = () => {
    setAutomationData([]);
    setCapturedParams(new Set());
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Activity size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Automation Recorder</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {!isRecording ? (
          <button className="btn-glass" onClick={startRecording} style={{ flex: 1, color: '#ef4444' }}>
            <Radio size={14} /> Record
          </button>
        ) : (
          <button className="btn-glass active" onClick={stopRecording} style={{ flex: 1, background: '#ef4444' }}>
            <StopCircle size={14} /> Stop
          </button>
        )}

        {!isPlaying ? (
          <button className="btn-glass" onClick={startPlayback} disabled={automationData.length === 0} style={{ flex: 1 }}>
            <Play size={14} /> Play
          </button>
        ) : (
          <button className="btn-glass active" onClick={stopPlayback} style={{ flex: 1 }}>
            <StopCircle size={14} /> Stop
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Captured Events:</span>
          <span>{automationData.length}</span>
        </div>
        
        <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Array.from(capturedParams).map(param => (
            <div key={param} style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
              {param}
            </div>
          ))}
          {capturedParams.size === 0 && <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>No parameters captured</span>}
        </div>
      </div>

      <button className="btn-glass" onClick={clearData} disabled={automationData.length === 0} style={{ width: '100%', justifyContent: 'center' }}>
        <Trash2 size={14} /> Clear Automation
      </button>

      <p style={{ fontSize: '0.65rem', opacity: 0.5, textAlign: 'center' }}>
        Move knobs or sliders while recording to capture automation data.
      </p>
    </div>
  );
}
