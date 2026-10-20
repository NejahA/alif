import React, { useState } from 'react';
import { CargoEntry, Commodity, PlacedModule, ShipStats, StarSystem } from '../types/game';
import { COMMODITIES } from '../data/gameData';
import { sound } from '../utils/audio';
import { 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package, 
  ShieldAlert, 
  Coins, 
  AlertTriangle,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface MarketViewProps {
  currentSystem: StarSystem;
  cargo: CargoEntry[];
  onUpdateCargo: (newCargo: CargoEntry[]) => void;
  credits: number;
  onUpdateCredits: (newCredits: number) => void;
  stats: ShipStats;
  placedModules: PlacedModule[];
  onLog: (text: string, type: 'info' | 'trade' | 'alert' | 'combat' | 'success') => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  currentSystem,
  cargo,
  onUpdateCargo,
  credits,
  onUpdateCredits,
  stats,
  placedModules,
  onLog,
}) => {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITIES[0]);
  const [tradeQty, setTradeQty] = useState<number>(1);

  // Calculate current total cargo mass/volume
  const currentCargoMass = cargo.reduce((sum, item) => {
    const com = COMMODITIES.find((c) => c.id === item.commodityId);
    return sum + (com ? item.quantity * com.unitMass : item.quantity);
  }, 0);

  const availableSpace = Math.max(0, stats.cargoCapacity - currentCargoMass);

  // Check if ship has shielded smuggler hold
  const hasSmugglerHold = placedModules.some((m) => m.module.isContrabandShielded);
  const totalContrabandUnits = cargo.reduce((sum, item) => {
    const com = COMMODITIES.find((c) => c.id === item.commodityId);
    return com?.isIllegal ? sum + item.quantity : sum;
  }, 0);

  // Market entry for selected commodity in this system
  const marketEntry = currentSystem.market[selectedCommodity.id] || {
    buyPrice: selectedCommodity.basePrice,
    sellPrice: Math.round(selectedCommodity.basePrice * 0.8),
    stock: 0,
  };

  // Find user's cargo for selected
  const userCargoEntry = cargo.find((c) => c.commodityId === selectedCommodity.id);
  const userQty = userCargoEntry ? userCargoEntry.quantity : 0;
  const userAvgPrice = userCargoEntry ? userCargoEntry.avgBuyPrice : 0;

  // Max quantities
  const maxBuyAffordable = Math.floor(credits / Math.max(marketEntry.buyPrice, 1));
  const maxBuySpace = Math.floor(availableSpace / selectedCommodity.unitMass);
  const maxBuyPossible = Math.min(marketEntry.stock, maxBuyAffordable, maxBuySpace);
  const maxSellPossible = userQty;

  const handleBuy = (quantity: number) => {
    if (quantity <= 0) return;
    const totalCost = quantity * marketEntry.buyPrice;
    if (credits < totalCost) {
      sound.playAlarm();
      onLog(`Insufficient credits (₡${totalCost} needed).`, 'alert');
      return;
    }
    if (quantity * selectedCommodity.unitMass > availableSpace) {
      sound.playAlarm();
      onLog('Cargo holds are completely full!', 'alert');
      return;
    }

    // Update credits
    onUpdateCredits(credits - totalCost);

    // Update cargo
    const existingIndex = cargo.findIndex((c) => c.commodityId === selectedCommodity.id);
    let updatedCargo = [...cargo];
    if (existingIndex >= 0) {
      const existing = updatedCargo[existingIndex];
      const newTotalQty = existing.quantity + quantity;
      const newAvgPrice = Math.round(
        (existing.quantity * existing.avgBuyPrice + totalCost) / newTotalQty
      );
      updatedCargo[existingIndex] = {
        ...existing,
        quantity: newTotalQty,
        avgBuyPrice: newAvgPrice,
      };
    } else {
      updatedCargo.push({
        commodityId: selectedCommodity.id,
        quantity,
        avgBuyPrice: marketEntry.buyPrice,
      });
    }
    onUpdateCargo(updatedCargo);

    // Deduct stock
    currentSystem.market[selectedCommodity.id].stock -= quantity;

    sound.playTradeCash();
    onLog(
      `Purchased ${quantity}x ${selectedCommodity.name} for ₡${totalCost.toLocaleString()} at ${currentSystem.name}.`,
      'trade'
    );
  };

  const handleSell = (quantity: number) => {
    if (quantity <= 0 || quantity > userQty) return;
    const totalPayout = quantity * marketEntry.sellPrice;

    // Update credits
    onUpdateCredits(credits + totalPayout);

    // Update cargo
    let updatedCargo = cargo
      .map((c) => {
        if (c.commodityId === selectedCommodity.id) {
          return { ...c, quantity: c.quantity - quantity };
        }
        return c;
      })
      .filter((c) => c.quantity > 0);

    onUpdateCargo(updatedCargo);

    // Add back to market stock
    currentSystem.market[selectedCommodity.id].stock += quantity;

    sound.playTradeCash();
    const profit = totalPayout - quantity * userAvgPrice;
    const profitText = profit >= 0 ? `(+₡${profit} profit)` : `(-₡${Math.abs(profit)} loss)`;
    onLog(
      `Sold ${quantity}x ${selectedCommodity.name} for ₡${totalPayout.toLocaleString()} ${profitText}.`,
      profit >= 0 ? 'success' : 'trade'
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 380px', gap: '20px', padding: '0 16px 24px' }}>
      {/* Left: Commodities Exchange Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--border-cyan)' }}>
              LOCAL COMMODITIES EXCHANGE
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {currentSystem.name} • Trading Hub Terminal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Cargo Bay: <span className="mono" style={{ color: availableSpace > 0 ? '#fff' : 'var(--accent-red)' }}>{currentCargoMass} / {stats.cargoCapacity} T</span>
            </span>
          </div>
        </div>

        {/* Contraband Banner */}
        {totalContrabandUnits > 0 && (
          <div style={{
            background: hasSmugglerHold ? 'rgba(224, 64, 251, 0.12)' : 'rgba(255, 23, 68, 0.15)',
            border: `1px solid ${hasSmugglerHold ? 'var(--accent-magenta)' : 'var(--accent-red)'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldAlert size={20} color={hasSmugglerHold ? 'var(--accent-magenta)' : 'var(--accent-red)'} />
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: hasSmugglerHold ? 'var(--accent-magenta)' : 'var(--accent-red)' }}>
                {hasSmugglerHold ? 'SHIELDED SMUGGLER CONCEALMENT ACTIVE' : 'UNSHIELDED CONTRABAND DETECTED!'}
              </span>
              <div style={{ color: 'var(--text-dim)', marginTop: '2px' }}>
                {hasSmugglerHold
                  ? `Holding ${totalContrabandUnits} units in lead-lined bays. Scanners will fail to detect cargo.`
                  : `Holding ${totalContrabandUnits} illegal units in open bays. Core patrols will fine and seize upon scan!`}
              </div>
            </div>
          </div>
        )}

        {/* Commodity Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {COMMODITIES.map((com) => {
            const entry = currentSystem.market[com.id] || { buyPrice: com.basePrice, sellPrice: Math.round(com.basePrice * 0.8), stock: 0 };
            const isSelected = selectedCommodity.id === com.id;
            const inCargo = cargo.find((c) => c.commodityId === com.id);
            const holding = inCargo ? inCargo.quantity : 0;

            return (
              <div
                key={com.id}
                onClick={() => {
                  sound.playClick(850);
                  setSelectedCommodity(com);
                  setTradeQty(1);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'rgba(5, 8, 17, 0.6)',
                  border: isSelected ? '1px solid var(--border-cyan)' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{com.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: com.isIllegal ? 'var(--accent-magenta)' : '#fff' }}>
                        {com.name}
                      </span>
                      {com.isIllegal && (
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(224,64,251,0.2)', color: 'var(--accent-magenta)', fontWeight: 700 }}>
                          ILLEGAL
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {com.category.toUpperCase()} • Mass: {com.unitMass}T
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>STOCK</div>
                    <div className="mono" style={{ fontSize: '0.85rem' }}>{entry.stock}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>BUY AT</div>
                    <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--border-cyan)', fontWeight: 700 }}>
                      ₡{entry.buyPrice}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>SELL AT</div>
                    <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                      ₡{entry.sellPrice}
                    </div>
                  </div>

                  <div style={{ minWidth: '60px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>IN HOLD</div>
                    <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: holding > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                      {holding}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Order Desk Terminal */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>{selectedCommodity.icon}</span>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedCommodity.isIllegal ? 'var(--accent-magenta)' : '#fff' }}>
                {selectedCommodity.name}
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {selectedCommodity.category.toUpperCase()} • BASE ₡{selectedCommodity.basePrice}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          {selectedCommodity.description}
        </p>

        {/* Current Position in Hold */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-dim)' }}>In Your Cargo Bay:</span>
            <span className="mono" style={{ fontWeight: 700 }}>{userQty} units</span>
          </div>
          {userQty > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Average Buy Price:</span>
              <span className="mono">₡{userAvgPrice}</span>
            </div>
          )}
          {userQty > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Unrealized Margin:</span>
              <span className="mono" style={{ color: marketEntry.sellPrice >= userAvgPrice ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                {marketEntry.sellPrice >= userAvgPrice ? '+' : ''}
                {Math.round(((marketEntry.sellPrice - userAvgPrice) / Math.max(userAvgPrice, 1)) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-dim)' }}>TRANSACTION VOLUME:</span>
            <span className="mono" style={{ fontWeight: 700 }}>{tradeQty} UNITS</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-sci-fi"
              style={{ padding: '6px 12px' }}
              onClick={() => setTradeQty(Math.max(1, tradeQty - 5))}
            >
              -5
            </button>
            <button
              className="btn-sci-fi"
              style={{ padding: '6px 12px' }}
              onClick={() => setTradeQty(Math.max(1, tradeQty - 1))}
            >
              -1
            </button>
            <input
              type="range"
              min="1"
              max={Math.max(20, maxBuyPossible, maxSellPossible)}
              value={tradeQty}
              onChange={(e) => setTradeQty(parseInt(e.target.value) || 1)}
              style={{ flex: 1, accentColor: 'var(--border-cyan)' }}
            />
            <button
              className="btn-sci-fi"
              style={{ padding: '6px 12px' }}
              onClick={() => setTradeQty(tradeQty + 1)}
            >
              +1
            </button>
            <button
              className="btn-sci-fi"
              style={{ padding: '6px 12px' }}
              onClick={() => setTradeQty(tradeQty + 5)}
            >
              +5
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
          {/* Buy Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
            <button
              className="btn-sci-fi"
              disabled={maxBuyPossible <= 0}
              onClick={() => handleBuy(Math.min(tradeQty, maxBuyPossible))}
              style={{ width: '100%', padding: '12px' }}
            >
              <ArrowDownLeft size={16} /> BUY {Math.min(tradeQty, maxBuyPossible || 1)} (₡{(Math.min(tradeQty, maxBuyPossible || 1) * marketEntry.buyPrice).toLocaleString()})
            </button>
            <button
              className="btn-sci-fi"
              disabled={maxBuyPossible <= 0}
              onClick={() => handleBuy(maxBuyPossible)}
              style={{ padding: '12px 14px' }}
              title="Buy Maximum Affordable & Available"
            >
              MAX ({maxBuyPossible})
            </button>
          </div>

          {/* Sell Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
            <button
              className="btn-sci-fi btn-amber"
              disabled={userQty <= 0}
              onClick={() => handleSell(Math.min(tradeQty, userQty))}
              style={{ width: '100%', padding: '12px' }}
            >
              <ArrowUpRight size={16} /> SELL {Math.min(tradeQty, userQty || 1)} (+₡{(Math.min(tradeQty, userQty || 1) * marketEntry.sellPrice).toLocaleString()})
            </button>
            <button
              className="btn-sci-fi btn-amber"
              disabled={userQty <= 0}
              onClick={() => handleSell(userQty)}
              style={{ padding: '12px 14px' }}
              title="Liquidate All Units in Hold"
            >
              ALL ({userQty})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
