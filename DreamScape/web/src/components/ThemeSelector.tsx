import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    // fetch current theme from profile endpoint
    const token = localStorage.getItem('token');
    axios.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTheme(res.data.theme || 'system'))
      .catch(() => {});
  }, []);

  const updateTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    const token = localStorage.getItem('token');
    await axios.put('/api/profile', { theme: newTheme }, { headers: { Authorization: `Bearer ${token}` } });
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>Theme Selector</h2>
      <select value={theme} onChange={e => updateTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

