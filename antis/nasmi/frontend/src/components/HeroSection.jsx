import React from 'react';
import './HeroSection.css';

export default function HeroSection({ onExploreClick, onJoinClick }) {
  return (
    <section className="hero container">
      <div className="hero-content">
        <h1 className="hero-title">
          Elevate Your <span className="text-gradient">Network</span>
        </h1>
        <p className="hero-subtitle">
          A highly-curated portfolio of executives, creatives, and industry leaders redefining the modern landscape.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onExploreClick}>Explore Contacts</button>
          <button className="btn-secondary" onClick={onJoinClick}>Join the Network</button>
        </div>
      </div>
    </section>
  );
}
