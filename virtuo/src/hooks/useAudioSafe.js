import { useState, useEffect } from 'react';
import * as Tone from 'tone';

export function useAudioSafe() {
  const [isReady, setIsReady] = useState(Tone.context.state === 'running');

  useEffect(() => {
    if (isReady) return;

    const handleInteraction = () => {
      if (Tone.context.state === 'running') {
        setIsReady(true);
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isReady]);

  return isReady;
}
