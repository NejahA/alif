import React, { useMemo } from 'react';
import './HarlequinGrid.css';

const HarlequinGrid = ({ density = 40, colors = ['#FF0055', '#00FFCC', '#FFCC00'], shape = 'diamond' }) => {
  const diamonds = useMemo(() => {
    const items = [];
    const cols = Math.ceil(window.innerWidth / density) + 2;
    const rows = Math.ceil(window.innerHeight / density) + 2;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 4;
        const opacity = 0.05 + Math.random() * 0.15;
        
        items.push({
          id: `${i}-${j}`,
          top: i * density - density / 2,
          left: j * density - (i % 2 === 0 ? 0 : density / 2),
          color,
          delay,
          duration,
          opacity,
          size: density * 1.4
        });
      }
    }
    return items;
  }, [density, colors]);

  return (
    <div className="harlequin-grid-container">
      {diamonds.map((d) => (
        <div
          key={d.id}
          className={`diamond shape-${shape}`}
          style={{
            top: `${d.top}px`,
            left: `${d.left}px`,
            '--ix': `${d.left + d.size / 2}px`,
            '--iy': `${d.top + d.size / 2}px`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            backgroundColor: d.color,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`
          }}
        />
      ))}
      <div className="grid-overlay-vignette" />
    </div>
  );
};

export default HarlequinGrid;
