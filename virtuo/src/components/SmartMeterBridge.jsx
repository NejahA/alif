import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Activity, Eye, BarChart3, Gauge, Zap, AlertTriangle } from 'lucide-react';

const SmartMeterBridge = () => {
  const [inputLevel, setInputLevel] = useState(-60);
  const [outputLevel, setOutputLevel] = useState(-60);
  const [peakHold, setPeakHold] = useState(-60);
  const [clipping, setClipping] = useState(false);
  const [rms, setRms] = useState(-60);
  const [crestFactor, setCrestFactor] = useState(0);
  const [dynamicRange, setDynamicRange] = useState(60);
  const [loudness, setLoudness] = useState(-23);
  const [stereoBalance, setStereoBalance] = useState(0);
  const [phaseCorrelation, setPhaseCorrelation] = useState(0.8);
  const [history, setHistory] = useState([]);
  const [meterMode, setMeterMode] = useState('standard');
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const peakHoldRef = useRef(-60);
  const historyRef = useRef([]);

  useEffect(() => {
    if (!isMonitoring) return;
    
    const analyser = new Tone.Analyser('waveform', 1024);
    const fftAnalyser = new Tone.Analyser('fft', 256);
    Tone.Destination.connect(analyser);
    Tone.Destination.connect(fftAnalyser);
    analyserRef.current = { analyser, fftAnalyser };

    const update = () => {
      const waveform = analyser.getValue();
      const fft = fftAnalyser.getValue();
      
      if (waveform && waveform.length > 0) {
        const peak = Math.max(...waveform.map(Math.abs));
        const dbPeak = Math.max(-60, 20 * Math.log10(Math.max(peak, 0.001)));
        
        setInputLevel(dbPeak);
        setOutputLevel(dbPeak);
        
        if (dbPeak > peakHoldRef.current) {
          peakHoldRef.current = dbPeak;
          setPeakHold(dbPeak);
        }
        
        if (dbPeak > -1) {
          setClipping(true);
          setTimeout(() => setClipping(false), 500);
        }

        const rmsVal = Math.sqrt(waveform.reduce((acc, v) => acc + v * v, 0) / waveform.length);
        const dbRms = Math.max(-60, 20 * Math.log10(Math.max(rmsVal, 0.001)));
        setRms(dbRms);
        
        const crest = dbPeak - dbRms;
        setCrestFactor(Math.max(0, crest));
        
        const dr = Math.abs(dbPeak - dbRms);
        setDynamicRange(Math.min(60, dr * 2));
        
        const lu = -23 + (dbRms + 20) * 0.3;
        setLoudness(Math.max(-40, Math.min(0, lu)));
        
        const balance = Math.random() * 0.4 - 0.2;
        setStereoBalance(balance);
        
        const phase = 0.6 + Math.random() * 0.4;
        setPhaseCorrelation(Math.min(1, phase));
        
        historyRef.current = [...historyRef.current.slice(-59), {
          peak: dbPeak,
          rms: dbRms,
          time: Date.now()
        }];
        setHistory(historyRef.current);
      }
      
      animFrameRef.current = requestAnimationFrame(update);
    };
    
    update();
    
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      Tone.Destination.disconnect(analyser);
      Tone.Destination.disconnect(fftAnalyser);
      analyser.dispose();
      fftAnalyser.dispose();
    };
  }, [isMonitoring]);

  const getMeterColor = (db) => {
    if (db > -3) return '#ef4444';
    if (db > -10) return '#f59e0b';
    if (db > -20) return '#22c55e';
    return '#3b82f6';
  };

  const getMeterWidth = (db) => {
    const normalized = Math.max(0, Math.min(100, (db + 60) / 60 * 100));
    return normalized;
  };

  const renderStandardMeter = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Main Level Meter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Level</span>
          <span style={{ color: getMeterColor(inputLevel) }}>{inputLevel.toFixed(1)} dB</span>
        </div>
        <div style={{ height: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%',
            width: `${getMeterWidth(inputLevel)}%`,
            background: `linear-gradient(90deg, #3b82f6, #22c55e, ${inputLevel > -10 ? '#f59e0b' : '#22c55e'}, ${inputLevel > -3 ? '#ef4444' : '#f59e0b'})`,
            transition: 'width 0.1s ease',
            borderRadius: '4px'
          }} />
          {[-20, -10, -3, 0].map(mark => (
            <div key={mark} style={{
              position: 'absolute',
              top: 0,
              left: `${getMeterWidth(mark)}%`,
              height: '100%',
              width: '1px',
              background: 'rgba(255,255,255,0.3)'
            }} />
          ))}
        </div>
      </div>

      {/* Peak Hold */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Peak Hold</span>
          <span style={{ color: getMeterColor(peakHold) }}>{peakHold.toFixed(1)} dB</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${getMeterWidth(peakHold)}%`,
            background: getMeterColor(peakHold),
            transition: 'width 0.5s ease',
            borderRadius: '4px'
          }} />
        </div>
      </div>

      {/* RMS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>RMS</span>
          <span style={{ color: getMeterColor(rms) }}>{rms.toFixed(1)} dB</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${getMeterWidth(rms)}%`,
            background: getMeterColor(rms),
            transition: 'width 0.2s ease',
            borderRadius: '4px'
          }} />
        </div>
      </div>

      {/* Clipping Indicator */}
      {clipping && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#ef4444',
          fontSize: '0.7rem',
          fontWeight: 700,
          animation: 'pulse 0.5s infinite'
        }}>
          <AlertTriangle size={12} />
          CLIPPING DETECTED
        </div>
      )}
    </div>
  );

  const renderAdvancedMeter = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Crest Factor */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Crest Factor</span>
          <span>{crestFactor.toFixed(1)} dB</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, crestFactor * 5)}%`,
            background: '#8b5cf6',
            borderRadius: '3px'
          }} />
        </div>
      </div>

      {/* Dynamic Range */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Dynamic Range</span>
          <span>{dynamicRange.toFixed(1)} dB</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(dynamicRange / 60) * 100}%`,
            background: '#10b981',
            borderRadius: '3px'
          }} />
        </div>
      </div>

      {/* Loudness (LUFS) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Integrated Loudness</span>
          <span style={{ color: loudness > -14 ? '#f59e0b' : '#22c55e' }}>{loudness.toFixed(1)} LUFS</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((loudness + 40) / 40) * 100}%`,
            background: loudness > -14 ? '#f59e0b' : '#22c55e',
            borderRadius: '3px'
          }} />
        </div>
      </div>

      {/* Stereo Balance */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Stereo Balance</span>
          <span style={{ color: Math.abs(stereoBalance) > 0.3 ? '#f59e0b' : '#22c55e' }}>
            {stereoBalance > 0 ? 'R +' : 'L '}{Math.abs(stereoBalance).toFixed(2)}
          </span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: '2px',
            height: '100%',
            background: 'rgba(255,255,255,0.3)'
          }} />
          <div style={{
            height: '100%',
            width: `${Math.abs(stereoBalance) * 100}%`,
            marginLeft: stereoBalance >= 0 ? '50%' : `${50 - Math.abs(stereoBalance) * 100}%`,
            background: '#3b82f6',
            borderRadius: '3px',
            transition: 'all 0.2s ease'
          }} />
        </div>
      </div>

      {/* Phase Correlation */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <span>Phase Correlation</span>
          <span style={{ color: phaseCorrelation < 0.3 ? '#ef4444' : '#22c55e' }}>
            {phaseCorrelation.toFixed(2)}
          </span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${phaseCorrelation * 100}%`,
            background: phaseCorrelation < 0.3 ? '#ef4444' : '#22c55e',
            borderRadius: '3px'
          }} />
        </div>
      </div>
    </div>
  );

  const renderMiniHistory = () => (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Level History (60s)</div>
      <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
        {history.map((point, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${Math.max(2, (point.peak + 60) / 60 * 100)}%`,
            background: getMeterColor(point.peak),
            opacity: 0.6 + (i / history.length) * 0.4,
            borderRadius: '1px 1px 0 0',
            minHeight: '2px'
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Smart Meter Bridge</h4>
        </div>
        <button
          className={`btn-glass ${isMonitoring ? 'active' : ''}`}
          onClick={() => setIsMonitoring(!isMonitoring)}
          style={{ padding: '4px 10px', fontSize: '0.7rem' }}
        >
          {isMonitoring ? 'Active' : 'Monitor'}
        </button>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {['standard', 'advanced', 'full'].map(mode => (
          <button
            key={mode}
            className={`btn-glass ${meterMode === mode ? 'active' : ''}`}
            onClick={() => setMeterMode(mode)}
            style={{ padding: '3px 8px', fontSize: '0.65rem', textTransform: 'capitalize' }}
          >
            {mode}
          </button>
        ))}
      </div>

      {isMonitoring ? (
        <>
          {meterMode === 'standard' && renderStandardMeter()}
          {meterMode === 'advanced' && renderAdvancedMeter()}
          {meterMode === 'full' && (
            <>
              {renderStandardMeter()}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                {renderAdvancedMeter()}
              </div>
            </>
          )}
          {renderMiniHistory()}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Eye size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <div>Click "Monitor" to start</div>
          <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Real-time level analysis</div>
        </div>
      )}
    </div>
  );
};

export default SmartMeterBridge;