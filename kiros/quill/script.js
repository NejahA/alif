// Quill - Daily Writing App
// Simple, elegant writing with daily streaks

class QuillApp {
    constructor() {
        this.editor = document.getElementById('editor');
        this.streakDisplay = document.getElementById('streak');
        this.wordCountDisplay = document.getElementById('wordCount');
        this.currentDateDisplay = document.getElementById('currentDate');
        this.exportMarkdownBtn = document.getElementById('exportMarkdown');
        this.exportPdfBtn = document.getElementById('exportPdf');
        this.toggleDistractionBtn = document.getElementById('toggleDistraction');

        this.streak = parseInt(localStorage.getItem('quill_streak') || '0');
        this.lastWriteDate = localStorage.getItem('quill_last_date');
        this.today = new Date().toDateString();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateDisplay();
        this.updateStats();
        this.loadContent();
    }

    setupEventListeners() {
        // Auto-save on typing
        this.editor.addEventListener('input', () => this.saveContent());

        // Word count update
        this.editor.addEventListener('input', () => this.updateWordCount());

        // Export buttons
        this.exportMarkdownBtn.addEventListener('click', () => this.exportToMarkdown());
        this.exportPdfBtn.addEventListener('click', () => this.exportToPdf());

        // Distraction-free mode
        this.toggleDistractionBtn.addEventListener('click', () => this.toggleDistractionMode());

        // Save on blur
        this.editor.addEventListener('blur', () => this.saveContent());
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
    }

    updateStats() {
        this.streakDisplay.textContent = this.streak;
        this.updateWordCount();
    }

    updateWordCount() {
        const text = this.editor.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        this.wordCountDisplay.textContent = words;
    }

    saveContent() {
        localStorage.setItem('quill_content', this.editor.value);
        this.checkStreak();
    }

    loadContent() {
        const savedContent = localStorage.getItem('quill_content');
        if (savedContent) {
            this.editor.value = savedContent;
            this.updateWordCount();
        }
    }

    checkStreak() {
        const today = new Date().toDateString();

        if (this.lastWriteDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (this.lastWriteDate === yesterday.toDateString()) {
                this.streak++;
            } else if (!this.lastWriteDate) {
                this.streak = 1;
            } else {
                this.streak = 1;
            }

            localStorage.setItem('quill_streak', this.streak);
            localStorage.setItem('quill_last_date', today);
            this.streakDisplay.textContent = this.streak;
        }
    }

    toggleDistractionMode() {
        document.body.classList.toggle('distraction-free');
        const isDistractionFree = document.body.classList.contains('distraction-free');
        localStorage.setItem('quill_distraction_mode', isDistractionFree);
        this.toggleDistractionBtn.textContent = isDistractionFree ? '✖️ Exit Focus' : '👁️ Focus';
    }

    exportToMarkdown() {
        const content = this.editor.value.trim();
        if (!content) {
            alert('Nothing to export!');
            return;
        }

        const markdown = `# Daily Writing - ${new Date().toLocaleDateString()}\n\n${content}\n\n---\n*Exported from Quill*`;

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quill-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportToPdf() {
        const content = this.editor.value.trim();
        if (!content) {
            alert('Nothing to export!');
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Georgia', serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #5e72e4; padding-bottom: 10px; }
                    .date { color: #666; margin-bottom: 20px; font-style: italic; }
                    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #999; text-align: center; }
                </style>
            </head>
            <body>
                <h1>Daily Writing</h1>
                <p class="date">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div class="content">${content.replace(/\n/g, '<br>')}</div>
                <div class="footer">Exported from Quill - ${new Date().toLocaleString()}</div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new QuillApp();
});
