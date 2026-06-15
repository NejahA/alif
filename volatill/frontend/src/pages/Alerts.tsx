import { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';

interface Alert {
  _id: string;
  coinId: string;
  symbol: string;
  coinName: string;
  type: string;
  condition: number;
  currentPrice: number;
  triggered: boolean;
  triggeredAt: string | null;
  dismissed: boolean;
  createdAt: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter === 'active') { params.dismissed = 'false'; params.triggered = 'false'; }
      else if (filter === 'triggered') { params.triggered = 'true'; params.dismissed = 'false'; }
      else if (filter === 'dismissed') { params.dismissed = 'true'; }
      const res = await alertAPI.getAlerts(params);
      setAlerts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  const dismissAlert = async (id: string) => {
    try {
      await alertAPI.updateAlert(id, { dismissed: true });
      fetchAlerts();
    } catch (err) { console.error(err); }
  };

  const deleteAlert = async (id: string) => {
    try {
      await alertAPI.deleteAlert(id);
      fetchAlerts();
    } catch (err) { console.error(err); }
  };

  const dismissAll = async () => {
    try {
      await alertAPI.dismissAll();
      fetchAlerts();
    } catch (err) { console.error(err); }
  };

  const formatPrice = (p: number | undefined | null) => {
    if (p == null) return '-';
    return p >= 1 ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `$${p.toFixed(6)}`;
  };

  const getAlertLabel = (type: string, condition: number) => {
    switch (type) {
      case 'price_above': return `Price above ${formatPrice(condition)}`;
      case 'price_below': return `Price below ${formatPrice(condition)}`;
      case 'volatility': return `Volatility > ${condition}%`;
      case 'percent_change': return `Change > ${condition}%`;
      default: return type;
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" />;</div>;

  const hasTriggered = alerts.some(a => a.triggered && !a.dismissed);

  return (
    <div>
      <div className="page-header">
        <h1>Alerts {hasTriggered ? <span style={{ color: 'var(--danger)', fontSize: 14, fontWeight: 400 }}>⚠ Some triggered!</span> : null}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {['all', 'active', 'triggered', 'dismissed'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {hasTriggered && (
            <button className="btn btn-secondary btn-sm" onClick={dismissAll}>Dismiss All</button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <p>No alerts found. Set alerts from coin detail pages!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(alert => (
            <div key={alert._id} className="card" style={{
              borderColor: alert.triggered ? 'var(--danger)' : alert.dismissed ? 'var(--border)' : 'var(--accent)',
              opacity: alert.dismissed ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{alert.coinName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{alert.symbol}</span>
                    {alert.triggered && <span className="badge badge-red">Triggered</span>}
                    {alert.dismissed && <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Dismissed</span>}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {getAlertLabel(alert.type, alert.condition)}
                  </div>
                  {alert.triggered && alert.currentPrice > 0 && (
                    <div style={{ color: 'var(--text-primary)', fontSize: 13, marginTop: 4 }}>
                      Price when triggered: {formatPrice(alert.currentPrice)}
                      {alert.triggeredAt && ` (${new Date(alert.triggeredAt).toLocaleString()})`}
                    </div>
                  )}
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                    Created {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!alert.dismissed && (
                    <button className="btn btn-ghost btn-sm" onClick={() => dismissAlert(alert._id)}>✓ Dismiss</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteAlert(alert._id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}