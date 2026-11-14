import React from 'react';
import './App.css';

import React from 'react';
import './App.css';
import CollaborativeEditor from './components/CollaborativeEditor';
import ExportMarkdownButton from './components/ExportMarkdownButton';
import ThemeSelector from './components/ThemeSelector';

function App() {
  // Placeholder dream ID – replace with actual ID from your state or router
  const currentDreamId = 'example-dream-id';
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>DreamScape Dashboard</h1>
      <p>Welcome! This web UI will show your recorded dreams.</p>
      {/* New features */}
      <ThemeSelector />
      <ExportMarkdownButton dreamId={currentDreamId} />
      <CollaborativeEditor />
    </div>
  );
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>DreamScape Dashboard</h1>
      <p>Welcome! This web UI will show your recorded dreams.</p>
    </div>
  );
}

export default App;

