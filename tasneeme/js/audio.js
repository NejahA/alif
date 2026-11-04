/* =========================================================
   Tasneeme — audio engine (fully synthesised, no assets)
   ========================================================= */
(function () {
  "use strict";
  const TS = (window.TS = window.TS || {});

  const Audio = {
    ctx: null, master: null, ambientGain: null, enabled: false, volume: 0.45, _built: false,

    _ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      return true;
    },
    resume() { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); },

    setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; },

    setEnabled(on) {
      this.enabled = on;
      if (on) { if (!this._ensure()) return; this.resume(); this._buildAmbient(); this._fadeAmbient(true); }
      else this._fadeAmbient(false);
    },

    _buildAmbient() {
      if (this._built || !this.ctx) return;
      this._built = true;
      const ctx = this.ctx;
      const g = (this.ambientGain = ctx.createGain());
      g.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 720; filter.Q.value = 0.6;
      g.connect(filter); filter.connect(this.master);

      // warm pad : stacked detuned sines in a suspended chord
      const chord = [110, 164.81, 220, 329.63, 440];
      chord.forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.value = f * (1 + (i - 2) * 0.0016);
        const og = ctx.createGain(); og.gain.value = 0.16 / (1 + i * 0.4);
        o.connect(og); og.connect(g); o.start();
        // slow detune drift
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.03 + i * 0.017;
        const lg = ctx.createGain(); lg.gain.value = 0.9;
        lfo.connect(lg); lg.connect(o.frequency); lfo.start();
      });

      // filter sweep
      const flfo = ctx.createOscillator(); flfo.frequency.value = 0.045;
      const flg = ctx.createGain(); flg.gain.value = 220;
      flfo.connect(flg); flg.connect(filter.frequency); flfo.start();

      // water texture : filtered noise loop
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.2; }
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 1400; nf.Q.value = 0.8;
      const ng = ctx.createGain(); ng.gain.value = 0.05;
      noise.connect(nf); nf.connect(ng); ng.connect(g); noise.start();
    },

    _fadeAmbient(on) {
      if (!this.ambientGain || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(t);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, t);
      this.ambientGain.gain.linearRampToValueAtTime(on ? 0.5 : 0, t + (on ? 2.5 : 0.8));
    },

    _tone(freq, dur, type, when, gainVal) {
      const ctx = this.ctx, t0 = ctx.currentTime + (when || 0);
      const o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gainVal || 0.22, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.master);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },

    play(name) {
      if (!this._ensure()) return;
      this.resume();
      switch (name) {
        case "check": this._tone(660, 0.16, "sine", 0, 0.2); this._tone(990, 0.2, "sine", 0.06, 0.14); break;
        case "uncheck": this._tone(330, 0.12, "sine", 0, 0.13); break;
        case "bloom": this._tone(880, 0.5, "sine", 0, 0.16); this._tone(1320, 0.6, "sine", 0.07, 0.09); break;
        case "quest": [523, 659, 784].forEach((f, i) => this._tone(f, 0.3, "triangle", i * 0.09, 0.16)); break;
        case "level": [523, 659, 784, 1046, 1318].forEach((f, i) => this._tone(f, 0.7, "sine", i * 0.12, 0.18)); break;
        case "error": this._tone(180, 0.28, "sawtooth", 0, 0.1); break;
        case "tick": this._tone(1200, 0.05, "square", 0, 0.05); break;
        case "start": [440, 554, 659].forEach((f, i) => this._tone(f, 0.35, "sine", i * 0.07, 0.16)); break;
        case "chime": [784, 1046].forEach((f, i) => this._tone(f, 0.9, "sine", i * 0.1, 0.14)); break;
      }
    },
  };

  TS.Audio = Audio;
})();
