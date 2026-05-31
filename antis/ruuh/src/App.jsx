import React, { useState, useEffect } from 'react';

function App() {
  const [stats, setStats] = useState({ freemem: 0, totalmem: 0, cpus: [] });
  const [log, setLog] = useState("Ruuh initialized. System standing by.");

  useEffect(() => {
    if (window.api) {
      const fetchStats = async () => {
        const data = await window.api.getSystemStats();
        setStats(data);
      };
      fetchStats();
      const interval = setInterval(fetchStats, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleClose = () => {
    if (window.api) window.api.closeApp();
  };

  const handleMode = async (mode) => {
    if (window.api) {
      setLog(`Initializing ${mode} mode...`);
      const result = await window.api.toggleMode(mode);
      setLog(result);
    } else {
      setLog(`[MOCK] Switch to ${mode} complete.`);
    }
  };

  const usedMemGB = ((stats.totalmem - stats.freemem) / (1024 ** 3)).toFixed(1);
  const totalMemGB = (stats.totalmem / (1024 ** 3)).toFixed(1);

  return (
    <div className="app-window">
      <div className="titlebar">
        <div className="title">Ruuh</div>
        <button className="close-btn" onClick={handleClose}>&times;</button>
      </div>
      
      <div className="content">
        <div className="stats-panel">
          <div className="stat-card">
            <div style={{color: 'var(--text-secondary)'}}>RAM Usage</div>
            <div className="stat-value">{stats.totalmem ? `${usedMemGB} / ${totalMemGB} GB` : 'Loading...'}</div>
          </div>
          <div className="stat-card">
            <div style={{color: 'var(--text-secondary)'}}>CPU Cores</div>
            <div className="stat-value">{stats.cpus.length || 'Loading...'}</div>
          </div>
        </div>

        <div className="modes-panel">
          <button className="mode-btn gaming" onClick={() => handleMode('Gaming')}>
            <span>🕹️</span> Gaming Mode
          </button>
          <button className="mode-btn coding" onClick={() => handleMode('Coding')}>
            <span>💻</span> Coding Mode
          </button>
        </div>

        <div className="log-panel">
          > {log}
        </div>
      </div>
    </div>
  );
}

export default App;
