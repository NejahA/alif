import React, { useState } from 'react';
import { ShipStats, StarSystem } from '../types/game';
import { STAR_SYSTEMS } from '../data/gameData';
import { sound } from '../utils/audio';
import { 
  Compass, 
  Navigation, 
  ShieldAlert, 
  Fuel, 
  Radio, 
  MapPin, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';

interface GalaxyMapViewProps {
  currentSystem: StarSystem;
  onJumpToSystem: (targetSystem: StarSystem) => void;
  stats: ShipStats;
  onLog: (text: string, type: 'info' | 'trade' | 'alert' | 'combat' | 'success') => void;
}

export const GalaxyMapView: React.FC<GalaxyMapViewProps> = ({
  currentSystem,
  onJumpToSystem,
  stats,
  onLog,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<StarSystem>(
    STAR_SYSTEMS.find((s) => s.id !== currentSystem.id) || STAR_SYSTEMS[0]
  );
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Compute Euclidean distance in map coordinates
  const distance = Math.round(
    Math.sqrt(
      Math.pow(selectedTarget.x - currentSystem.x, 2) +
      Math.pow(selectedTarget.y - currentSystem.y, 2)
    ) / 35
  );

  const canJump = distance <= stats.jumpRange && selectedTarget.id !== currentSystem.id && !isWarping;

  const handleWarp = () => {
    if (!canJump) return;
    setIsWarping(true);
    sound.playWarp();
    onLog(`Spooling hyperdrive coils... Jumping to [${selectedTarget.name}]!`, 'info');

    setTimeout(() => {
      setIsWarping(false);
      onJumpToSystem(selectedTarget);
    }, 1800);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 380px', gap: '20px', padding: '0 16px 24px' }}>
      {/* Left: Star Chart Canvas */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--border-cyan)' }}>
              PERSEUS SECTOR STAR-LANES
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Sub-space hyperjump coordinates and gravity lanes
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Fuel size={14} color="var(--border-cyan)" />
            <span>Hyperjump Max Range: <strong className="mono" style={{ color: '#fff' }}>{stats.jumpRange} LY</strong></span>
          </div>
        </div>

        {/* Galaxy Map Canvas / SVG */}
        <div style={{
          width: '100%',
          height: '460px',
          background: 'rgba(5, 8, 17, 0.85)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 32px rgba(0, 0, 0, 0.8)'
        }}>
          {/* Subtle Grid Lines */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            {/* Draw Star Lanes connecting systems */}
            {STAR_SYSTEMS.map((s1, i) =>
              STAR_SYSTEMS.slice(i + 1).map((s2) => (
                <line
                  key={`${s1.id}-${s2.id}`}
                  x1={s1.x}
                  y1={s1.y}
                  x2={s2.x}
                  y2={s2.y}
                  stroke="rgba(0, 229, 255, 0.12)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              ))
            )}

            {/* Jump Range Circle around current location */}
            <circle
              cx={currentSystem.x}
              cy={currentSystem.y}
              r={stats.jumpRange * 35}
              fill="rgba(0, 229, 255, 0.03)"
              stroke="rgba(0, 229, 255, 0.35)"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Star System Node Markers */}
          {STAR_SYSTEMS.map((sys) => {
            const isCurrent = currentSystem.id === sys.id;
            const isTarget = selectedTarget.id === sys.id;

            return (
              <div
                key={sys.id}
                onClick={() => {
                  sound.playClick(900);
                  setSelectedTarget(sys);
                }}
                style={{
                  position: 'absolute',
                  left: `${sys.x}px`,
                  top: `${sys.y}px`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Orbital Ring / Pulse */}
                <div
                  style={{
                    width: isTarget ? '36px' : isCurrent ? '30px' : '22px',
                    height: isTarget ? '36px' : isCurrent ? '30px' : '22px',
                    borderRadius: '50%',
                    background: `${sys.accentColor}22`,
                    border: isTarget
                      ? `2px solid #fff`
                      : isCurrent
                      ? `2px solid ${sys.accentColor}`
                      : `1px solid ${sys.accentColor}88`,
                    boxShadow: isTarget
                      ? `0 0 18px ${sys.accentColor}`
                      : `0 0 10px ${sys.accentColor}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isTarget ? '#fff' : sys.accentColor,
                    }}
                  />
                </div>

                {/* System Name Tag */}
                <div
                  style={{
                    marginTop: '6px',
                    background: isTarget ? 'rgba(0, 229, 255, 0.3)' : 'rgba(15, 23, 42, 0.85)',
                    border: `1px solid ${isTarget ? 'var(--border-cyan)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isTarget ? '#fff' : '#cbd5e1',
                    letterSpacing: '0.5px'
                  }}
                >
                  {sys.name} {isCurrent && '★'}
                </div>
              </div>
            );
          })}

          {/* Warp Tunnel Transition Overlay */}
          {isWarping && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(0,229,255,0.4) 0%, rgba(5,8,17,0.95) 80%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}>
              <Sparkles size={48} color="var(--border-cyan)" className="animate-spin" />
              <div style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '3px', color: '#fff' }}>
                HYPERDRIVE ENGAGED
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--border-cyan)', letterSpacing: '1px', marginTop: '4px' }}>
                TRANSITING SUB-SPACE CORRIDOR...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Destination Debrief & Warp Control */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: selectedTarget.accentColor,
              boxShadow: `0 0 10px ${selectedTarget.accentColor}`
            }} />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                {selectedTarget.name}
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {selectedTarget.subtitle}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          {selectedTarget.tagline}
        </p>

        {/* Security & Threat Metrics */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SECURITY RATING:</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: selectedTarget.security >= 4 ? 'rgba(0,229,255,0.2)' : selectedTarget.security === 0 ? 'rgba(255,23,68,0.2)' : 'rgba(255,214,0,0.2)',
              color: selectedTarget.security >= 4 ? 'var(--border-cyan)' : selectedTarget.security === 0 ? 'var(--accent-red)' : 'var(--accent-amber)',
            }}>
              SEC {selectedTarget.security} / 5 • {selectedTarget.security === 0 ? 'LAWLESS' : selectedTarget.security >= 4 ? 'HIGH PATROL' : 'MODERATE'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TRAVEL DISTANCE:</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {selectedTarget.id === currentSystem.id ? '0 LY (Current System)' : `${distance} LIGHT YEARS`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>DRIVE STATUS:</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: canJump ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              {selectedTarget.id === currentSystem.id
                ? 'CURRENT LOCATION'
                : distance <= stats.jumpRange
                ? 'IN JUMP RANGE'
                : 'OUT OF RANGE'}
            </span>
          </div>
        </div>

        {/* Transit Encounter Risks */}
        <div style={{ background: 'rgba(5, 8, 17, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>
            TRANSIT PROGNOSIS:
          </div>
          {selectedTarget.security === 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> High danger: Pirate corsairs frequent this trade lane!
            </div>
          )}
          {selectedTarget.security >= 4 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--border-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> Customs inspection checkpoint stationed at jump terminus.
            </div>
          )}
          {selectedTarget.security > 0 && selectedTarget.security < 4 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} /> Standard commercial freight traffic. Derelict salvage possible.
            </div>
          )}
        </div>

        {/* Warp Execution Button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            className="btn-sci-fi"
            disabled={!canJump}
            onClick={handleWarp}
            style={{ width: '100%', padding: '16px', fontSize: '0.95rem' }}
          >
            <Navigation size={18} />
            {isWarping ? 'WARP IN PROGRESS...' : `ENGAGE HYPERDRIVE TO ${selectedTarget.name.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
