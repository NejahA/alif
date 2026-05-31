import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, Volume2, Radio, Music, Mic, Zap, Disc, Activity, GitBranch, Layout } from 'lucide-react';

const AVAILABLE_TRACKS = [
  { id: 'piano', name: 'Piano', icon: Music, color: '#3b82f6' },
  { id: 'violin', name: 'Violin', icon: Activity, color: '#8b5cf6' },
  { id: 'cello', name: 'Cello', icon: Activity, color: '#a855f7' },
  { id: 'guitar', name: 'Guitar', icon: Music, color: '#22c55e' },
  { id: 'drums', name: 'Drums', icon: Disc, color: '#ef4444' },
  { id: 'pads', name: 'Pads', icon: Layout, color: '#f59e0b' },
  { id: 'sampler', name: 'Sampler', icon: Zap, color: '#ec4899' },
  { id: 'synth', name: 'Synth', icon: Zap, color: '#14b8a6' },
  { id: 'seq', name: 'Sequencer', icon: GitBranch, color: '#f97316' },
  { id: 'bass', name: 'Bass', icon: Activity, color: '#f59e0b' },
  { id: 'vocal', name: 'Vocal', icon: Mic, color: '#06b6d4' },
  { id: 'ambient', name: 'Ambient', icon: Layers, color: '#6366f1' }
];

export default function TrackGrouping() {
  const [groups, setGroups] = useState([
    { id: 'group1', name: 'Rhythm Section', color: '#ef4444', tracks: ['drums', 'bass'] },
    { id: 'group2', name: 'Harmony', color: '#3b82f6', tracks: ['piano', 'synth', 'pads'] }
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [groupVolumes, setGroupVolumes] = useState({ group1: -3, group2: -2 });

  const createGroup = () => {
    if (!newGroupName.trim()) return;
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    const newGroup = {
      id: `group${Date.now()}`,
      name: newGroupName,
      color: colors[groups.length % colors.length],
      tracks: []
    };
    setGroups(prev => [...prev, newGroup]);
    setGroupVolumes(prev => ({ ...prev, [newGroup.id]: -3 }));
    setNewGroupName('');
    setIsCreating(false);
  };

  const deleteGroup = (id) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const toggleTrackInGroup = (groupId, trackId) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const has = g.tracks.includes(trackId);
      return { ...g, tracks: has ? g.tracks.filter(t => t !== trackId) : [...g.tracks, trackId] };
    }));
  };

  const getTrackInGroups = (trackId) => {
    return groups.filter(g => g.tracks.includes(trackId));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '380px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Layers size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Track Grouping</h3>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsCreating(!isCreating)}
          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Plus size={12} /> Group
        </motion.button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ display: 'flex', gap: '8px', overflow: 'hidden' }}>
            <input
              type="text" placeholder="Group name..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createGroup()}
              style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '0.7rem', outline: 'none' }}
            />
            <button onClick={createGroup} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--accent-primary)', color: 'white', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>Create</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
        {groups.map(group => (
          <motion.div key={group.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: `1px solid ${group.color}30`, overflow: 'hidden' }}
          >
            <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: `${group.color}10` }}>
              <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: group.color }} />
              <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700 }}>{group.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={10} opacity={0.5} />
                <input type="range" min="-30" max="0" step="1" value={groupVolumes[group.id] || -3}
                  onChange={(e) => setGroupVolumes(prev => ({ ...prev, [group.id]: Number(e.target.value) }))}
                  style={{ width: '50px', accentColor: group.color, height: '3px' }} />
                <span style={{ fontSize: '0.55rem', opacity: 0.5, minWidth: '24px' }}>{groupVolumes[group.id] || -3}dB</span>
              </div>
              <button onClick={() => deleteGroup(group.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5, padding: '2px' }}>
                <Trash2 size={12} />
              </button>
            </div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {AVAILABLE_TRACKS.map(track => {
                const Icon = track.icon;
                const isInGroup = group.tracks.includes(track.id);
                return (
                  <button
                    key={track.id}
                    onClick={() => toggleTrackInGroup(group.id, track.id)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${isInGroup ? track.color : 'var(--glass-border)'}`,
                      background: isInGroup ? `${track.color}20` : 'transparent',
                      color: isInGroup ? track.color : 'var(--text-muted)',
                      fontSize: '0.6rem',
                      fontWeight: isInGroup ? 700 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Icon size={8} /> {track.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        Group tracks into buses for collective volume control and processing.
      </div>
    </div>
  );
}
