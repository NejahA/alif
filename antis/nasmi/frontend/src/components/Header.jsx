import React from 'react';
import './Header.css';

export default function Header({ onConnectClick }) {
  return (
    <header className="header glass-panel">
      <div className="header-content container">
        <div className="logo">
          <span className="text-gradient">Nasmi</span>
        </div>
        <nav className="nav">
          <a href="#network" className="nav-link">Network</a>
          <button className="btn-primary" onClick={onConnectClick}>Connect</button>
        </nav>
      </div>
    </header>
  );
}
