import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Mic, Square, Play, Trash2, Download, Clock, Music, Save, List, Activity } from 'lucide-react';

const PerformanceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [recordingFormat, setRecordingFormat] = useState('wav');
  const [recordMode, setRecordMode] = useState('audio');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const gainNodeRef = useRef(null);
  const playbackSourceRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('virtuo_performances');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecordings(parsed.map(r => ({ ...r, blob: null })));
      } catch (e) {
        console.error('Failed to load performances', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isRecording) {
      clearInterval(timerRef.current);
      return;
    }
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Tone.start();
      
      // Create audio context and capture Tone.js output
      const audioCtx = Tone.context.rawContext;
      const dest = audioCtx.createMediaStreamDestination();
      
      // Connect master output to the destination
      Tone.Destination.connect({
        connect: (node) => {
          const merger = audioCtx.createChannelMerger(2);
          node.connect(merger);
          merger.connect(dest);
        },
        disconnect: () => {}
      });

      const mediaRecorder = new MediaRecorder(dest.stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const newRecording = {
          id: Date.now(),
          name: `Performance ${recordings.length + 1}`,
          blob,
          duration: recordingTime,
          format: recordingFormat,
          timestamp: new Date().toLocaleString(),
          url: URL.createObjectURL(blob)
        };
        
        setRecordings(prev => [newRecording, ...prev]);
        
        if (autoSave) {
          localStorage.setItem('virtuo_performances', JSON.stringify(
            recordings.concat(newRecording).map(r => ({
              id: r.id,
              name: r.name,
              duration: r.duration,
              format: r.format,
              timestamp: r.timestamp
            }))
          ));
        }
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = dest.stream;
      setIsRecording(true);
      
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Failed to start recording. Please check your audio settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const playRecording = (recording) => {
    if (!recording.url) return;
    
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      return;
    }
    
    const player = new Tone.Player(recording.url, () => {
      player.sync().start(0);
      Tone.Transport.start();
      setIsPlaying(true);
      
      player.onstop = () => {
        setIsPlaying(false);
        Tone.Transport.stop();
      };
    }).toDestination();
    
    playbackSourceRef.current = player;
  };

  const deleteRecording = (id) => {
    setRecordings(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('virtuo_performances', JSON.stringify(
        updated.map(r => ({ id: r.id, name: r.name, duration: r.duration, format: r.format, timestamp: r.timestamp }))
      ));
      return updated;
    });
    if (selectedRecording === id) setSelectedRecording(null);
  };

  const downloadRecording = (recording) => {
    if (!recording.url) return;
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `${recording.name.replace(/\s+/g, '_')}.${recordingFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renameRecording = (id) => {
    const name = prompt('Enter new name:');
    if (!name) return;
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  };

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Performance Recorder</h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['audio'].map(mode => (
            <button
              key={mode}
              className={`btn-glass ${recordMode === mode ? 'active' : ''}`}
              onClick={() => setRecordMode(mode)}
              style={{ padding: '3px 8px', fontSize: '0.6rem' }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Record Button & Status */}
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isRecording ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
            border: isRecording ? '4px solid #ef4444' : '2px solid #ef444480',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            transition: 'all 0.2s ease',
            boxShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
            animation: isRecording ? 'pulse 1s infinite' : 'none'
          }}
        >
          {isRecording ? <Square size={20} color="white" /> : <Mic size={20} color="#ef4444" />}
        </button>
        
        {isRecording && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 0.5s infinite'
            }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
        
        {!isRecording && (
          <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Click to start recording your performance
          </div>
        )}
      </div>

      {/* Recording Options */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
          Auto-save
        </label>
        <select
          value={recordingFormat}
          onChange={(e) => setRecordingFormat(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            padding: '3px 6px',
            fontSize: '0.6rem',
            marginLeft: 'auto'
          }}
        >
          <option value="wav">WAV</option>
          <option value="mp3">MP3</option>
          <option value="flac">FLAC</option>
        </select>
      </div>

      {/* Recordings List */}
      <div style={{ flex: 1, maxHeight: '250px', overflowY: 'auto' }} className="no-scrollbar">
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <List size={10} /> Recordings ({recordings.length})
        </div>
        
        {recordings.length > 0 ? recordings.map(recording => (
          <div key={recording.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            background: selectedRecording === recording.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.15)',
            borderRadius: '6px',
            marginBottom: '4px',
            cursor: 'pointer',
            border: selectedRecording === recording.id ? '1px solid #8b5cf640' : '1px solid transparent'
          }}
            onClick={() => setSelectedRecording(recording.id === selectedRecording ? null : recording.id)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Music size={14} color="#8b5cf6" />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
                onClick={(e) => { e.stopPropagation(); renameRecording(recording.id); }}
              >
                {recording.name}
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span><Clock size={8} /> {formatTime(recording.duration)}</span>
                <span>{recording.timestamp}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); playRecording(recording); }}
                className="btn-glass"
                style={{ padding: '3px', fontSize: '0.6rem' }}
                title="Play"
              >
                <Play size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); downloadRecording(recording); }}
                className="btn-glass"
                style={{ padding: '3px', fontSize: '0.6rem' }}
                title="Download"
              >
                <Download size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteRecording(recording.id); }}
                className="btn-glass"
                style={{ padding: '3px', fontSize: '0.6rem', color: '#ef4444' }}
                title="Delete"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            No recordings yet. Start a new performance!
          </div>
        )}
      </div>

      {/* Recording Stats */}
      {recordings.length > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '8px',
          borderRadius: '6px',
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <div>Total: {recordings.length}</div>
          <div>Duration: {formatTime(recordings.reduce((acc, r) => acc + (r.duration || 0), 0))}</div>
        </div>
      )}
    </div>
  );
};

export default PerformanceRecorder;