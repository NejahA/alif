import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { SynthControls } from './components/SynthControls';
import { EqualizerRack } from './components/EqualizerRack';
import { ChordGen } from './components/ChordGen';
import { PadMatrix } from './components/PadMatrix';
import { DrumSequencer } from './components/DrumSequencer';
import { NodePatcher } from './components/NodePatcher';
import { PresetManager } from './components/PresetManager';
import { VirtualPiano } from './components/VirtualPiano';
import { EffectsRack } from './components/EffectsRack';
import { ArpeggiatorPanel } from './components/ArpeggiatorPanel';
import { Oscilloscope } from './components/Oscilloscope';
import { LoopRecorder } from './components/LoopRecorder';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { drumEngine } from './audio/DrumEngine';
import { audioEngine } from './audio/AudioEngine';

import { CyberComposer } from './components/CyberComposer';
import { PianoRoll } from './components/PianoRoll';
import { SongTimeline } from './components/SongTimeline';

export default function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [activeTheme, setActiveTheme] = useState('cosmic');
  const [isMuted, setIsMuted] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [masterBpm, setMasterBpm] = useState(110);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const handleRecordComplete = (url) => setRecordedAudioUrl(url);
  const volRef = useRef(masterVolume);
  volRef.current = masterVolume;

  useEffect(() => {
    const tabMap = {
      't': 'timeline', 'p': 'pianoroll', 'c': 'composer', '1': 'synth', '2': 'chordgen', '3': 'eq', '4': 'pads',
      '5': 'piano', '6': 'drums', '7': 'effects', '8': 'arp',
      '9': 'scope', '0': 'loops'
    };
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key;
      if (tabMap[k]) {
        e.preventDefault();
        setActiveTab((prev) => prev === tabMap[k] ? null : tabMap[k]);
        return;
      }
      if (k === ' ') {
        e.preventDefault();
        drumEngine.toggleSequencer(() => {});
      } else if (k.toLowerCase() === 'r') {
        const ev = new CustomEvent('aetherwave-toggle-record');
        window.dispatchEvent(ev);
      } else if (k.toLowerCase() === 'm') {
        setIsMuted((prev) => {
          const next = !prev;
          audioEngine.init();
          audioEngine.updateParam('masterVolume', next ? 0 : volRef.current);
          return next;
        });
      } else if (k.toLowerCase() === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else if (document.exitFullscreen) document.exitFullscreen();
      } else if (k === 'ArrowRight') {
        setMasterVolume((v) => {
          const next = Math.min(1, v + 0.05);
          audioEngine.init();
          audioEngine.updateParam('masterVolume', isMuted ? 0 : next);
          return next;
        });
      } else if (k === 'ArrowLeft') {
        setMasterVolume((v) => {
          const next = Math.max(0, v - 0.05);
          audioEngine.init();
          audioEngine.updateParam('masterVolume', isMuted ? 0 : next);
          return next;
        });
      } else if (k === '?' || k === '/') {
        setShowShortcuts((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted]);

  const setTab = (tab) => setActiveTab((prev) => prev === tab ? null : tab);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#070913' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onRecordComplete={handleRecordComplete}
        masterBpm={masterBpm}
        setMasterBpm={setMasterBpm}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        setActiveTheme={setActiveTheme}
      />

      <VisualizerCanvas activeTheme={activeTheme} setActiveTheme={setActiveTheme} />

      <CyberComposer isOpen={activeTab === 'composer'} onClose={() => setActiveTab(null)} setActiveTheme={setActiveTheme} />
      <SongTimeline isOpen={activeTab === 'timeline'} onClose={() => setActiveTab(null)} />
      <PianoRoll isOpen={activeTab === 'pianoroll'} onClose={() => setActiveTab(null)} />
      <SynthControls isOpen={activeTab === 'synth'} onClose={() => setActiveTab(null)} />
      <EffectsRack isOpen={activeTab === 'effects'} onClose={() => setActiveTab(null)} />
      <ChordGen isOpen={activeTab === 'chordgen'} onClose={() => setActiveTab(null)} />
      <EqualizerRack isOpen={activeTab === 'eq'} onClose={() => setActiveTab(null)} />
      <PadMatrix isOpen={activeTab === 'pads'} onClose={() => setActiveTab(null)} />
      <ArpeggiatorPanel isOpen={activeTab === 'arp'} onClose={() => setActiveTab(null)} />
      <VirtualPiano isVisible={activeTab === 'piano'} />
      <DrumSequencer isOpen={activeTab === 'drums'} onClose={() => setActiveTab(null)} />
      <NodePatcher isOpen={activeTab === 'patcher'} onClose={() => setActiveTab(null)} />
      <Oscilloscope isOpen={activeTab === 'scope'} onClose={() => setActiveTab(null)} />
      <LoopRecorder isOpen={activeTab === 'loops'} onClose={() => setActiveTab(null)} />
      <PresetManager
        isOpen={activeTab === 'presets'}
        onClose={() => setActiveTab(null)}
        setActiveTheme={setActiveTheme}
        recordedAudioUrl={recordedAudioUrl}
        clearRecordedAudio={() => setRecordedAudioUrl(null)}
      />
      <ShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        onTabChange={setTab}
      />
    </div>
  );
}
