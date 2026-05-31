import React, { useState, useRef } from 'react';
import * as Tone from 'tone';
import { Upload, Download, Play, Square, FileText, Music } from 'lucide-react';

export default function MidiFileHandler({ onMidiData, onPlayback }) {
  const [midiFile, setMidiFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [midiData, setMidiData] = useState(null);
  const fileInputRef = useRef(null);
  const playbackRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.mid')) {
      setMidiFile(file);
      
      // Read and parse MIDI file
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        // For now, we'll just store the raw data
        // In a real implementation, you'd use a MIDI parser library
        setMidiData(arrayBuffer);
        
        if (onMidiData) {
          onMidiData(arrayBuffer, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    if (!midiData) return;
    
    // Create a download link for the MIDI file
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = midiFile?.name || 'composition.mid';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlay = () => {
    if (!midiData || isPlaying) return;
    
    setIsPlaying(true);
    if (onPlayback) {
      onPlayback('start', midiData);
    }
    
    // Simulate playback - in real implementation, use Web MIDI API or Tone.js sequence
    playbackRef.current = setTimeout(() => {
      setIsPlaying(false);
      if (onPlayback) {
        onPlayback('stop');
      }
    }, 5000); // 5 second simulation
  };

  const handleStop = () => {
    if (playbackRef.current) {
      clearTimeout(playbackRef.current);
    }
    setIsPlaying(false);
    if (onPlayback) {
      onPlayback('stop');
    }
  };

  return (
    <div className="glass-panel" style={{ 
      padding: '20px', 
      width: '350px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Music size={20} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>MIDI Files</h3>
      </div>

      {/* File Upload */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          marginBottom: '8px', 
          color: 'var(--text-muted)' 
        }}>
          Import MIDI File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          className="btn-glass"
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Upload size={16} />
          Choose MIDI File
        </button>
        {midiFile && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '6px',
            fontSize: '0.75rem'
          }}>
            <FileText size={12} style={{ marginRight: '6px' }} />
            {midiFile.name}
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn-glass"
          onClick={handlePlay}
          disabled={!midiData || isPlaying}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Play size={16} />
          Play
        </button>
        <button
          className="btn-glass"
          onClick={handleStop}
          disabled={!isPlaying}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Square size={16} />
          Stop
        </button>
      </div>

      {/* Export */}
      <button
        className="btn-glass"
        onClick={handleExport}
        disabled={!midiData}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <Download size={16} />
        Export MIDI
      </button>

      {/* Status */}
      <div style={{ 
        padding: '10px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '6px',
        fontSize: '0.7rem',
        color: 'var(--text-muted)'
      }}>
        {!midiData && 'No MIDI file loaded'}
        {midiData && !isPlaying && 'Ready to play/export'}
        {isPlaying && 'Playing...'}
      </div>
    </div>
  );
}