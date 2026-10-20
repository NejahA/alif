import React, { useState } from 'react';
import { PlacedModule, ShipModule, ShipStats } from '../types/game';
import { MODULE_CATALOG } from '../data/gameData';
import { GRID_SIZE } from '../utils/shipEngine';
import { sound } from '../utils/audio';
import { 
  Zap, 
  Shield, 
  Flame, 
  Package, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Gauge, 
  Crosshair, 
  Weight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface ShipyardViewProps {
  placedModules: PlacedModule[];
  onUpdateModules: (newModules: PlacedModule[]) => void;
  stats: ShipStats;
  credits: number;
  onUpdateCredits: (newCredits: number) => void;
  onLog: (text: string, type: 'info' | 'trade' | 'alert' | 'combat' | 'success') => void;
}

export const ShipyardView: React.FC<ShipyardViewProps> = ({
  placedModules,
  onUpdateModules,
  stats,
  credits,
  onUpdateCredits,
  onLog,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>({ x: 2, y: 1 });
  const [filterType, setFilterType] = useState<string>('all');

  // Find module at selected coordinate
  const currentPlaced = selectedCell
    ? placedModules.find((m) => m.gridX === selectedCell.x && m.gridY === selectedCell.y)
    : null;

  const handleInstallModule = (mod: ShipModule) => {
    if (!selectedCell) return;
    if (credits < mod.cost) {
      sound.playAlarm();
      onLog(`Insufficient credits to purchase ${mod.name} (₡${mod.cost} required).`, 'alert');
      return;
    }

    // Deduct cost and install
    onUpdateCredits(credits - mod.cost);
    const newPlaced: PlacedModule = {
      gridX: selectedCell.x,
      gridY: selectedCell.y,
      module: mod,
      currentHp: mod.hullHp,
    };

    const filtered = placedModules.filter(
      (m) => !(m.gridX === selectedCell.x && m.gridY === selectedCell.y)
    );
    onUpdateModules([...filtered, newPlaced]);

    sound.playTradeCash();
    onLog(`Fabricated and mounted [${mod.name}] to Hull Bay [${selectedCell.x}, ${selectedCell.y}].`, 'success');
  };

  const handleDismantle = () => {
    if (!selectedCell || !currentPlaced) return;
    const refund = Math.round(currentPlaced.module.cost * 0.75);
    onUpdateCredits(credits + refund);

    const filtered = placedModules.filter(
      (m) => !(m.gridX === selectedCell.x && m.gridY === selectedCell.y)
    );
    onUpdateModules(filtered);

    sound.playCannon();
    onLog(`Dismantled [${currentPlaced.module.name}] from Bay [${selectedCell.x}, ${selectedCell.y}] for +₡${refund} scrap rebate.`, 'info');
  };

  const filteredCatalog = filterType === 'all'
    ? MODULE_CATALOG
    : MODULE_CATALOG.filter((m) => m.type === filterType);

  // Validation checks
  const hasCockpit = placedModules.some((m) => m.module.type === 'cockpit');
  const hasThruster = placedModules.some((m) => m.module.type === 'thruster');
  const powerSufficient = stats.netPower >= 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 380px', gap: '20px', padding: '0 16px 24px' }}>
      {/* Left: Hull Blueprint Grid & Module Catalog */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Interactive Grid Card */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--border-cyan)' }}>
                HULL BLUEPRINT SCHEMATIC
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Select a bay coordinate to mount, inspect, or scrap ship modules
              </span>
            </div>

            {/* Validation Badges */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: '4px',
                background: hasCockpit ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.2)',
                color: hasCockpit ? 'var(--accent-green)' : 'var(--accent-red)',
                border: `1px solid ${hasCockpit ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {hasCockpit ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                HELM
              </span>

              <span style={{
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: '4px',
                background: hasThruster ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.2)',
                color: hasThruster ? 'var(--accent-green)' : 'var(--accent-red)',
                border: `1px solid ${hasThruster ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {hasThruster ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                THRUST
              </span>

              <span style={{
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: '4px',
                background: powerSufficient ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.2)',
                color: powerSufficient ? 'var(--accent-green)' : 'var(--accent-red)',
                border: `1px solid ${powerSufficient ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {powerSufficient ? <Zap size={12} /> : <AlertTriangle size={12} />}
                {stats.netPower >= 0 ? `+${stats.netPower} MW` : `${stats.netPower} MW`}
              </span>
            </div>
          </div>

          {/* 5x5 Blueprint Matrix */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '8px',
            maxWidth: '480px',
            margin: '0 auto',
            padding: '16px',
            background: 'rgba(5, 8, 17, 0.7)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            boxShadow: 'inset 0 0 24px rgba(0, 229, 255, 0.05)'
          }}>
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((__, x) => {
                const placed = placedModules.find((m) => m.gridX === x && m.gridY === y);
                const isSelected = selectedCell?.x === x && selectedCell?.y === y;

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => {
                      sound.playClick(900);
                      setSelectedCell({ x, y });
                    }}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: '10px',
                      background: placed
                        ? `${placed.module.color}18`
                        : isSelected
                        ? 'rgba(0, 229, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected
                        ? '2px solid var(--border-cyan)'
                        : placed
                        ? `1px solid ${placed.module.color}88`
                        : '1px dashed rgba(255, 255, 255, 0.1)',
                      boxShadow: isSelected
                        ? '0 0 16px rgba(0, 229, 255, 0.4)'
                        : placed
                        ? `0 0 8px ${placed.module.color}33`
                        : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                      {x},{y}
                    </span>

                    {placed ? (
                      <>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: placed.module.color, letterSpacing: '0.5px' }}>
                          {placed.module.symbol}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                          {placed.module.name.split(' ')[0]}
                        </div>
                        {placed.module.power !== 0 && (
                          <div style={{
                            fontSize: '0.55rem',
                            fontFamily: 'monospace',
                            color: placed.module.power > 0 ? 'var(--accent-amber)' : 'var(--border-cyan)'
                          }}>
                            {placed.module.power > 0 ? `+${placed.module.power}` : placed.module.power}MW
                          </div>
                        )}
                      </>
                    ) : (
                      <Plus size={16} color="rgba(255,255,255,0.2)" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Cell Inspector & Fabricator */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {selectedCell && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--border-cyan)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '1px' }}>
                    BAY [{selectedCell.x}, {selectedCell.y}] INSPECTION & MOUNTING
                  </h3>
                </div>

                {currentPlaced && (
                  <button
                    className="btn-sci-fi btn-red"
                    onClick={handleDismantle}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={14} /> DISMANTLE (+₡{Math.round(currentPlaced.module.cost * 0.75)})
                  </button>
                )}
              </div>

              {currentPlaced ? (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: `1px solid ${currentPlaced.module.color}44`, marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: currentPlaced.module.color }}>
                      {currentPlaced.module.name}
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: `${currentPlaced.module.color}22`, color: currentPlaced.module.color, fontWeight: 700 }}>
                      {currentPlaced.module.type.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '6px 0 10px' }}>
                    {currentPlaced.module.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontFamily: 'monospace', flexWrap: 'wrap' }}>
                    <span>MASS: {currentPlaced.module.mass}T</span>
                    <span>POWER: {currentPlaced.module.power >= 0 ? `+${currentPlaced.module.power}` : currentPlaced.module.power} MW</span>
                    <span>HULL: {currentPlaced.currentHp}/{currentPlaced.module.hullHp} HP</span>
                    {currentPlaced.module.shieldHp > 0 && <span>SHIELD: +{currentPlaced.module.shieldHp}</span>}
                    {currentPlaced.module.cargoCap > 0 && <span>CARGO: +{currentPlaced.module.cargoCap}T</span>}
                    {currentPlaced.module.thrust > 0 && <span>THRUST: {currentPlaced.module.thrust} kN</span>}
                    {currentPlaced.module.damage > 0 && <span>DAMAGE: {currentPlaced.module.damage} DPS</span>}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '16px' }}>
                  Slot is currently vacant. Select a module from the shipyard catalog below to fabricate and mount:
                </div>
              )}

              {/* Module Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                {['all', 'cockpit', 'reactor', 'thruster', 'cargo', 'shield', 'weapon', 'armor'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      sound.playClick(800);
                      setFilterType(type);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: filterType === type ? '1px solid var(--border-cyan)' : '1px solid rgba(255,255,255,0.1)',
                      background: filterType === type ? 'rgba(0,229,255,0.15)' : 'transparent',
                      color: filterType === type ? 'var(--border-cyan)' : 'var(--text-dim)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Available Modules Catalog Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredCatalog.map((mod) => {
                  const canAfford = credits >= mod.cost;
                  return (
                    <div
                      key={mod.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(13, 20, 36, 0.9)',
                        border: `1px solid ${mod.color}33`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: mod.color }}>
                            {mod.name}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: '4px 0 8px' }}>
                          {mod.description}
                        </p>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span>Mass: {mod.mass}T</span>
                          <span style={{ color: mod.power > 0 ? 'var(--accent-amber)' : 'var(--border-cyan)' }}>
                            {mod.power > 0 ? `+${mod.power}` : mod.power} MW
                          </span>
                          {mod.thrust > 0 && <span>Thrust: {mod.thrust}kN</span>}
                          {mod.damage > 0 && <span>DPS: {mod.damage}</span>}
                          {mod.cargoCap > 0 && <span>Cargo: +{mod.cargoCap}</span>}
                        </div>
                      </div>

                      <button
                        className="btn-sci-fi"
                        disabled={!canAfford}
                        onClick={() => handleInstallModule(mod)}
                        style={{ marginTop: '10px', padding: '6px 10px', fontSize: '0.75rem', width: '100%' }}
                      >
                        MOUNT (₡{mod.cost.toLocaleString()})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Full Shipboard Telemetry Sidebar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--accent-amber)' }}>
            VESSEL DYNAMICS & POWER GRID
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Real-time computed avionics and mass distribution
          </span>
        </div>

        {/* Telemetry Stat Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Power Balance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="var(--accent-amber)" /> POWER GRID BALANCE
              </span>
              <span className="mono" style={{ color: stats.netPower >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                {stats.netPower >= 0 ? `+${stats.netPower} MW` : `${stats.netPower} MW`}
              </span>
            </div>
            <div className="gauge-track">
              <div
                className="gauge-fill"
                style={{
                  width: `${Math.min(100, Math.max(10, (stats.powerGen / Math.max(stats.powerDraw, 1)) * 50))}%`,
                  background: stats.netPower >= 0 ? 'var(--accent-amber)' : 'var(--accent-red)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              <span>Generation: {stats.powerGen} MW</span>
              <span>Draw: {stats.powerDraw} MW</span>
            </div>
          </div>

          {/* Mass & Inertia */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Weight size={14} color="#94a3b8" /> DISPLACEMENT MASS
              </span>
              <span className="mono">{stats.totalMass} TONS</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${Math.min(100, stats.totalMass / 3)}%`, background: '#94a3b8' }} />
            </div>
          </div>

          {/* Thrust & Top Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} color="var(--accent-red)" /> PROPULSION VELOCITY
              </span>
              <span className="mono">{stats.topSpeed} KM/S</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${Math.min(100, stats.topSpeed / 4)}%`, background: 'var(--accent-red)' }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Total Thrust: {stats.thrust} kN • Turn Rate: {stats.turnRate}°/s
            </div>
          </div>

          {/* Cargo Capacity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} color="var(--border-cyan)" /> FREIGHT CAPACITY
              </span>
              <span className="mono">{stats.cargoCapacity} UNITS</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${Math.min(100, stats.cargoCapacity)}%`, background: 'var(--border-cyan)' }} />
            </div>
          </div>

          {/* Firepower */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crosshair size={14} color="var(--accent-magenta)" /> OFFENSIVE FIREPOWER
              </span>
              <span className="mono">{stats.dps} DPS</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${Math.min(100, stats.dps)}%`, background: 'var(--accent-magenta)' }} />
            </div>
          </div>

          {/* Defense Totals */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="var(--accent-green)" /> TOTAL STRUCTURAL HULL
              </span>
              <span className="mono">{stats.maxHp} HP (+{stats.maxShield} Shield)</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${Math.min(100, stats.maxHp / 8)}%`, background: 'var(--accent-green)' }} />
            </div>
          </div>
        </div>

        {/* Diagnostic Warnings */}
        <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
            SYSTEM DIAGNOSTIC:
          </div>
          {!hasCockpit && (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <AlertTriangle size={14} /> Critical: No command cockpit detected!
            </div>
          )}
          {!hasThruster && (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <AlertTriangle size={14} /> Critical: No thrusters installed! Vessel adrift.
            </div>
          )}
          {stats.netPower < 0 && (
            <div style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <AlertTriangle size={14} /> Warning: Power deficit. Engines and shields will underperform.
            </div>
          )}
          {hasCockpit && hasThruster && stats.netPower >= 0 && (
            <div style={{ color: 'var(--accent-green)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> All ship systems operational. Flight ready.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
