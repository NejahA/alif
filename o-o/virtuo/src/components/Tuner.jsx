import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

// Map frequency to note
const getNoteFromFrequency = (frequency) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const semitones = 12 * (Math.log2(frequency / 440));
  const noteIndex = Math.round(semitones) + 69; // 69 is MIDI for A4
  const note = notes[noteIndex % 12];
  const octave = Math.floor(noteIndex / 12) - 1;
  return { note, octave, cents: (semitones - Math.round(semitones)) * 100 };
};

export default function Tuner() {
  const [isActive, setIsActive] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [cents, setCents] = useState(0);
  const micRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startTuner = async () => {
    try {
      await Tone.start();
      micRef.current = new Tone.UserMedia();
      await micRef.current.open();
      
      analyserRef.current = new Tone.Analyser('fft', 2048);
      micRef.current.connect(analyserRef.current);
      
      setIsActive(true);
      updateTuner();
    } catch (err) {
      console.error('Could not open microphone', err);
    }
  };

  const stopTuner = () => {
    if (micRef.current) {
      micRef.current.close();
      micRef.current.dispose();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsActive(false);
    setCurrentNote(null);
    setCents(0);
  };

  const updateTuner = () => {
    if (!analyserRef.current || !micRef.current) return;
    
    // Check if still active to prevent ghost updates
    const buffer = analyserRef.current.getValue();
    // Simple peak detection for pitch
    let maxVal = -Infinity;
    let maxIdx = -1;
    
    // Convert buffer to frequency domain peak
    // Tone.Analyser('fft') returns dB values.
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] > maxVal) {
        maxVal = buffer[i];
        maxIdx = i;
      }
    }

    if (maxVal > -50) { // Threshold
      const frequency = maxIdx * (Tone.context.sampleRate / 2048);
      if (frequency > 20 && frequency < 2000) {
        const { note, octave, cents: c } = getNoteFromFrequency(frequency);
        setCurrentNote(`${note}${octave}`);
        setCents(c);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateTuner);
  };

  useEffect(() => {
    return () => stopTuner();
  }, []);

  return (
    <div className="glass-panel" style={{
      padding: '15px 20px',
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Instrument Tuner</h3>
        <button 
          onClick={isActive ? stopTuner : startTuner}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        >
          {isActive ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
      </div>

      <div style={{ 
        height: '80px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '8px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isActive ? (
          <>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: Math.abs(cents) < 10 ? '#22c55e' : 'var(--text-main)' }}>
              {currentNote || '--'}
            </span>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '10px', position: 'relative' }}>
               <motion.div 
                 animate={{ left: `${50 + cents / 2}%` }}
                 style={{ 
                   position: 'absolute', 
                   top: '-8px', 
                   width: '2px', 
                   height: '20px', 
                   background: Math.abs(cents) < 10 ? '#22c55e' : '#ef4444',
                   boxShadow: Math.abs(cents) < 10 ? '0 0 10px #22c55e' : 'none'
                 }}
               />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>
              {Math.round(cents)} cents
            </div>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Microphone Off</span>
        )}
      </div>
      
      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {isActive ? 'Pluck a string to tune' : 'Click the mic to start tuning'}
      </p>
    </div>
  );
}
