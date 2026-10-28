import React from 'react';
import './HiroLogo.css';

/**
 * HiroLogo - Official Brand Logo for hi§ro
 * 
 * Concept: Neuroplasticity & Growth
 * - Symmetrical neural arbor / brain tree
 * - Intertwining double-helix synaptic cleft (§ motif)
 * - Bioluminescent bio-cyan & astral-violet synaptic nodes
 * - Custom hi§ro gradient typography
 */
export const HiroLogo = ({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  variant = 'full', // 'full' | 'emblem' | 'wordmark'
  showTagline = true,
  animated = true,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`hiro-logo hiro-logo-${size} ${animated ? 'is-animated' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label="hi§ro - Neuroplasticity & Synapse Garden"
    >
      {(variant === 'full' || variant === 'emblem') && (
        <div className="hiro-emblem-container">
          <svg
            className="hiro-emblem-svg"
            viewBox="0 0 300 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="reactCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f5a0" />
                <stop offset="60%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="reactVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>

              <linearGradient id="reactHelixGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#00f5a0" />
                <stop offset="50%" stopColor="#00e5ff" />
                <stop offset="80%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>

              <filter id="reactLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Central Glow Field */}
            <circle cx="150" cy="110" r="70" fill="#00e5ff" opacity="0.08" filter="url(#reactLogoGlow)" />
            <circle cx="150" cy="110" r="50" fill="#a855f7" opacity="0.08" filter="url(#reactLogoGlow)" />

            <g filter="url(#reactLogoGlow)">
              {/* Left Brain Hemisphere (Bio-Cyan/Mint) */}
              <g stroke="url(#reactCyanGrad)" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 142 130 C 122 118, 98 112, 78 88 C 66 74, 62 48, 88 34 C 114 20, 138 42, 142 72" strokeWidth="3.2" />
                <path d="M 120 102 C 95 102, 75 125, 60 118 C 48 112, 45 92, 56 80" strokeWidth="2.5" />
                <path d="M 100 78 C 82 70, 75 52, 82 38" strokeWidth="2" />
                <path d="M 132 80 C 118 60, 115 38, 126 26" strokeWidth="2" />
                <path d="M 78 88 C 68 98, 56 94, 50 86" strokeWidth="1.8" />
                <path d="M 68 118 C 70 132, 80 138, 92 134" strokeWidth="1.8" />

                {/* Synaptic nodes */}
                <g fill="#00f5a0" stroke="#ffffff" strokeWidth="1">
                  <circle cx="50" cy="86" r="3.5" />
                  <circle cx="56" cy="80" r="3" />
                  <circle cx="88" cy="34" r="3.8" />
                  <circle cx="126" cy="26" r="3.5" />
                  <circle cx="92" cy="134" r="3" />
                  <circle cx="78" cy="88" r="2.8" />
                </g>
              </g>

              {/* Right Brain Hemisphere (Astral-Violet/Pink) */}
              <g stroke="url(#reactVioletGrad)" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 158 130 C 178 118, 202 112, 222 88 C 234 74, 238 48, 212 34 C 186 20, 162 42, 158 72" strokeWidth="3.2" />
                <path d="M 180 102 C 205 102, 225 125, 240 118 C 252 112, 255 92, 244 80" strokeWidth="2.5" />
                <path d="M 200 78 C 218 70, 225 52, 218 38" strokeWidth="2" />
                <path d="M 168 80 C 182 60, 185 38, 174 26" strokeWidth="2" />
                <path d="M 222 88 C 232 98, 244 94, 250 86" strokeWidth="1.8" />
                <path d="M 232 118 C 230 132, 220 138, 208 134" strokeWidth="1.8" />

                {/* Synaptic nodes */}
                <g fill="#ec4899" stroke="#ffffff" strokeWidth="1">
                  <circle cx="250" cy="86" r="3.5" />
                  <circle cx="244" cy="80" r="3" />
                  <circle cx="212" cy="34" r="3.8" />
                  <circle cx="174" cy="26" r="3.5" />
                  <circle cx="208" cy="134" r="3" />
                  <circle cx="222" cy="88" r="2.8" />
                </g>
              </g>

              {/* Center Intertwining Trunk & Section Symbol (§) */}
              <g strokeLinecap="round">
                <path d="M 140 215 C 130 195, 170 185, 158 160 C 150 144, 140 138, 142 130" 
                      fill="none" stroke="url(#reactCyanGrad)" strokeWidth="3.8" />
                <path d="M 160 215 C 170 195, 130 185, 142 160 C 150 144, 160 138, 158 130" 
                      fill="none" stroke="url(#reactVioletGrad)" strokeWidth="3.8" />

                {/* Central Section Sign (§) */}
                <path d="M 158 82 C 160 72, 154 64, 148 64 C 142 64, 138 69, 140 76 C 142 84, 160 88, 160 98 C 160 106, 152 112, 146 110 C 140 108, 138 102, 139 98" 
                      fill="none" stroke="url(#reactHelixGrad)" strokeWidth="3.5" />
                <circle cx="150" cy="88" r="2.5" fill="#ffffff" />
              </g>
            </g>
          </svg>
          <div className="hiro-pulse-aura" />
        </div>
      )}

      {(variant === 'full' || variant === 'wordmark') && (
        <div className="hiro-typography-wrap">
          <div className="hiro-brand-name">
            <span className="hiro-letter-hi">hi</span>
            <span className="hiro-symbol-section">§</span>
            <span className="hiro-letter-ro">ro</span>
          </div>
          {showTagline && (
            <span className="hiro-brand-sub">neuroplasticity & growth</span>
          )}
        </div>
      )}
    </div>
  );
};

export default HiroLogo;
