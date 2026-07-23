(function () {
  'use strict';

  // ─── DOM References ───
  const htmlEditor = document.getElementById('htmlCode');
  const cssEditor = document.getElementById('cssCode');
  const jsEditor = document.getElementById('jsCode');
  const previewFrame = document.getElementById('previewFrame');
  const runBtn = document.getElementById('runBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const charCount = document.getElementById('charCount');
  const errorOverlay = document.getElementById('errorOverlay');
  const errorMessage = document.getElementById('errorMessage');
  const errorCount = document.getElementById('errorCount');

  // ─── Default Demo Content ───
  const DEFAULT_HTML = `<div class="container">
  <h1>✨ Hello, CaudVas!</h1>
  <p>Start editing the HTML, CSS, or JavaScript panels to see live results.</p>
  <button id="demoBtn" onclick="handleClick()">Click Me</button>
  <p id="output"></p>
</div>`;

  const DEFAULT_CSS = `body {
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  animation: fadeIn 0.6s ease;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

#output {
  margin-top: 1rem;
  font-weight: 500;
  min-height: 1.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}`;

  const DEFAULT_JS = `function handleClick() {
  const output = document.getElementById('output');
  output.textContent = '🎉 Button clicked at ' + new Date().toLocaleTimeString();
  output.style.color = '#667eea';
}

// Console message
console.log('CaudVas is ready!');`;

  // ─── State ───
  let autoRunTimer = null;
  const AUTO_RUN_DELAY = 500;
  let isFullscreen = false;

  // ─── Core Functions ───

  function renderPreview() {
    const html = htmlEditor.value;
    const css = cssEditor.value;
    const js = jsEditor.value;

    const wrappedCSS = css ? '<style>' + css + '</style>' : '';
    const wrappedJS = js ? '<script>' + js + '<\/script>' : '';

    const doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' + wrappedCSS + '\n<style>\nhtml { overflow-y: auto; }\nbody { margin: 0; }\n</style>\n</head>\n<body>\n' + html + '\n' + wrappedJS + '\n</body>\n</html>';

    try {
      const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(doc);
      iframeDoc.close();
      clearError();
    } catch (err) {
      showError('Render error: ' + err.message);
    }
  }

  function setupErrorCapture() {
    const originalRender = renderPreview;
    renderPreview = function () {
      try {
        originalRender();
      } catch (err) {
        showError(err.message);
      }
    };
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorOverlay.classList.remove('hidden');
    errorCount.textContent = '⚠ 1 error';
    errorCount.classList.remove('hidden');
  }

  function clearError() {
    errorOverlay.classList.add('hidden');
    errorCount.classList.add('hidden');
    errorMessage.textContent = '';
  }

  function updateCharCount() {
    const total = htmlEditor.value.length + cssEditor.value.length + jsEditor.value.length;
    charCount.textContent = total.toLocaleString() + ' chars';
  }

  function scheduleAutoRun() {
    if (autoRunTimer) {
      clearTimeout(autoRunTimer);
    }
    autoRunTimer = setTimeout(function () {
      renderPreview();
      autoRunTimer = null;
    }, AUTO_RUN_DELAY);
  }

  function loadDefaults() {
    htmlEditor.value = DEFAULT_HTML;
    cssEditor.value = DEFAULT_CSS;
    jsEditor.value = DEFAULT_JS;
    updateCharCount();
    renderPreview();
  }

  function clearAll() {
    htmlEditor.value = '';
    cssEditor.value = '';
    jsEditor.value = '';
    clearError();
    updateCharCount();
    renderPreview();
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    document.body.classList.toggle('preview-mode', isFullscreen);
    fullscreenBtn.innerHTML = isFullscreen
      ? '<span>✕</span> Close'
      : '<span>⛶</span> Preview';
    renderPreview();
  }

  // ─── Event Handlers ───

  runBtn.addEventListener('click', function () {
    renderPreview();
  });

  clearBtn.addEventListener('click', clearAll);

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  document.querySelectorAll('.panel-clear').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-target');
      if (target === 'html') htmlEditor.value = '';
      else if (target === 'css') cssEditor.value = '';
      else if (target === 'js') jsEditor.value = '';
      clearError();
      updateCharCount();
      renderPreview();
    });
  });

  [htmlEditor, cssEditor, jsEditor].forEach(function (editor) {
    editor.addEventListener('input', function () {
      updateCharCount();
      scheduleAutoRun();
    });

    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
        editor.dispatchEvent(new Event('input'));
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      renderPreview();
    }
    if (e.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
  });

  window.addEventListener('resize', function () {
    if (isFullscreen) {
      renderPreview();
    }
  });

  // ─── Init ───
  setupErrorCapture();
  loadDefaults();

  console.log('%c\u25C8 CaudVas initialized', 'color: #3fb950; font-size: 16px; font-weight: bold;');
  console.log('%cEdit any panel to see live preview', 'color: #8b949e;');
})();