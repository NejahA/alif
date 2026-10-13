'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight } from 'lucide-react';

interface RoiCalculatorProps {
  onOpenDashboard: () => void;
}

export default function RoiCalculator({ onOpenDashboard }: RoiCalculatorProps) {
  const [cloudSpend, setCloudSpend] = useState(4500);
  const [teamSize, setTeamSize] = useState(8);

  const monthlySavings = Math.round(cloudSpend * 0.42);
  const annualSavings = monthlySavings * 12;
  const hoursSavedPerMonth = teamSize * 32;
  const roiMultiple = ((annualSavings / (99 * 12)).toFixed(1));

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Calculator size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>ROI Calculator</span>
          </div>
          <h2 className="section-title">Calculate Your Team's Time & Cost Savings</h2>
          <p className="section-desc">
            See how much your organization will save by automating infrastructure setup and agent workflows.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '36px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* Input Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Slider 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600 }}>
                  <span>Monthly Cloud Infrastructure Spend</span>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>${cloudSpend.toLocaleString()} / mo</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={cloudSpend}
                  onChange={(e) => setCloudSpend(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600 }}>
                  <span>Engineering Team Size</span>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{teamSize} Engineers</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

            </div>

            {/* Live Computed Metrics */}
            <div style={{ background: '#090d16', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glow)' }}>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Estimated Annual Savings
                </span>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: '1.1', marginTop: '4px' }}>
                  ${annualSavings.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: 'var(--accent-primary)' }} /> Developer Time Saved
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px' }}>
                    {hoursSavedPerMonth} hrs / mo
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={14} style={{ color: 'var(--accent-amber)' }} /> Projected ROI
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-amber)' }}>
                    {roiMultiple}x Return
                  </div>
                </div>
              </div>

              <button onClick={onOpenDashboard} className="btn btn-primary" style={{ width: '100%' }}>
                Unlock These Savings Now <ArrowRight size={16} />
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
