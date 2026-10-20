import React from 'react';
import { ShipStats, StarSystem } from '../types/game';
import { sound } from '../utils/audio';
import { 
  Wrench, 
  Compass, 
  ShoppingBag, 
  Crosshair, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Coins, 
  Package, 
  Heart,
  Shield
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'shipyard' | 'map' | 'market' | 'flight';
  onSelectTab: (tab: 'shipyard' | 'map' | 'market' | 'flight') => void;
  credits: number;
  stats: ShipStats;
  currentHp: number;
  currentShield: number;
  cargoCount: number;
  currentSystem: StarSystem;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  credits,
  stats,
  currentHp,
  currentShield,
  cargoCount,
  currentSystem,
  soundEnabled,
  onToggleSound,
}) => {
  const hpPct = Math.round((currentHp / Math.max(stats.maxHp, 1)) * 100);
  const shieldPct = Math.round((currentShield / Math.max(stats.maxShield, 1)) * 100);

  return (
    <header className="glass-panel" style={{ margin: '12px 16px', padding: '12px 20px' }}>
      {/* Top Telemetry Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00e5ff 0%, #d500f9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)'
          }}>
            <Compass size={22} color="#050811" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '2px', lineHeight: 1 }}>
              VOID <span style={{ color: 'var(--border-cyan)' }}>MERCHANT</span>
            </h1>
            <span style={{ fontSize: '0.68rem', letterSpacing: '1.5px', color: 'var(--text-dim)' }}>
              STAR HOPPER • MODULAR DRIFTER
            </span>
          </div>
        </div>

        {/* Current Location Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${currentSystem.accentColor}44` }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentSystem.accentColor, boxShadow: `0 0 8px ${currentSystem.accentColor}` }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentSystem.name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              SEC {currentSystem.security} • {currentSystem.subtitle}
            </div>
          </div>
        </div>

        {/* Resource Vitals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Credits */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={18} color="var(--accent-amber)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>CREDITS</div>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                ₡{credits.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Hull Integrity */}
          <div style={{ minWidth: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-red)' }}>
                <Heart size={12} /> HULL
              </span>
              <span className="mono">{currentHp}/{stats.maxHp} ({hpPct}%)</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${hpPct}%`, background: 'var(--accent-red)' }} />
            </div>
          </div>

          {/* Shields */}
          <div style={{ minWidth: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--border-cyan)' }}>
                <Shield size={12} /> SHIELDS
              </span>
              <span className="mono">{currentShield}/{stats.maxShield} ({shieldPct}%)</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${shieldPct}%`, background: 'var(--border-cyan)' }} />
            </div>
          </div>

          {/* Cargo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={18} color="#b0bec5" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>CARGO BAY</div>
              <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {cargoCount} / {stats.cargoCapacity} T
              </div>
            </div>
          </div>

          {/* Audio Mute Button */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick(600);
            }}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: soundEnabled ? 'var(--border-cyan)' : 'var(--text-dim)',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
        <button
          className={`nav-tab ${currentTab === 'shipyard' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick(750);
            onSelectTab('shipyard');
          }}
        >
          <Wrench size={16} /> MODULAR SHIPYARD
        </button>

        <button
          className={`nav-tab ${currentTab === 'market' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick(750);
            onSelectTab('market');
          }}
        >
          <ShoppingBag size={16} /> COMMODITY MARKET
        </button>

        <button
          className={`nav-tab ${currentTab === 'map' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick(750);
            onSelectTab('map');
          }}
        >
          <Compass size={16} /> GALAXY STAR-LANES
        </button>

        <button
          className={`nav-tab ${currentTab === 'flight' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick(750);
            onSelectTab('flight');
          }}
          style={{
            color: currentTab === 'flight' ? 'var(--accent-amber)' : 'inherit',
            borderBottomColor: currentTab === 'flight' ? 'var(--accent-amber)' : 'transparent',
          }}
        >
          <Crosshair size={16} /> SECTOR FLIGHT & COMBAT
        </button>
      </nav>
    </header>
  );
};
