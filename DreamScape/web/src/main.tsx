import React from 'react';
import './serviceWorker.js';

// Dark‑mode sync
if (typeof window !== 'undefined' && window.matchMedia) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const setDark = (e) => {
    document.documentElement.classList.toggle('dark', e.matches);
  };
  setDark(media);
  media.addEventListener('change', setDark);
}

import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

