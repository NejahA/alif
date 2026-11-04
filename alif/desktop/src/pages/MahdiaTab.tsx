import { useState } from 'react';
import { attractions, timelineEvents } from '../data/attractions';
import { Calendar } from 'lucide-react';

export default function MahdiaTab() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const tags = ['All', 'Historical', 'Fortress', 'Beach', 'Culture', 'Landmark'];

  const filteredAttractions = selectedTag === 'All'
    ? attractions
    : attractions.filter(a => a.tag === selectedTag);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="hero-banner">
        <h2>🌊 Mahdia Heritage & Tourism Hub</h2>
        <p>
          Explore historical monuments, Fatimid dynasty fortresses, sandy Mediterranean beaches,
          and rich coastal culture.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: selectedTag === tag ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              background: selectedTag === tag ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: selectedTag === tag ? '#38bdf8' : '#94a3b8'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Attractions Grid */}
      <div className="cards-grid">
        {filteredAttractions.map((item, idx) => (
          <div key={idx} className="card" style={{ gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '28px' }}>{item.icon}</span>
              <span style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}>
                {item.tag}
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
                {item.name}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* History Timeline */}
      <div className="interactive-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Calendar size={18} color="#818cf8" />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Historical Timeline</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {timelineEvents.map((event, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '16px',
              padding: '12px',
              background: 'rgba(11, 15, 25, 0.5)',
              borderRadius: '8px',
              borderLeft: '3px solid #818cf8'
            }}>
              <span style={{ fontWeight: 700, color: '#818cf8', minWidth: '70px', fontSize: '14px' }}>
                {event.year}
              </span>
              <div>
                <strong style={{ color: '#f1f5f9', display: 'block', fontSize: '14px', marginBottom: '2px' }}>
                  {event.title}
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                  {event.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
