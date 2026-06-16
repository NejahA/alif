import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistAPI, marketAPI } from '../services/api';

interface CoinItem {
  coinId: string;
  symbol: string;
  name: string;
  notes: string;
  addedAt: string;
}

interface Watchlist {
  _id: string;
  name: string;
  coins: CoinItem[];
  isDefault: boolean;
}

export default function Watchlists() {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [prices, setPrices] = useState<Record<string, { usd: number }>>({});
  const fetchWatchlists = async () => {
    try {
      const res = await watchlistAPI.getWatchlists();
      setWatchlists(res.data);

      // Fetch prices for all watched coins
      const allCoinIds = res.data.flatMap((wl: Watchlist) => wl.coins.map(c => c.coinId));
      if (allCoinIds.length > 0) {
        const priceRes = await marketAPI.getPrices(allCoinIds);
        setPrices(priceRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWatchlists(); }, []);

  const createWatchlist = async () => {
    if (!createName.trim()) return;
    try {
      await watchlistAPI.createWatchlist(createName);
      setCreateName('');
      setShowCreate(false);
      fetchWatchlists();
    } catch (err) { console.error(err); }
  };

  const removeCoin = async (wlId: string, coinId: string) => {
    try {
      await watchlistAPI.removeCoin(wlId, coinId);
      fetchWatchlists();
    } catch (err) { console.error(err); }
  };

  const deleteWatchlist = async (wlId: string) => {
    try {
      await watchlistAPI.deleteWatchlist(wlId);
      fetchWatchlists();
    } catch (err) { console.error(err); }
  };

  const formatPrice = (p: number | undefined | null) => {
    if (p == null) return '-';
    return p >= 1 ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(6)}`;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" />;</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Watchlists</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Watchlist
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input className="input" style={{ flex: 1 }} placeholder="Watchlist name..." value={createName} onChange={e => setCreateName(e.target.value)} />
          <button className="btn btn-primary" onClick={createWatchlist} disabled={!createName.trim()}>Create</button>
          <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
        </div>
      )}

      {watchlists.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <p>No watchlists yet. Create one to start tracking your favorite coins!</p>
        </div>
      ) : (
        watchlists.map(wl => (
          <div key={wl._id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                {wl.name} {wl.isDefault && <span className="chip">Default</span>}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                  {wl.coins.length} coin{wl.coins.length !== 1 ? 's' : ''}
                </span>
              </h3>
              {!wl.isDefault && (
                <button className="btn btn-ghost btn-sm" onClick={() => deleteWatchlist(wl._id)}>🗑️</button>
              )}
            </div>

            {wl.coins.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No coins in this watchlist</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th>Price</th>
                      <th>Added</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {wl.coins.map(coin => (
                      <tr key={coin.coinId}>
                        <td>
                          <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/market/${coin.coinId}`)}>
                            <span style={{ fontWeight: 500 }}>{coin.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>{coin.symbol}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{formatPrice(prices[coin.coinId]?.usd)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(coin.addedAt).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{coin.notes || '-'}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => removeCoin(wl._id, coin.coinId)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}