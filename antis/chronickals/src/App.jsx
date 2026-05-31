import React, { useState } from 'react';
import Header from './components/Header';
import Gallery from './components/Gallery';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = () => {
    if (isWalletConnected) {
      setIsWalletConnected(false);
      setWalletAddress(null);
    } else {
      setIsWalletConnected(true);
      setWalletAddress("0x71C...392A");
    }
  };

  return (
    <div className="App">
      <div className="scanline"></div>
      
      <Header isConnected={isWalletConnected} address={walletAddress} onConnect={connectWallet} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'left', padding: '40px 20px 20px', borderBottom: '1px solid var(--border-dim)', marginBottom: '40px' }}>
          <p className="cli-prompt" style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '8px' }}>FETCH_COLLECTION --ALL</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
            THE <span className="terminal-glow">CHRONICKALS</span>
          </h2>
          <p style={{ maxWidth: '600px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Welcome to the digital archive of the first-ever collector NFTs for the Linux ecosystem. 
            Each daemon represents a unique facet of system philosophy, architecture, and spirit.
          </p>
        </div>
        
        <Gallery />
      </main>
      
      <footer style={{ borderTop: '1px solid var(--border-dim)', marginTop: 'auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>
          COPYLEFT &copy; 2026 CHRONICKALS_PROJECT // OPEN_SOURCE_NFT_COLLECTION
        </p>
      </footer>
    </div>
  );
}

export default App;
