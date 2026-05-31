import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, SlidersHorizontal, Play, Square } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function DJMixer() {
  const [crossfade, setCrossfade] = useState(0.5); // 0 = Deck A, 1 = Deck B
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  
  const deckARef = useRef(null);
  const deckBRef = useRef(null);
  const crossFaderRef = useRef(null);
  
  const eqARef = useRef(null);
  const eqBRef = useRef(null);

  useEffect(() => {
    crossFaderRef.current = new Tone.CrossFade(0.5).connect(masterBus);
    
    eqARef.current = new Tone.EQ3(0, 0, 0).connect(crossFaderRef.current.a);
    eqBRef.current = new Tone.EQ3(0, 0, 0).connect(crossFaderRef.current.b);

    // Load default loops
    deckARef.current = new Tone.Player({
      url: "https://tonejs.github.io/audio/loop/FW3.mp3",
      loop: true,
      autostart: false
    }).connect(eqARef.current);

    deckBRef.current = new Tone.Player({
      url: "https://tonejs.github.io/audio/loop/bass-ring.mp3",
      loop: true,
      autostart: false
    }).connect(eqBRef.current);

    return () => {
      deckARef.current?.dispose();
      deckBRef.current?.dispose();
      crossFaderRef.current?.dispose();
      eqARef.current?.dispose();
      eqBRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (crossFaderRef.current) {
      crossFaderRef.current.fade.rampTo(crossfade, 0.1);
    }
  }, [crossfade]);

  const toggleDeck = async (deck) => {
    await Tone.start();
    Tone.loaded().then(() => {
      if (deck === 'A') {
        if (isPlayingA) deckARef.current.stop();
        else deckARef.current.start();
        setIsPlayingA(!isPlayingA);
      } else {
        if (isPlayingB) deckBRef.current.stop();
        else deckBRef.current.start();
        setIsPlayingB(!isPlayingB);
      }
    });
  };

  const handleEQChange = (deck, band, value) => {
    const eq = deck === 'A' ? eqARef.current : eqBRef.current;
    if (eq) {
      eq[band].value = value;
    }
  };

  const DeckControl = ({ title, deck, isPlaying }) => (
    <div style={{ flex: 1, background: '#111', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>Deck {title}</h3>
        <button 
          className={`btn-glass ${isPlaying ? 'active' : ''}`} 
          onClick={() => toggleDeck(deck)}
          style={{ padding: '5px 15px' }}
        >
          {isPlaying ? <Square size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {['high', 'mid', 'low'].map(band => (
          <div key={band} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#888', fontSize: '10px', textTransform: 'uppercase' }}>{band}</span>
            <input 
              type="range" min="-30" max="10" step="1" defaultValue="0"
              onChange={(e) => handleEQChange(deck, band, Number(e.target.value))}
              style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100px', accentColor: deck === 'A' ? '#3b82f6' : '#ef4444' }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '800px' }}>
        <DeckControl title="A" deck="A" isPlaying={isPlayingA} />
        <DeckControl title="B" deck="B" isPlaying={isPlayingB} />
      </div>

      {/* Crossfader */}
      <div style={{ width: '100%', maxWidth: '600px', background: '#222', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <label style={{ color: '#fff', fontSize: '12px' }}>Crossfader</label>
        <input 
          type="range" min="0" max="1" step="0.01" 
          value={crossfade} 
          onChange={(e) => setCrossfade(Number(e.target.value))}
          style={{ width: '100%', height: '30px', accentColor: '#10b981' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: '#888', fontSize: '10px' }}>
          <span>DECK A</span>
          <span>DECK B</span>
        </div>
      </div>
    </div>
  );
}
