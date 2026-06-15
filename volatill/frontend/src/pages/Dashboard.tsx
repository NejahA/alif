import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI, alertAPI, watchlistAPI } from '../services/api';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coinsRes, alertsRes, wlRes] = await Promise.all([
          marketAPI.getTopCoins(10),
          alertAPI.getAlerts({ triggered: 'false', dismissed: 'false' }),
          watchlistAPI.getWatchlists(),
        ]);
        setTopCoins(coinsRes.data);
        setAlerts(alertsRes.data);
        setWatchlistCount(wlRes.data.reduce((sum: number, wl: any) => sum + wl.coins.length, 0));
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

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Top Cryptocurrencies</h2>
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