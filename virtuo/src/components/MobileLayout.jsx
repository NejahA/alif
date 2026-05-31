import React, { useState, useEffect } from 'react';
import { Menu, X, Smartphone, Tablet, Monitor, Maximize, Minimize, 
         RotateCcw, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';

const MobileLayout = ({ children, activeTab, onTabChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentView, setCurrentView] = useState('instrument');
  const [orientation, setOrientation] = useState('portrait');

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Check orientation
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Mobile-optimized tabs
  const mobileTabs = [
    { id: 'piano', label: 'Piano', icon: '🎹' },
    { id: 'drums', label: 'Beats', icon: '🥁' },
    { id: 'synth', label: 'Synth', icon: '🔊' },
    { id: 'more', label: 'More', icon: '⋯' }
  ];

  const fullTabs = [
    { id: 'piano', label: 'Piano', icon: '🎹' },
    { id: 'violin', label: 'Violin', icon: '🎻' },
    { id: 'guitar', label: 'Guitar', icon: '🎸' },
    { id: 'drums', label: 'Beats', icon: '🥁' },
    { id: 'pads', label: 'Pads', icon: '🔲' },
    { id: 'sampler', label: 'Sampler', icon: '🎤' },
    { id: 'synth', label: 'Synth', icon: '🔊' },
    { id: 'bass', label: 'Bass', icon: '🎵' },
    { id: 'ambient', label: 'Ambient', icon: '☁️' }
  ];

  const handleTabChange = (tabId) => {
    if (tabId === 'more') {
      setShowMobileMenu(!showMobileMenu);
    } else {
      onTabChange(tabId);
      setShowMobileMenu(false);
    }
  };

  const toggleView = () => {
    setCurrentView(currentView === 'instrument' ? 'controls' : 'instrument');
  };

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  if (!isMobile && !isTablet) {
    return children;
  }

  return (
    <div className="mobile-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-left">
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="mobile-title">Virtuo</span>
        </div>
        
        <div className="mobile-header-right">
          <button 
            className="mobile-view-btn"
            onClick={toggleView}
            title={currentView === 'instrument' ? 'Show Controls' : 'Show Instrument'}
          >
            {currentView === 'instrument' ? <Grid size={18} /> : <List size={18} />}
          </button>
          
          {document.fullscreenEnabled && (
            <button 
              className="mobile-fullscreen-btn"
              onClick={document.fullscreenElement ? exitFullscreen : requestFullscreen}
            >
              {document.fullscreenElement ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`mobile-content ${currentView}-view`}>
        {children}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="mobile-nav-bar">
        {mobileTabs.map(tab => (
          <button
            key={tab.id}
            className={`mobile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="mobile-nav-icon">{tab.icon}</span>
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Full Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <h3>All Instruments</h3>
              <button 
                className="mobile-menu-close"
                onClick={() => setShowMobileMenu(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mobile-menu-grid">
              {fullTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`mobile-menu-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <span className="mobile-menu-icon">{tab.icon}</span>
                  <span className="mobile-menu-label">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mobile-menu-footer">
              <div className="device-info">
                <span>{isMobile ? 'Mobile' : 'Tablet'} - {orientation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orientation Warning */}
      {isMobile && orientation === 'portrait' && (
        <div className="orientation-warning">
          <RotateCcw size={16} />
          Rotate to landscape for better experience
        </div>
      )}

      {/* Mobile CSS */}
      <style jsx>{`
        .mobile-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-dark);
          background-image: var(--bg-gradient);
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          z-index: 1000;
        }

        .mobile-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-header-right {
          display: flex;
          gap: 8px;
        }

        .mobile-menu-btn,
        .mobile-view-btn,
        .mobile-fullscreen-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 8px;
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-title {
          font-weight: 700;
          font-size: 1.1rem;
          background: linear-gradient(90deg, #d946ef, var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .instrument-view {
          /* Instrument takes full space */
        }

        .controls-view {
          /* Controls take full space */
        }

        .mobile-nav-bar {
          display: flex;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--glass-border);
          padding: 8px 12px;
          z-index: 1000;
        }

        .mobile-nav-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 8px 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-nav-btn.active {
          color: var(--accent-primary);
          background: rgba(138, 43, 226, 0.1);
        }

        .mobile-nav-icon {
          font-size: 1.2rem;
        }

        .mobile-nav-label {
          font-size: 0.7rem;
          font-weight: 600;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          z-index: 2000;
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .mobile-menu-close {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 8px;
          color: var(--text-main);
          cursor: pointer;
        }

        .mobile-menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .mobile-menu-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 16px 8px;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-item.active {
          background: var(--accent-primary);
          border-color: #d946ef;
          color: white;
        }

        .mobile-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-icon {
          font-size: 1.5rem;
        }

        .mobile-menu-label {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .orientation-warning {
          position: fixed;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1500;
          backdrop-filter: blur(10px);
        }

        /* Responsive adjustments for instruments */}
        @media (max-width: 767px) {
          .glass-panel {
            border-radius: 12px;
            margin: 8px;
          }

          .btn-glass {
            padding: 12px 16px;
            font-size: 0.9rem;
          }

          /* Piano specific adjustments */}
          .piano-key {
            min-width: 30px;
            height: 120px;
          }

          /* Drum pad adjustments */}
          .drum-pad {
            width: 70px;
            height: 70px;
          }

          /* Utility panel adjustments */}
          .utility-panel {
            position: fixed;
            bottom: 60px;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid var(--glass-border);
            padding: 16px;
            z-index: 900;
          }
        }

        @media (max-width: 1023px) and (min-width: 768px) {
          /* Tablet specific styles */}
          .glass-panel {
            border-radius: 14px;
            margin: 12px;
          }

          .btn-glass {
            padding: 14px 20px;
            font-size: 1rem;
          }

          .piano-key {
            min-width: 35px;
            height: 150px;
          }

          .drum-pad {
            width: 85px;
            height: 85px;
          }
        }

        /* Landscape optimization */}
        @media (max-height: 500px) and (orientation: landscape) {
          .mobile-header {
            padding: 8px 12px;
          }

          .mobile-nav-bar {
            padding: 6px 8px;
          }

          .mobile-nav-label {
            display: none;
          }

          .orientation-warning {
            display: none;
          }
        }

        /* High DPI devices */}
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .glass-panel {
            backdrop-filter: blur(32px);
            -webkit-backdrop-filter: blur(32px);
          }
        }

        /* Reduced motion support */}
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;