const tabs = [
  { id: 'palette', label: '🎨 Palette', icon: '🎨' },
  { id: 'ambient', label: '🌊 Ambient', icon: '🌊' },
  { id: 'timer', label: '⏱ Timer', icon: '⏱' },
  { id: 'quotes', label: '💬 Quotes', icon: '💬' },
];

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}