import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nextus_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('nextus_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('nextus_theme', 'light');
    }
  };

  return (
    <button 
      className="btn-icon" 
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2V4M10 16V18M4 10H2M6.34315 6.34315L4.92893 4.92893M13.6569 6.34315L15.0711 4.92893M6.34315 13.6569L4.92893 15.0711M13.6569 13.6569L15.0711 15.0711M18 10H16M14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M17.293 13.293C16.0035 14.0827 14.5311 14.5 13 14.5C8.85786 14.5 5.5 11.1421 5.5 7C5.5 5.46894 5.9173 3.99647 6.707 2.707C3.57632 3.90796 1.5 6.89809 1.5 10.5C1.5 15.1944 5.30558 19 10 19C13.6019 19 16.592 16.9237 17.793 13.793L17.293 13.293Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;