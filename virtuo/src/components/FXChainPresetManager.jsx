import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Upload, Trash2, Plus, Copy, CheckCircle2, 
  Zap, Volume2, Activity, Disc, Music, Filter, 
  RotateCcw, Star, Settings2, Layout
} from 'lucide-react';

const DEFAULT_FX_CHAINS = [
  {
    id: 'warm_vocals',
    name: 'Warm Vocals',
    description: 'Gentle compression, reverb, and de-essing for vocal clarity.',
    color: '#ec4899',
    effects: [
      { id: 'comp', name: 'Compressor', type: 'dynamic', settings: { ratio: 3, threshold: -20, attack: 5 } },
      { id: 'eq', name: 'EQ Boost', type: 'filter', settings: { low: 2, mid: 3, high: 1 } },
      { id: 'reverb', name: 'Hall Reverb', type: 'space', settings: { size: 0.4, decay: 2.5, wet: 0.3 } }
    ],
    tags: ['vocal', 'warm']
  },
  {
    id: 'fat_bass',
    name: 'Fat Bass',
    description: 'Sub-heavy processing with saturation and sidechain compatibility.',
    color: '#8b5cf6',
    effects: [
      { id: 'sat', name: 'Saturation', type: 'distortion', settings: { drive: 2, mix: 0.5 } },
      { id: 'eq', name: 'Low Boost', type: 'filter', settings: { low: 4, mid: 0, high: -1 } },
      { id: 'comp', name: 'Bus Compressor', type: 'dynamic', settings: { ratio: 4, threshold: -18, attack: 10 } }
    ],
    tags: ['bass', 'low-end']
  },
  {
    id: 'crisp_drums',
    name: 'Crisp Drums',
    description: 'Transient shaping and parallel compression for punchy drums.',
    color: '#f59e0b',
    effects: [
      { id: 'trans', name: 'Transient Shaper', type: 'dynamic', settings: { attack: 70, sustain: 30 } },
      { id: 'comp', name: 'Parallel Comp', type: 'dynamic', settings: { ratio: 8, threshold: -24, mix: 0.3 } },
      { id: 'eq', name: 'Air EQ', type: 'filter', settings: { low: -1, mid: 0, high: 4 } }
    ],
    tags: ['drums', 'percussion']
  },
  {
    id: 'spacious_pad',
    name: 'Spacious Pad',
    description: 'Wide stereo image with lush modulation and long reverb tails.',
    color: '#3b82f6',
    effects: [
      { id: 'stereo', name: 'Stereo Widener', type: 'spatial', settings: { width: 120, phase: 0 } },
      { id: 'chorus', name: 'Chorus', type: 'modulation', settings: { rate: 0.5, depth: 60, mix: 0.4 } },
      { id: 'reverb', name: 'Cathedral Reverb', type: 'space', settings: { size: 0.9, decay: 6, wet: 0.5 } }
    ],
    tags: ['pad', 'ambient', 'atmospheric']
  },
  {
    id: 'dirty_guitar',
    name: 'Dirty Guitar',
    description: 'Amp-style distortion with mid-forward EQ and noise gate.',
    color: '#ef4444',
    effects: [
      { id: 'gate', name: 'Noise Gate', type: 'dynamic', settings: { threshold: -50, release: 50 } },
      { id: 'dist', name: 'Overdrive', type: 'distortion', settings: { drive: 5, tone: 6 } },
      { id: 'eq', name: 'Mid Scoop', type: 'filter', settings: { low: 2, mid: -2, high: 3 } }
    ],
    tags: ['guitar', 'rock', 'distortion']
  },
  {
    id: 'lofi_radio',
    name: 'Lo-Fi Radio',
    description: 'Vinyl crackle, bit crushing, and warm filtering for nostalgic vibes.',
    color: '#10b981',
    effects: [
      { id: 'bit', name: 'Bitcrusher', type: 'distortion', settings: { bits: 8, rate: 0.5 } },
      { id: 'filter', name: 'Low-Pass Filter', type: 'filter', settings: { freq: 3000, resonance: 0.3 } },
      { id: 'noise', name: 'Vinyl Noise', type: 'generator', settings: { volume: -30, type: 'pink' } }
    ],
    tags: ['lofi', 'vintage', 'chill']
  }
];

