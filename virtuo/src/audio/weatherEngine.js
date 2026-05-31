import * as Tone from 'tone';

class WeatherEngine {
  constructor() {
    this.noise = null;
    this.filter = null;
    this.rain = null;
    this.rainFilter = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    this.noise = new Tone.Noise("pink").start();
    this.filter = new Tone.AutoFilter({
      frequency: 0.1,
      baseFrequency: 200,
      octaves: 4
    }).connect(Tone.Destination);
    
    this.noise.connect(this.filter);
    this.noise.volume.value = -Infinity;
    
    this.rain = new Tone.Noise("white").start();
    this.rainFilter = new Tone.Filter(2000, "lowpass").connect(Tone.Destination);
    this.rain.connect(this.rainFilter);
    this.rain.volume.value = -Infinity;

    // Cyberpunk neon hum
    this.cyberHum = new Tone.Oscillator(50, "sawtooth").start();
    this.cyberFilter = new Tone.Filter(200, "lowpass").connect(Tone.Destination);
    this.cyberHum.connect(this.cyberFilter);
    this.cyberHum.volume.value = -Infinity;

    // Forest birds/insects (simulated with grain/noise)
    this.forestNoise = new Tone.Noise("white").start();
    this.forestFilter = new Tone.Filter(8000, "bandpass").connect(Tone.Destination);
    this.forestLFO = new Tone.LFO(10, 7000, 9000).connect(this.forestFilter.frequency).start();
    this.forestNoise.connect(this.forestFilter);
    this.forestNoise.volume.value = -Infinity;
    
    this.initialized = true;
  }

  setWeather(type) {
    if (!this.initialized) return;
    
    // Reset all
    [this.noise, this.rain, this.cyberHum, this.forestNoise].forEach(n => {
      if (n) n.volume.rampTo(-Infinity, 2);
    });

    switch(type) {
      case 'clear':
        break;
      case 'rhythmic_wind':
        this.noise.volume.rampTo(-20, 3);
        this.filter.frequency.rampTo(0.5, 3);
        break;
      case 'harmonic_rain':
        this.rain.volume.rampTo(-25, 3);
        break;
      case 'timbral_mist':
        this.noise.volume.rampTo(-25, 4);
        this.filter.frequency.rampTo(0.05, 4);
        this.rain.volume.rampTo(-35, 4);
        break;
      case 'cyberpunk_neon':
        this.cyberHum.volume.rampTo(-30, 3);
        this.noise.volume.rampTo(-35, 3);
        break;
      case 'deep_forest':
        this.forestNoise.volume.rampTo(-40, 4);
        this.noise.volume.rampTo(-30, 4);
        this.filter.frequency.rampTo(0.1, 4);
        break;
    }
  }
}

export const weatherEngine = new WeatherEngine();
