// Nebula - Minimal Note-Taking App

class Nebula {
  constructor() {
    this.editor = document.getElementById('editor');
    this.preview = document.getElementById('preview');
    this.wordCount = document.getElementById('word-count');
    this.lastSaved = document.getElementById('last-saved');
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    
    this.currentNote = '';
    this.theme = localStorage.getItem('nebula-theme') || 'light';
    
    this.init();
  }
  
  init() {
    this.applyTheme();
    this.loadNote();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }
  
  setupEventListeners() {
    this.editor.addEventListener('input', () => this.saveNote());
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Debounce preview updates
    let timeoutId;
    this.editor.addEventListener('input', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => this.updatePreview(), 300);
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveNote();
        this.showSavedIndicator();
      }
    });
  }
  
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('nebula-theme', this.theme);
    this.applyTheme();
  }
  
  updateThemeIcon() {
    if (this.theme === 'dark') {
      this.themeIcon.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    } else {
      this.themeIcon.setAttribute('d', 'M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z');
    }
  }
  
  loadNote() {
    const savedNote = localStorage.getItem('nebula-note');
    if (savedNote) {
      this.editor.value = savedNote;
      this.currentNote = savedNote;
      this.updatePreview();
    }
  }
  
  saveNote() {
    const content = this.editor.value;
    this.currentNote = content;
    localStorage.setItem('nebula-note', content);
    this.updateWordCount();
    this.showSavedIndicator();
  }
  
  updatePreview() {
    const markdown = this.parseMarkdown(this.editor.value);
    this.preview.innerHTML = markdown;
  }
  
  parseMarkdown(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\`(.*)\`/gim, '<code>$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\n/gim, '<br>');
    
    return html;
  }
  
  updateWordCount() {
    const words = this.editor.value.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount.textContent = `${words.length} word${words.length !== 1 ? 's' : ''}`;
  }
  
  showSavedIndicator() {
    this.lastSaved.textContent = 'Saved';
    setTimeout(() => {
      this.lastSaved.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }, 100);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Nebula();
});
