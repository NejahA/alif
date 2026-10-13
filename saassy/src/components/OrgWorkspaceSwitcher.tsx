'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Building, Check, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function OrgWorkspaceSwitcher() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org_acme');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    deployProd: true,
    rotateKeys: true,
    viewLogs: true,
    deleteClusters: false,
  });

  useEffect(() => {
    fetch('/api/orgs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrgs(data.data);
      })
      .catch(() => {});
  }, []);

  const activeOrg = orgs.find((o) => o.id === selectedOrgId) || {
    name: 'Acme Corp (Prod)',
    plan: 'Enterprise',
    membersCount: 42,
    region: 'us-east-1',
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Users size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Multi-Tenant RBAC</span>
          </div>
          <h2 className="section-title">Team Workspace & Permission Governance</h2>
          <p className="section-desc">
            Manage multi-tenant enterprise organizations, isolated environments, and role permissions.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '36px' }}>
          
          {/* Org Selector Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Active Organization
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#090d16',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} — ({org.plan})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team Members</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeOrg.membersCount} Users
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primary Region</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {activeOrg.region}
                </div>
              </div>
            </div>

          </div>

          {/* Role Permissions Matrix */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--accent-primary)' }} /> Role Permission Policy (Developer Role)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { key: 'deployProd', label: 'Deploy Production Edge Routes' },
                { key: 'rotateKeys', label: 'Rotate Secret API Keys' },
                { key: 'viewLogs', label: 'Access Audit Logs & Telemetry' },
                { key: 'deleteClusters', label: 'Delete Cluster Nodes' },
              ].map((perm) => {
                const isEnabled = permissions[perm.key];
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    style={{
                      background: '#090d16',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: isEnabled ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {perm.label}
                    </span>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isEnabled ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isEnabled && <Check size={14} style={{ color: '#fff' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
