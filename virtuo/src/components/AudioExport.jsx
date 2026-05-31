import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { Download, Play, Square, Save, FileAudio, RefreshCw } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function AudioExport() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    recorderRef.current = new Tone.Recorder();
    masterBus.connect(recorderRef.current);

    return () => {
      recorderRef.current?.dispose();
    };
  }, []);

  const startRecording = async () => {
    if (!recorderRef.current) return;
    
    await Tone.start();
    recorderRef.current.start();
    setIsRecording(true);
    setRecordingTime(0);
    setAudioUrl(null);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    const blob = await recorderRef.current.stop();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const downloadRecording = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `virtuo_export_${new Date().getTime()}.webm`;
    a.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <FileAudio size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Audio Export</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          border: `2px solid ${isRecording ? '#ef4444' : 'var(--glass-border)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
          position: 'relative'
        }}>
          {isRecording && (
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#ef4444',
              animation: 'pulse 1s infinite'
            }} />
          )}
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatTime(recordingTime)}</span>
          <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>RECORDING</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {!isRecording ? (
            <button className="btn-glass" onClick={startRecording} style={{ flex: 1, color: '#ef4444' }}>
              <Play size={14} /> Start Rec
            </button>
          ) : (
            <button className="btn-glass active" onClick={stopRecording} style={{ flex: 1, background: '#ef4444' }}>
              <Square size={14} /> Stop Rec
            </button>
          )}
        </div>
      </div>

      {audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <audio src={audioUrl} controls style={{ width: '100%', height: '30px' }} />
          <button className="btn-glass active" onClick={downloadRecording} style={{ justifyContent: 'center' }}>
            <Download size={14} /> Download File
          </button>
        </div>
      )}

      <p style={{ fontSize: '0.6rem', opacity: 0.5, textAlign: 'center' }}>
        Records the master output. Ensure you play sounds while recording!
      </p>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
