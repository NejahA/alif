import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { Download, Play, Square } from 'lucide-react';

export default function Recorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // Setup Media Recorder destination
    const dest = Tone.context.createMediaStreamDestination();
    Tone.Destination.connect(dest);
    
    const mediaRecorder = new MediaRecorder(dest.stream);
    
    mediaRecorder.ondataavailable = evt => {
      if (evt.data && evt.data.size > 0) {
        chunksRef.current.push(evt.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      if (onRecordingComplete) {
        onRecordingComplete(blob);
      }
      chunksRef.current = [];
    };
    mediaRecorderRef.current = mediaRecorder;

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [onRecordingComplete]);

  const handleRecord = async () => {
    await Tone.start();
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div style={{
      padding: '10px 15px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>RECORDER</span>
      
      <button 
        className={`btn-glass ${isRecording ? 'active' : ''}`}
        onClick={handleRecord}
        style={{ 
          background: isRecording ? '#dc2626' : undefined, 
          borderColor: isRecording ? '#ef4444' : undefined,
          padding: '5px 15px',
          fontSize: '0.8rem'
        }}
      >
        {isRecording ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start</>}
      </button>
    </div>
  );
}
