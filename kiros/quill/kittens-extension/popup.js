// Quill Popup Script

document.addEventListener('DOMContentLoaded', () => {
    const openAppBtn = document.getElementById('openApp');
    const exportMarkdownBtn = document.getElementById('exportMarkdown');
    const exportPdfBtn = document.getElementById('exportPdf');
    const popupStreak = document.getElementById('popupStreak');
    const popupWordCount = document.getElementById('popupWordCount');
    const lastEntry = document.getElementById('lastEntry');

    // Open main app
    openAppBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        window.close();
    });

    // Export to Markdown
    exportMarkdownBtn.addEventListener('click', () => {
        const content = localStorage.getItem('quill_content') || '';
        if (!content.trim()) {
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
        window.close();
    });

    // Export to PDF
    exportPdfBtn.addEventListener('click', () => {
        const content = localStorage.getItem('quill_content') || '';
        if (!content.trim()) {
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
        window.close();
    });

    // Update stats
    const streak = parseInt(localStorage.getItem('quill_streak') || '0');
    const content = localStorage.getItem('quill_content') || '';
    const words = content.trim() ? content.split(/\s+/).length : 0;

    popupStreak.textContent = streak;
    popupWordCount.textContent = words;
    lastEntry.textContent = content.substring(0, 100) + (content.length > 100 ? '...' : '');
});
