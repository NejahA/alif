import React, { useState } from 'react';
import * as Tone from 'tone';

export default function TapeStop() {
  const [isStopped, setIsStopped] = useState(false);

  const triggerTapeStop = async () => {
    await Tone.start();
    
    // Tape stop effect involves dramatically pitching down the master output 
    // and slowing the transport tempo. Tone.js doesn't easily pitch down the global destination,
    // but we can rapidly drop the global transport tempo to 0 and fade out the master volume.
    
    if (!isStopped) {
        setIsStopped(true);
        const currentBpm = Tone.Transport.bpm.value;
        const currentVol = Tone.Destination.volume.value;
        
        // Save state for restoration (hacky but works for demo)
        window.storedBpm = currentBpm;
        window.storedVol = currentVol;

        // Ramp tempo to 0 over 1 second
        Tone.Transport.bpm.rampTo(10, 1);
        // Ramp volume down
        Tone.Destination.volume.rampTo(-60, 1);
        
        setTimeout(() => {
            Tone.Transport.pause();
        }, 1000);

    } else {
        setIsStopped(false);
        Tone.Transport.start();
        Tone.Transport.bpm.rampTo(window.storedBpm || 120, 0.1);
        Tone.Destination.volume.rampTo(window.storedVol || 0, 0.1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%', padding: '50px' }}>
      
      {/* Big Red Button */}
      <div 
        onMouseDown={triggerTapeStop}
        style={{
            width: '200px', height: '200px', background: '#991b1b',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isStopped ? 'inset 0 10px 20px rgba(0,0,0,0.8)' : '0 20px 0 #7f1d1d, 0 30px 20px rgba(0,0,0,0.5)',
            transform: isStopped ? 'translateY(20px)' : 'none',
            transition: 'all 0.1s', cursor: 'pointer',
            border: '10px solid #ef4444'
        }}
      >
          <span style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textShadow: '2px 2px 4px #000', textTransform: 'uppercase' }}>
              {isStopped ? 'Release' : 'Tape Stop'}
          </span>
      </div>
      
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
          Hit this to simulate a turntable motor turning off. It will crash the tempo and fade the master audio. Great for DJ transitions!
          (Note: Make sure a sequencer like TR-808 or TB-303 is playing to hear the effect).
      </p>
    </div>
  );
}
