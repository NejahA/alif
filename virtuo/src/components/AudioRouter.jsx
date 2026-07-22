import React, { useState, useEffect } from 'react';
import { Share2, Shuffle, ArrowRight, GitBranch, Plus, Trash2, Circle, Zap, Radio } from 'lucide-react';

const AudioRouter = () => {
  const [sources, setSources] = useState([
    { id: 's1', name: 'Master Out', type: 'master', color: '#8a2be2' },
    { id: 's2', name: 'Synth Bus', type: 'bus', color: '#3b82f6' },
    { id: 's3', name: 'Drum Bus', type: 'bus', color: '#ef4444' },
    { id: 's4', name: 'Vocal Bus', type: 'bus', color: '#10b981' },
  ]);
  const [destinations, setDestinations] = useState([
    { id: 'd1', name: 'Main Output', type: 'output', color: '#f59e0b' },
    { id: 'd2', name: 'FX Send 1', type: 'fx', color: '#8b5cf6' },
    { id: 'd3', name: 'FX Send 2', type: 'fx', color: '#ec4899' },
    { id: 'd4', name: 'Sidechain', type: 'sidechain', color: '#14b8a6' },
  ]);
  const [routes, setRoutes] = useState([
    { id: 'r1', source: 's1', dest: 'd1', active: true, level: 0, pan: 0 },
    { id: 'r2', source: 's2', dest: 'd2', active: true, level: -6, pan: 0 },
    { id: 'r3', source: 's3', dest: 'd4', active: false, level: -12, pan: 0 },
  ]);
  const [dragging, setDragging] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const toggleRoute = (routeId) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, active: !r.active } : r));
  };

  const deleteRoute = (routeId) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
    if (selectedRoute === routeId) setSelectedRoute(null);
  };

  const addRoute = (sourceId, destId) => {
    const existing = routes.find(r => r.source === sourceId && r.dest === destId);
    if (existing) return;
    
    const newRoute = {
      id: `r${Date.now()}`,
      source: sourceId,
      dest: destId,
      active: true,
      level: 0,
      pan: 0
    };
    setRoutes(prev => [...prev, newRoute]);
  };

  const addSource = () => {
    const name = prompt('Enter source name:');
    if (!name) return;
    const newSource = {
      id: `s${Date.now()}`,
      name,
      type: 'custom',
      color: '#f59e0b'
    };
    setSources(prev => [...prev, newSource]);
  };

  const addDestination = () => {
    const name = prompt('Enter destination name:');
    if (!name) return;
    const newDest = {
      id: `d${Date.now()}`,
      name,
      type: 'custom',
      color: '#8b5cf6'
    };
    setDestinations(prev => [...prev, newDest]);
  };

  const getSourceById = (id) => sources.find(s => s.id === id);
  const getDestById = (id) => destinations.find(d => d.id === id);

  const getTypeColor = (type) => {
    const colors = {
      master: '#8a2be2',
      bus: '#3b82f6',
      output: '#f59e0b',
      fx: '#8b5cf6',
      sidechain: '#14b8a6',
      custom: '#f59e0b'
    };
    return colors[type] || '#8b949e';
  };

  const getRouteColor = (sourceId, destId) => {
    const source = getSourceById(sourceId);
    const dest = getDestById(destId);
    if (source && dest) {
      return source.color;
    }
    return '#8b949e';
  };

  const updateRouteLevel = (routeId, newLevel) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, level: newLevel } : r));
  };

  const updateRoutePan = (routeId, newPan) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, pan: newPan } : r));
  };

  const renderRoutingMatrix = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Source \ Dest</th>
            {destinations.map(dest => (
              <th key={dest.id} style={{ 
                padding: '8px', 
                textAlign: 'center', 
                borderBottom: '1px solid var(--glass-border)',
                color: dest.color,
                fontSize: '0.7rem'
              }}>
                {dest.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sources.map(source => (
            <tr key={source.id}>
              <td style={{ 
                padding: '8px', 
                borderBottom: '1px solid var(--glass-border)',
                color: source.color,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}>
                {source.name}
              </td>
              {destinations.map(dest => {
                const route = routes.find(r => r.source === source.id && r.dest === dest.id);
                return (
                  <td key={`${source.id}-${dest.id}`} style={{ 
                    padding: '6px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid var(--glass-border)' 
                  }}>
                    <button
                      onClick={() => route ? toggleRoute(route.id) : addRoute(source.id, dest.id)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: `2px solid ${route ? (route.active ? '#22c55e' : '#ef444440') : 'rgba(255,255,255,0.1)'}`,
                        background: route?.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        transition: 'all 0.2s ease'
                      }}
                      title={`${source.name} → ${dest.name}${route && !route.active ? ' (muted)' : ''}`}
                    >
                      {route?.active ? <Zap size={12} color="#22c55e" /> : <Circle size={8} color="rgba(255,255,255,0.3)" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRouteDetails = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Routes</div>
      {routes.filter(r => r.active).map(route => {
        const source = getSourceById(route.source);
        const dest = getDestById(route.dest);
        return (
          <div key={route.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            border: selectedRoute === route.id ? '1px solid var(--accent-primary)' : '1px solid transparent'
          }}
            onClick={() => setSelectedRoute(route.id === selectedRoute ? null : route.id)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleRoute(route.id); }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: 'none',
                background: route.active ? '#22c55e' : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={10} color={route.active ? 'white' : 'rgba(255,255,255,0.3)'} />
            </button>
            <div style={{ flex: 1, fontSize: '0.7rem' }}>
              <span style={{ color: source?.color }}>{source?.name}</span>
              {' '}
              <ArrowRight size={10} style={{ opacity: 0.5 }} />
              {' '}
              <span style={{ color: dest?.color }}>{dest?.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteRoute(route.id); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                opacity: 0.5,
                padding: '2px'
              }}
            >
              <Trash2 size={10} />
            </button>
          </div>
        );
      })}
      {routes.filter(r => r.active).length === 0 && (
        <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          No active routes. Click a matrix cell to create one.
        </div>
      )}
    </div>
  );

  const renderSelectedRouteControls = () => {
    if (!selectedRoute) return null;
    const route = routes.find(r => r.id === selectedRoute);
    if (!route) return null;
    const source = getSourceById(route.source);
    const dest = getDestById(route.dest);

    return (
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '12px',
        borderRadius: '8px',
        marginTop: '8px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={12} color="var(--accent-primary)" />
          Route: {source?.name} → {dest?.name}
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
            <span>Level</span>
            <span>{route.level} dB</span>
          </div>
          <input
            type="range"
            min="-60"
            max="6"
            step="0.5"
            value={route.level}
            onChange={(e) => updateRouteLevel(route.id, Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
            <span>Pan</span>
            <span>{route.pan > 0 ? 'R' : 'L'} {Math.abs(route.pan).toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={route.pan}
            onChange={(e) => updateRoutePan(route.id, Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Audio Router</h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-glass" onClick={addSource} style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
            <Plus size={10} /> Source
          </button>
          <button className="btn-glass" onClick={addDestination} style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
            <Plus size={10} /> Dest
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Sources */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sources</div>
          {sources.map(source => (
            <div key={source.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '0.7rem',
              borderLeft: `3px solid ${source.color}`
            }}>
              <Circle size={6} color={source.color} />
              {source.name}
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <ArrowRight size={20} />
        </div>

        {/* Destinations */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Destinations</div>
          {destinations.map(dest => (
            <div key={dest.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '0.7rem',
              borderLeft: `3px solid ${dest.color}`
            }}>
              <Circle size={6} color={dest.color} />
              {dest.name}
            </div>
          ))}
        </div>
      </div>

      {/* Routing Matrix */}
      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Routing Matrix</div>
        {renderRoutingMatrix()}
      </div>

      {/* Active Routes */}
      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
        {renderRouteDetails()}
      </div>

      {/* Selected Route Controls */}
      {renderSelectedRouteControls()}
    </div>
  );
};

export default AudioRouter;