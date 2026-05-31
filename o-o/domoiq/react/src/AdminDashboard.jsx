import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Plus, Save, X, Newspaper, Cloud, Shield, 
  Target, MessageSquare, Lightbulb, Radio, User, Activity 
} from 'lucide-react';

const AdminDashboard = ({ onClose, apiBase }) => {
  const [activeTab, setActiveTab] = useState('news');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({});

  const tabs = [
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'broadcasts', label: 'Broadcasts', icon: Radio },
    { id: 'seers', label: 'Seers', icon: User },
    { id: 'events', label: 'Events', icon: Activity },
    { id: 'artifacts', label: 'Artifacts', icon: Shield },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'predictions', label: 'Oracle', icon: MessageSquare },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/${activeTab}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setNewItem({});
    setEditingId(null);
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await fetch(`${apiBase}/admin/${activeTab}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSave = async (item) => {
    const isNew = !item._id;
    const url = isNew ? `${apiBase}/admin/${activeTab}` : `${apiBase}/admin/${activeTab}/${item._id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('Save failed');
      fetchData();
      if (isNew) setNewItem({});
      setEditingId(null);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save. Check server logs.');
    }
  };

  const renderEditor = (item, isNew = false) => {
    const fields = {
      news: [
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['PRIME', 'VOID', 'NEON'] },
        { key: 'headline', label: 'Headline', type: 'text' },
      ],
      weather: [
        { key: 'type', label: 'Type', type: 'text' },
        { key: 'icon', label: 'Icon', type: 'select', options: ['Sun', 'CloudLightning', 'Wind'] },
        { key: 'entropyBoost', label: 'Entropy Boost', type: 'number' },
        { key: 'msg', label: 'Message', type: 'text' },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ],
      insights: [
        { key: 'text', label: 'Insight Text', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'select', options: ['Technological', 'Biological', 'Digital', 'Interstellar', 'Ecological', 'General'] },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['PRIME', 'VOID', 'NEON'] },
        { key: 'upvotes', label: 'Upvotes', type: 'number' },
        { key: 'stakes', label: 'Stakes', type: 'number' },
      ],
      broadcasts: [
        { key: 'sender', label: 'Sender', type: 'text' },
        { key: 'message', label: 'Message', type: 'textarea' },
      ],
      seers: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'credits', label: 'Credits', type: 'number' },
        { key: 'rank', label: 'Rank', type: 'text' },
        { key: 'faction', label: 'Faction', type: 'select', options: ['Aether', 'Void', 'Neon', 'None'] },
      ],
      events: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'type', label: 'Type', type: 'select', options: ['Info', 'Warning', 'Critical', 'Discovery'] },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['PRIME', 'VOID', 'NEON'] },
      ],
      artifacts: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'rarity', label: 'Rarity', type: 'select', options: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'] },
        { key: 'icon', label: 'Icon', type: 'select', options: ['Sparkles', 'Key', 'Shield', 'Infinity'] },
      ],
      missions: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'reward', label: 'Reward', type: 'number' },
        { key: 'targetType', label: 'Target Type', type: 'select', options: ['anomaly', 'upvote', 'stake'] },
        { key: 'targetCount', label: 'Target Count', type: 'number' },
      ],
      predictions: [
        { key: 'keyword', label: 'Keyword', type: 'text' },
        { key: 'response', label: 'Response', type: 'textarea' },
      ],
    };

    return (
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', border: isNew ? '1px dashed var(--accent-cyan)' : '1px solid var(--glass-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {fields[activeTab].map(f => (
            <div key={f.key} style={{ gridColumn: (f.type === 'textarea' || f.key === 'headline' || f.key === 'text' || f.key === 'message' || f.key === 'description' || f.key === 'response') ? 'span 2' : 'span 1' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>{f.label}</label>
              {f.type === 'select' ? (
                <select 
                  value={item[f.key] || ''} 
                  onChange={e => isNew ? setNewItem({...item, [f.key]: e.target.value}) : setData(data.map(i => i._id === item._id ? {...i, [f.key]: e.target.value} : i))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '4px' }}
                >
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea 
                  value={item[f.key] || ''}
                  onChange={e => isNew ? setNewItem({...item, [f.key]: e.target.value}) : setData(data.map(i => i._id === item._id ? {...i, [f.key]: e.target.value} : i))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '4px', minHeight: '80px' }}
                />
              ) : (
                <input 
                  type={f.type}
                  checked={f.type === 'checkbox' ? item[f.key] : undefined}
                  value={f.type !== 'checkbox' ? (item[f.key] || '') : undefined}
                  onChange={e => {
                    const val = f.type === 'checkbox' ? e.target.checked : f.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                    isNew ? setNewItem({...item, [f.key]: val}) : setData(data.map(i => i._id === item._id ? {...i, [f.key]: val} : i));
                  }}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '4px' }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => isNew ? handleSave(newItem) : handleSave(item)} className="btn-futr" style={{ padding: '5px 15px', fontSize: '0.7rem' }}>
            <Save size={14} style={{ marginRight: '5px' }} /> SAVE
          </button>
          {!isNew && (
            <button onClick={() => handleDelete(item._id)} className="btn-futr" style={{ padding: '5px 15px', fontSize: '0.7rem', background: 'rgba(255,0,0,0.2)' }}>
              <Trash2 size={14} style={{ marginRight: '5px' }} /> DELETE
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 10000, 
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px'
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '1200px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-future" style={{ letterSpacing: '4px', fontSize: '1.2rem' }}>DOMOIQ CENTRAL COMMAND</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tabs */}
          <div style={{ width: '220px', borderRight: '1px solid var(--glass-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                  background: activeTab === tab.id ? 'var(--accent-cyan)' : 'transparent',
                  color: activeTab === tab.id ? 'black' : 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.75rem', fontWeight: 'bold', transition: 'all 0.2s'
                }}
              >
                <tab.icon size={16} /> {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {activeTab !== 'insights' && activeTab !== 'broadcasts' && activeTab !== 'seers' && (
              <>
                <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '15px', opacity: 0.7 }}>NEW {activeTab.toUpperCase()}</h3>
                {renderEditor(newItem, true)}
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="font-future" style={{ fontSize: '0.8rem', opacity: 0.7 }}>EXISTING {activeTab.toUpperCase()} ({data.length})</h3>
              <button onClick={fetchData} className="btn-futr" style={{ fontSize: '0.6rem', padding: '5px 10px' }}>REFRESH GRID</button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Activity className="animate-pulse" color="var(--accent-cyan)" size={48} />
              </div>
            ) : (
              data.map(item => renderEditor(item))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
