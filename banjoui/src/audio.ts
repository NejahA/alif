// Web Audio API synthesizer for Banjoui banjo plucks, musical notes, and chimes
class BanjoAudio {
    private ctx: AudioContext | null = null;

    private getContext(): AudioContext {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    // Banjo string pluck simulation (Karplus-Strong-like / shaped harmonics with quick decay)
    public playBanjoNote(freq: number = 392): void {
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Fundamental oscillator (triangle + saw blend for metallic twang)
            const osc = ctx.createOscillator();
            const oscHarmonic = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            // Twang pitch bend drop slightly
            osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.3);

            oscHarmonic.type = 'triangle';
            oscHarmonic.frequency.setValueAtTime(freq * 2, now);

            // Filter simulating banjo drum resonator
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.Q.setValueAtTime(2.5, now);

            // Pluck envelope: sharp attack, percussive decay
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

            osc.connect(filter);
            oscHarmonic.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            oscHarmonic.start(now);
            osc.stop(now + 0.5);
            oscHarmonic.stop(now + 0.5);
        } catch {
            // Audio policy fallback
        }
    }

    // Note collect chime
    public playNoteCollect(index: number = 0): void {
        const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const freq = pentatonic[index % pentatonic.length];
        this.playBanjoNote(freq);
    }

    // Jump whistle / sound
    public playJump(): void {
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.exponentialRampToValueAtTime(560, now + 0.15);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        } catch {}
    }

    // Strum chord blast
    public playStrumBurst(): void {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playBanjoNote(freq);
            }, idx * 40);
        });
    }

    // Perfect rhythm hit cue
    public playRhythmHit(perfect: boolean = true): void {
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = perfect ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(perfect ? 880 : 440, now);
            osc.frequency.exponentialRampToValueAtTime(perfect ? 1320 : 330, now + 0.1);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch {}
    }
}

export const banjoAudio = new BanjoAudio();

