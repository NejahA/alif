import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const SpectralTicker = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [newsData, setNewsData] = useState([
    "GLOBAL_SYNC: NEURAL_NETWORKS_ADAPTING",
    "MARKET_ALERT: QUANTUM_COMPUTING_BREAKTHROUGH",
    "ATMOS_REPORT: IONIC_STORM_SUBSIDING",
    "SYSTEM_LOG: SPECTRAL_CORE_V5_STABLE"
  ]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState('CRYPTO'); // CRYPTO, NEWS, CLOCKS

  const fetchPrices = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true');
      const json = await response.json();
      const formatted = Object.keys(json).map(key => ({
        id: key,
        name: key.toUpperCase(),
        price: json[key].usd.toLocaleString(),
        change: json[key].usd_24h_change.toFixed(2),
        isUp: json[key].usd_24h_change >= 0
      }));
      setCryptoData(formatted);
      setLoading(false);
    } catch (error) {
      setCryptoData([
        { id: 'btc', name: 'BITCOIN', price: '64,231', change: '2.4', isUp: true },
        { id: 'eth', name: 'ETHEREUM', price: '3,452', change: '-1.2', isUp: false }
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const priceInterval = setInterval(fetchPrices, 60000);
    const streamInterval = setInterval(() => {
        setActiveStream(prev => prev === 'CRYPTO' ? 'NEWS' : prev === 'NEWS' ? 'CLOCKS' : 'CRYPTO');
    }, 10000);
    return () => {
        clearInterval(priceInterval);
        clearInterval(streamInterval);
    };
  }, []);

  const clocks = [
    { city: 'SAN_FRANCISCO', time: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' }) },
    { city: 'LONDON', time: new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }) },
    { city: 'TOKYO', time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }) }
  ];

  return (
    <div style={{ 
      width: '100%', 
      background: 'rgba(255,255,255,0.01)', 
      backdropFilter: 'blur(10px)', 
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '8px 0',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div style={{ 
        paddingLeft: '20px', 
        paddingRight: '20px', 
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.02)',
        minWidth: '180px'
      }}>
        <Activity size={14} color="var(--s-glow)" />
        <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-dim)' }}>
            {activeStream}_STREAM
        </span>
      </div>

      <motion.div 
        key={activeStream}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{ display: 'flex', gap: '50px', paddingLeft: '50px', alignItems: 'center' }}
      >
        {activeStream === 'CRYPTO' && cryptoData.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{item.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.8 }}>${item.price}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: item.isUp ? '#10b981' : '#f43f5e' }}>{item.change}%</span>
            </div>
        ))}
        {activeStream === 'NEWS' && newsData.map((news, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--s-primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1px' }}>{news}</span>
            </div>
        ))}
        {activeStream === 'CLOCKS' && clocks.map((clock, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--s-glow)' }}>{clock.city}</span>
                <span style={{ fontSize: '0.75rem', color: 'white', fontFamily: 'monospace' }}>{clock.time}</span>
            </div>
        ))}
      </motion.div>
    </div>
  );
};


export default SpectralTicker;
