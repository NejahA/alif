'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';

interface PricingProps {
  onOpenDashboard: () => void;
}

export default function Pricing({ onOpenDashboard }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [teamSeats, setTeamSeats] = useState<number>(5);

  const discount = billingCycle === 'annual' ? 0.8 : 1.0;

  const baseStarterPrice = Math.round(29 * discount);
  const baseProPrice = Math.round(79 * discount);
  const baseEnterprisePrice = Math.round(249 * discount);

  return (
    <section id="pricing" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="section-title">Scalable Plans for Any Growth Stage</h2>
          <p className="section-desc">
            No hidden fees. Upgrade or downgrade anytime with 14-day money-back guarantee.
          </p>

          {/* Toggle Monthly / Annual */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
            <span style={{ color: billingCycle === 'monthly' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>Monthly</span>
            
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              style={{
                width: '56px',
                height: '30px',
                borderRadius: '15px',
                background: billingCycle === 'annual' ? 'var(--gradient-brand)' : 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: '3px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  transform: billingCycle === 'annual' ? 'translateX(26px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}
              />
            </button>

            <span style={{ color: billingCycle === 'annual' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Annual Billing
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px' }}>
                Save 20%
              </span>
            </span>
          </div>

          {/* Seat Slider */}
          <div style={{ maxWidth: '400px', margin: '28px auto 0 auto', padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Team Seats:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{teamSeats} Seats</strong>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={teamSeats}
              onChange={(e) => setTeamSeats(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'stretch' }}>
          
          {/* Starter Plan */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Developer</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Ideal for indie hackers and early prototypes.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800 }}>${baseStarterPrice * teamSeats}</span>
                <span style={{ color: 'var(--text-muted)' }}> / month</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Up to 50,000 requests/mo
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> 3 Autonomous Agents
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Standard Community Support
                </li>
              </ul>
            </div>

            <button onClick={onOpenDashboard} className="btn btn-secondary" style={{ width: '100%' }}>
              Start Free Trial
            </button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderColor: 'var(--accent-primary)',
              boxShadow: 'var(--shadow-glow)',
              transform: 'scale(1.03)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Pro Scale</h3>
                <span style={{ background: 'var(--gradient-brand)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                  MOST POPULAR
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>For scaling startups requiring max throughput.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800 }}>${baseProPrice * teamSeats}</span>
                <span style={{ color: 'var(--text-muted)' }}> / month</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Unlimited Requests
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> 25 Autonomous Agents
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Sub-15ms Latency Guarantee
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> 24/7 Priority SLA Support
                </li>
              </ul>
            </div>

            <button onClick={onOpenDashboard} className="btn btn-primary" style={{ width: '100%' }}>
              Get Pro Scale <Sparkles size={16} />
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Enterprise</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Dedicated infrastructure & custom SLA.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800 }}>${baseEnterprisePrice * teamSeats}</span>
                <span style={{ color: 'var(--text-muted)' }}> / month</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Dedicated Isolated Clusters
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Custom AI Fine-Tuning
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                  <Check size={18} style={{ color: 'var(--accent-emerald)' }} /> Dedicated Account Engineer
                </li>
              </ul>
            </div>

            <button onClick={onOpenDashboard} className="btn btn-secondary" style={{ width: '100%' }}>
              Contact Sales
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
