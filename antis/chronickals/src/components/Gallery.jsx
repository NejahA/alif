import React from 'react';
import NFTCard from './NFTCard';
import { nftData } from '../data/nfts';

const Gallery = () => {
  return (
    <section style={{ padding: '0 20px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {nftData.map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>
      
      <div className="glass-panel" style={{ marginTop: '60px', padding: '20px', fontSize: '0.8rem', opacity: 0.6, borderStyle: 'dashed' }}>
        <p className="cli-prompt">Checking repository for new daemons... [OK]</p>
        <p className="cli-prompt">Loading more assets... [QUEUED]</p>
      </div>
    </section>
  );
};

export default Gallery;