const FXChainPresetManager = () => {
  const [chains, setChains] = useState(() => {
    const saved = localStorage.getItem('virtuo_fx_chains');
    return saved ? JSON.parse(saved) : DEFAULT_FX_CHAINS;
  });
  const [selectedChain, setSelectedChain] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('virtuo_fx_chains', JSON.stringify(chains));
  }, [chains]);

  const allTags = [...new Set(chains.flatMap(c => c.tags))];

  const filteredChains = chains.filter(chain => {
    const matchesSearch = !searchQuery || 
      chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.effects.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || chain.tags.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  const applyChain = (chain) => {
    dispatchChainToBus(chain);
    setSelectedChain(chain.id);
    
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'FX CHAIN APPLIED', message: chain.name, type: 'success' }
    }));
    
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 20 }
    }));
  };

  const dispatchChainToBus = (chain) => {
    window.dispatchEvent(new CustomEvent('virtuo-fx-chain', {
      detail: { chain, action: 'apply' }
    }));
  };

  const saveCurrentAsChain = () => {
    const name = prompt('Chain name:');
    if (!name) return;

    const newChain = {
      id: `custom_${Date.now()}`,
      name,
      description: 'Custom preset',
      color: '#8a2be2',
      effects: DEFAULT_FX_CHAINS[0].effects.map(e => ({ ...e })),
      tags: ['custom'],
      isCustom: true
    };
    setChains(prev => [...prev, newChain]);
    setSelectedChain(newChain.id);

    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 15 }
    }));
  };

  const duplicateChain = (chain) => {
    const newChain = {
      ...chain,
      id: `${chain.id}_copy_${Date.now()}`,
      name: `${chain.name} (Copy)`,
      isCustom: true
    };
    setChains(prev => [...prev, newChain]);
  };

  const deleteChain = (id) => {
    setChains(prev => prev.filter(c => c.id !== id));
    if (selectedChain === id) setSelectedChain(null);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all FX chains to defaults? Custom chains will be lost.')) {
      setChains(DEFAULT_FX_CHAINS);
      setSelectedChain(null);
      localStorage.setItem('virtuo_fx_chains', JSON.stringify(DEFAULT_FX_CHAINS));
    }
  };

  const activeChain = chains.find(c => c.id === selectedChain);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel"
      style={{ 
        width: '100%', 
        maxWidth: '800px', 
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layout size={16} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>FX Chain Presets</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Save & load complete effect chains
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-glass"
            onClick={saveCurrentAsChain}
            style={{ padding: '6px 10px', fontSize: '0.7rem' }}
          >
            <Plus size={12} /> New
          </button>
          <button
            className="btn-glass"
            onClick={resetToDefaults}
            style={{ padding: '6px 8px', fontSize: '0.7rem', color: '#ef4444' }}
            title="Reset to Defaults"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chains..."
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn-glass`}
            onClick={() => setActiveFilter('all')}
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.65rem',
              background: activeFilter === 'all' ? 'var(--accent-primary)' : 'transparent',
              borderColor: activeFilter === 'all' ? 'var(--accent-primary)' : 'var(--glass-border)'
            }}
          >
            All ({chains.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className="btn-glass"
              onClick={() => setActiveFilter(tag)}
              style={{ 
                padding: '4px 10px', 
                fontSize: '0.65rem',
                background: activeFilter === tag ? 'var(--accent-primary)' : 'transparent',
                borderColor: activeFilter === tag ? 'var(--accent-primary)' : 'var(--glass-border)'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Chain Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {filteredChains.map(chain => {
          const isActive = selectedChain === chain.id;
          return (
            <motion.div
              key={chain.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyChain(chain)}
              style={{
                padding: '15px',
                borderRadius: '12px',
                background: isActive ? `${chain.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? chain.color + '60' : 'var(--glass-border)'}`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: chain.color,
                  boxShadow: `0 0 10px ${chain.color}`
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: chain.color,
                  boxShadow: `0 0 8px ${chain.color}60`
                }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{chain.name}</span>
                {isActive && <CheckCircle2 size={12} color={chain.color} />}
              </div>

              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {chain.description}
              </p>

              {/* Effect pills */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                {chain.effects.slice(0, 3).map(effect => (
                  <span key={effect.id} style={{
                    padding: '2px 6px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600
                  }}>
                    {effect.name}
                  </span>
                ))}
                {chain.effects.length > 3 && (
                  <span style={{
                    padding: '2px 6px',
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)'
                  }}>
                    +{chain.effects.length - 3}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                {chain.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '1px 5px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '3px',
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions on hover */}
              <div style={{ 
                position: 'absolute', 
                top: '8px', 
                right: '8px', 
                display: 'flex', 
                gap: '4px',
                opacity: 0.3
              }}
                className="hover-actions"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
              >
                <button
                  className="btn-glass"
                  onClick={(e) => { e.stopPropagation(); duplicateChain(chain); }}
                  style={{ padding: '2px 5px', fontSize: '0.6rem' }}
                  title="Duplicate"
                >
                  <Copy size={10} />
                </button>
                <button
                  className="btn-glass"
                  onClick={(e) => { e.stopPropagation(); deleteChain(chain.id); }}
                  style={{ padding: '2px 5px', fontSize: '0.6rem', color: '#ef4444' }}
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredChains.length === 0 && (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            No FX chains match your search.
          </div>
        )}
      </div>

      {/* Active Chain Details */}
      <AnimatePresence>
        {activeChain && showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              padding: '15px',
              border: `1px solid ${activeChain.color}30`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: activeChain.color }}>
                  {activeChain.name} - Chain Details
                </h4>
                <button
                  className="btn-glass"
                  onClick={() => setShowDetails(false)}
                  style={{ padding: '3px 8px', fontSize: '0.6rem' }}
                >
                  Close
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeChain.effects.map((effect, idx) => (
                  <div key={effect.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: `${activeChain.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: activeChain.color
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{effect.name}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {effect.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {Object.entries(effect.settings).map(([k, v]) => (
                        <span key={k} style={{ marginLeft: '8px' }}>
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show Details Toggle + Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn-glass"
          onClick={() => setShowDetails(!showDetails)}
          style={{ padding: '6px 12px', fontSize: '0.7rem' }}
          disabled={!selectedChain}
        >
          <Settings2 size={12} /> {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        <div style={{ 
          fontSize: '0.65rem', 
          color: 'var(--text-muted)', 
          display: 'flex',
          gap: '15px'
        }}>
          <span>{chains.length} chains</span>
          <span>{chains.filter(c => c.isCustom).length} custom</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FXChainPresetManager;