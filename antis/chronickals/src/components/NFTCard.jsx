import React, { useState } from 'react';
import { Share2, Plus, Info, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const NFTCard = ({ nft }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const handleAction = () => {
    if (isMinted) return;
    setIsMinting(true);
    
    // Simulated minting/decrypting process
    setTimeout(() => {
      setIsMinting(false);
      setIsMinted(true);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${nft.color}33` }}
      className="glass-panel"
      style={{ overflow: 'hidden', transition: 'all 0.3s ease', border: `1px solid ${nft.color || 'var(--border-dim)'}55`, opacity: nft.isLocked && !isMinted ? 0.7 : 1 }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', padding: '15px' }}>
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
          {(nft.image || isMinted) ? (
            <img 
              src={nft.image || "/src/assets/nfts/kali.png"} // Kali image would go here if we had it
              alt={nft.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isMinted ? 'none' : (nft.isLocked ? 'blur(10px) grayscale(1)' : 'none') }} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>ENCRYPTED</p>
                <p style={{ color: nft.color }}>LOCKED</p>
              </div>
            </div>
          )}
          
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.65rem', border: `1px solid ${nft.color}77` }}>
            ID_{nft.id.toString().padStart(3, '0')}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', color: nft.color || 'var(--text-primary)' }}>{nft.name}</h3>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: nft.color }}>●</span> {nft.distro.toUpperCase()}
        </p>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', fontSize: '0.7rem', marginBottom: '15px', minHeight: '60px' }}>
          {isMinted && nft.isLocked ? "DECRYPTED: " + nft.description.replace("COMING SOON: ", "") : nft.description}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          {nft.attributes?.map((attr, index) => (
            <div key={index} style={{ textAlign: 'center', border: '1px solid var(--border-dim)', padding: '4px', borderRadius: '4px' }}>
              <p style={{ fontSize: '0.55rem', opacity: 0.5 }}>{attr.trait.substring(0, 4).toUpperCase()}</p>
              <p style={{ fontSize: '0.75rem', color: nft.color }}>{attr.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="button-primary" 
            onClick={handleAction}
            disabled={isMinting || isMinted}
            style={{ 
              flex: 1, 
              fontSize: '0.7rem', 
              padding: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              cursor: (isMinting || isMinted) ? 'not-allowed' : 'pointer',
              opacity: (isMinting || isMinted) ? 0.7 : 1
            }}
          >
            {isMinting ? <Loader2 className="animate-spin" size={14} /> : (isMinted ? <Check size={14} /> : null)}
            {isMinting ? (nft.isLocked ? 'DECRYPTING...' : 'MINTING...') : (isMinted ? (nft.isLocked ? 'DECRYPTED' : 'MINTED') : (nft.isLocked ? 'DECRYPT' : 'MINT_DAEMON'))}
          </button>
          <button style={{ background: 'transparent', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
