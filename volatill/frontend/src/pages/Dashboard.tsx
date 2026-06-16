import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI, alertAPI, watchlistAPI, forecastAPI } from '../services/api';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

interface Alert {
  _id: string;
  symbol: string;
  coinName: string;
  type: string;
  condition: number;
  triggered: boolean;
  currentPrice: number;
}

interface HotForecast {
  _id: string;
  coinId: string;
  symbol: string;
  name: string;
  forecastScore: number;
  forecastLabel: string;
  forecastDirection: string;
  nextEvent: { type: string; probability: number; description: string };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [hotForecasts, setHotForecasts] = useState<HotForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coinsRes, alertsRes, wlRes, forecastRes] = await Promise.all([
          marketAPI.getTopCoins(10),
          alertAPI.getAlerts({ triggered: 'false', dismissed: 'false' }),
          watchlistAPI.getWatchlists(),
          forecastAPI.getHotForecasts().catch(() => ({ data: [] })),
        ]);
        setTopCoins(coinsRes.data);
        setAlerts(alertsRes.data);
        setWatchlistCount(wlRes.data.reduce((sum: number, wl: any) => sum + wl.coins.length, 0));
        setHotForecasts(forecastRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (p: number) => {
    if (!p) return '$0.00';
    return p >= 1 ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(6)}`;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const totalMcap = topCoins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const totalVol = topCoins.reduce((sum, c) => sum + (c.total_volume || 0), 0);
  const avgChange = topCoins.length > 0 ? topCoins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / topCoins.length : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/market')}>View Full Market</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Market Cap (Top 10)</div>
          <div className="stat-value">${(totalMcap / 1e12).toFixed(2)}T</div>
          <div className={`stat-change ${avgChange >= 0 ? 'up' : 'down'}`}>
            {avgChange >= 0 ? '▲' : '▼'} {Math.abs(avgChange).toFixed(2)}% avg
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Volume</div>
          <div className="stat-value">${(totalVol / 1e9).toFixed(1)}B</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">{alerts.length}</div>
          <div className="stat-change" style={{ color: 'var(--accent)' }}>
            {alerts.filter(a => a.triggered).length} triggered
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Watchlist Items</div>
          <div className="stat-value">{watchlistCount}</div>
        </div>
      </div>

      {hotForecasts.length > 0 && (
        <div className="dashboard-forecast-widget">
          <div className="widget-header">
            <h2>🔮 Hot Forecasts</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/forecast')}>
              View All →
            </button>
          </div>
          <div className="forecast-widget-grid">
            {hotForecasts.map((f) => {
              const fLabel: Record<string, { label: string; color: string }> = {
                very_low: { label: 'Very Low', color: '#22c55e' },
                low: { label: 'Low', color: '#4ade80' },
                moderate: { label: 'Moderate', color: '#facc15' },
                high: { label: 'High', color: '#fb923c' },
                extreme: { label: 'Extreme', color: '#ef4444' },
              };
              const label = fLabel[f.forecastLabel] || fLabel.moderate;
              const eventIcons: Record<string, string> = {
                volatility_spike: '⚡', calm_period: '🌊', breakout: '🚀', reversal: '🔄', none: '✅',
              };
              return (
                <div key={f._id} className="forecast-widget-card" onClick={() => navigate(`/market/${f.coinId}`)}>
                  <div className="widget-coin-info">
                    <div>
                      <div className="widget-coin-name">{f.name}</div>
                      <div className="widget-coin-symbol">{f.symbol.toUpperCase()}</div>
                      {f.nextEvent && f.nextEvent.type !== 'none' && (
                        <div className="widget-event">
                          {eventIcons[f.nextEvent.type]} {f.nextEvent.type.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="widget-score" style={{ background: label.color }}>
                    {f.forecastScore}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', marginTop: '24px' }}>Top Cryptocurrencies</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>24h %</th>
                <th>Market Cap</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {topCoins.map((coin, i) => (
                <tr key={coin.id} onClick={() => navigate(`/market/${coin.id}`)}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div className="coin-cell">
                      <img src={coin.image} alt={coin.name} />
                      <div>
                        <div className="coin-name">{coin.name}</div>
                        <div className="coin-symbol">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(coin.current_price)}</td>
                  <td>
                    <span className={`badge ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {(coin.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </td>
                  <td>${(coin.market_cap / 1e9).toFixed(2)}B</td>
                  <td>${(coin.total_volume / 1e9).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}