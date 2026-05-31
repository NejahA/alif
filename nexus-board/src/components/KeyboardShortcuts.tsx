import { useState, useEffect } from 'react';

interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'editing' | 'view';
}

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: 'N', description: 'Create new task', category: 'navigation' },
    { key: 'E', description: 'Edit selected task', category: 'navigation' },
    { key: 'D', description: 'Delete selected task', category: 'navigation' },
    { key: 'Arrow Up/Down', description: 'Navigate between tasks', category: 'navigation' },
    { key: 'Arrow Left/Right', description: 'Move between columns', category: 'navigation' },
    { key: 'Enter', description: 'Select task', category: 'navigation' },
    { key: 'Escape', description: 'Cancel/close modal', category: 'navigation' },
    
    // Actions
    { key: 'Space', description: 'Toggle task status', category: 'actions' },
    { key: 'M', description: 'Move task to next column', category: 'actions' },
    { key: 'C', description: 'Copy task', category: 'actions' },
    { key: 'V', description: 'Paste task', category: 'actions' },
    { key: 'F', description: 'Focus search', category: 'actions' },
    
    // Editing
    { key: 'Ctrl/Cmd + S', description: 'Save changes', category: 'editing' },
    { key: 'Ctrl/Cmd + Z', description: 'Undo', category: 'editing' },
    { key: 'Ctrl/Cmd + Y', description: 'Redo', category: 'editing' },
    { key: 'Ctrl/Cmd + C', description: 'Copy selected', category: 'editing' },
    { key: 'Ctrl/Cmd + V', description: 'Paste', category: 'editing' },
    { key: 'Ctrl/Cmd + A', description: 'Select all tasks', category: 'editing' },
    
    // View
    { key: 'Ctrl/Cmd + +', description: 'Zoom in', category: 'view' },
    { key: 'Ctrl/Cmd + -', description: 'Zoom out', category: 'view' },
    { key: 'Ctrl/Cmd + 0', description: 'Reset zoom', category: 'view' },
    { key: 'T', description: 'Toggle theme', category: 'view' },
    { key: 'H', description: 'Show/hide help', category: 'view' },
  ];

  const categories = {
    navigation: 'Navigation',
    actions: 'Actions',
    editing: 'Editing',
    view: 'View'
  };

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for our shortcuts
      switch (e.key) {
        case 'n':
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          // Simulate new task button click
          const newTaskBtn = document.querySelector('.btn-primary');
          if (newTaskBtn) (newTaskBtn as HTMLButtonElement).click();
          break;
          
        case 'Escape':
          // Close any open modals
          const modals = document.querySelectorAll('.modal-overlay');
          modals.forEach(modal => {
            const closeBtn = modal.querySelector('.btn-icon, .btn-secondary');
            if (closeBtn) (closeBtn as HTMLButtonElement).click();
          });
          break;
          
        case 't':
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          // Toggle theme
          const themeBtn = document.querySelector('[aria-label*="theme"]');
          if (themeBtn) (themeBtn as HTMLButtonElement).click();
          break;
          
        case 'h':
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          setIsOpen(!isOpen);
          break;
          
        case 'f':
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          // Focus search
          const searchInput = document.querySelector('.search-input');
          if (searchInput) (searchInput as HTMLInputElement).focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isOpen]);

  const toggleEnabled = () => {
    setEnabled(!enabled);
    localStorage.setItem('nextus_shortcuts_enabled', (!enabled).toString());
  };

  useEffect(() => {
    const saved = localStorage.getItem('nextus_shortcuts_enabled');
    if (saved === 'false') setEnabled(false);
  }, []);

  return (
    <>
      <button 
        className="btn-icon"
        onClick={() => setIsOpen(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (H)"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4.16667 4.16667H15.8333V15.8333H4.16667V4.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.33333 7.5L11.6667 10L8.33333 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content shortcuts-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Keyboard Shortcuts</h2>
              <button className="btn-icon" onClick={() => setIsOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="shortcuts-toggle">
              <label className="toggle-switch large">
                <input 
                  type="checkbox" 
                  checked={enabled}
                  onChange={toggleEnabled}
                />
                <span className="toggle-slider"></span>
              </label>
              <div>
                <h3 className="toggle-label">Enable Keyboard Shortcuts</h3>
                <p className="toggle-description">
                  Press H to show/hide this dialog. Press N to create new task.
                </p>
              </div>
            </div>

            <div className="shortcuts-categories">
              {Object.entries(categories).map(([key, title]) => (
                <div key={key} className="shortcuts-category">
                  <h3 className="category-title">{title}</h3>
                  <div className="shortcuts-list">
                    {shortcuts
                      .filter(s => s.category === key)
                      .map(shortcut => (
                        <div key={shortcut.key} className="shortcut-item">
                          <kbd className="shortcut-key">{shortcut.key}</kbd>
                          <span className="shortcut-description">{shortcut.description}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setIsOpen(false)}
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;