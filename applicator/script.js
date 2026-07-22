// === State ===
let apps = [];
try {
  apps = JSON.parse(localStorage.getItem('appCreatorApps') || '[]');
  if (!Array.isArray(apps)) apps = [];
} catch (err) {
  console.error('Failed to parse stored apps:', err);
  apps = [];
}
let editingId = null;
let darkTheme = localStorage.getItem('appCreatorTheme') !== 'light';
let statsVisible = false;

// === DOM Refs (initialized on DOMContentLoaded) ===
let appGrid, appModal, detailModal, modalTitle, appForm, openBtn, closeBtn, cancelBtn, submitBtn, closeDetailBtn, detailBody;
let searchInput, filterTemplate, sortSelect, statsBtn, statsPanel, statsGrid, createAllBtn, exportBtn, importBtn, importFile, themeToggle;
let nameInput, descInput, templateInput, iconInput;

// === Template Icons ===
const TEMPLATE_ICONS = {
  todo: '✅', counter: '🔢', timer: '⏱️', notes: '📝',
  calculator: '🧮', colorpicker: '🎨', password: '🔐',
  weather: '🌤️', pomodoro: '🍅', quiz: '❓',
  tictactoe: '✖️', markdown: '📄', converter: '🔄', memory: '🧠',
};

const TEMPLATE_LABELS = {
  todo: 'Todo List', counter: 'Counter', timer: 'Timer / Stopwatch',
  notes: 'Notes App', calculator: 'Calculator', colorpicker: 'Color Picker',
  password: 'Password Generator', weather: 'Weather Widget', pomodoro: 'Pomodoro Timer',
  quiz: 'Quiz App', tictactoe: 'Tic-Tac-Toe', markdown: 'Markdown Previewer',
  converter: 'Unit Converter', memory: 'Memory Game',
};

// === Theme ===
function applyTheme() {
  document.body.classList.toggle('light', !darkTheme);
  if (themeToggle) themeToggle.textContent = darkTheme ? '🌓' : '☀️';
}

// Initialize DOM refs and event listeners after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  appGrid = document.getElementById('appGrid');
  appModal = document.getElementById('appModal');
  detailModal = document.getElementById('detailModal');
  modalTitle = document.getElementById('modalTitle');
  appForm = document.getElementById('appForm');
  openBtn = document.getElementById('openFormBtn');
  closeBtn = document.getElementById('closeModalBtn');
  cancelBtn = document.getElementById('cancelBtn');
  submitBtn = document.getElementById('submitBtn');
  closeDetailBtn = document.getElementById('closeDetailBtn');
  detailBody = document.getElementById('detailBody');
  searchInput = document.getElementById('searchInput');
  filterTemplate = document.getElementById('filterTemplate');
  sortSelect = document.getElementById('sortSelect');
  statsBtn = document.getElementById('statsBtn');
  statsPanel = document.getElementById('statsPanel');
  statsGrid = document.getElementById('statsGrid');
  createAllBtn = document.getElementById('createAllBtn');
  exportBtn = document.getElementById('exportBtn');
  importBtn = document.getElementById('importBtn');
  importFile = document.getElementById('importFile');
  themeToggle = document.getElementById('themeToggle');
  nameInput = document.getElementById('appName');
  descInput = document.getElementById('appDescription');
  templateInput = document.getElementById('appTemplate');
  iconInput = document.getElementById('appIcon');

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      darkTheme = !darkTheme;
      localStorage.setItem('appCreatorTheme', darkTheme ? 'dark' : 'light');
      applyTheme();
    });
  }
  applyTheme();

  // === Form Submit ===
  if (appForm) {
    appForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const template = templateInput.value;
      if (!template) { alert('Please select a template.'); return; }
      const name = nameInput.value.trim();
      if (!name) { alert('Please enter an app name.'); return; }

      const data = {
        id: editingId !== null ? apps[editingId].id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        description: descInput.value.trim(),
        template,
        icon: iconInput.value.trim() || TEMPLATE_ICONS[template] || '📱',
        createdAt: editingId !== null ? apps[editingId].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingId !== null) updateApp(editingId, data);
      else createApp(data);
      closeAppModal();
      updateStats();
    });
  }

  // === Event Listeners ===
  if (createAllBtn) {
    createAllBtn.addEventListener('click', () => {
      if (apps.length === 0) { toast('No apps to generate'); return; }
      const count = apps.length;
      apps.forEach((app, i) => {
        setTimeout(() => {
          const html = generateAppHtml(app);
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}.html`;
          a.click();
          URL.revokeObjectURL(url);
          if (i === count - 1) toast(`Created ${count} app files!`);
        }, i * 300);
      });
    });
  }

  if (openBtn) openBtn.addEventListener('click', openCreateModal);
  if (closeBtn) closeBtn.addEventListener('click', closeAppModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeAppModal);
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetailModal);

  if (appModal) appModal.addEventListener('click', e => { if (e.target === appModal) closeAppModal(); });
  if (detailModal) detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetailModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (detailModal && detailModal.classList.contains('active')) closeDetailModal();
      else if (appModal && appModal.classList.contains('active')) closeAppModal();
    }
  });

  if (templateInput) templateInput.addEventListener('change', () => {
    const t = templateInput.value;
    if (t && !iconInput.value) iconInput.value = TEMPLATE_ICONS[t] || '📱';
  });

  if (searchInput) searchInput.addEventListener('input', render);
  if (filterTemplate) filterTemplate.addEventListener('change', render);
  if (sortSelect) sortSelect.addEventListener('change', render);

  // === Stats Dashboard ===
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      statsVisible = !statsVisible;
      statsPanel.style.display = statsVisible ? 'block' : 'none';
      if (statsVisible) renderStats();
    });
  }

  // === Export / Import ===
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (apps.length === 0) { toast('No apps to export'); return; }
      const blob = new Blob([JSON.stringify(apps, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-creator-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Exported ${apps.length} apps`);
    });
  }

  if (importBtn && importFile) importBtn.addEventListener('click', () => importFile.click());

  if (importFile) {
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          const count = imported.length;
          apps = apps.concat(imported);
          saveToStorage();
          render();
          toast(`Imported ${count} apps`);
          updateStats();
        } catch (err) {
          alert('Invalid file. Please select a valid JSON backup.');
        }
      };
      reader.readAsText(file);
      importFile.value = '';
    });
  }

  // Initial render on load
  try {
    render();
    updateStats();
  } catch (err) {
    console.error('Error during initial render:', err);
  }
});

// === Render ===
function render() {
  const search = searchInput.value.toLowerCase().trim();
  const filter = filterTemplate.value;
  const sort = sortSelect.value;

  let filtered = apps.filter(app => {
    if (filter !== 'all' && app.template !== filter) return false;
    if (search && !app.name.toLowerCase().includes(search)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'za') return b.name.localeCompare(a.name);
    return 0;
  });

  appGrid.innerHTML = '';

  if (filtered.length === 0) {
    appGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${apps.length === 0 ? '📦' : '🔍'}</div>
        <h3>${apps.length === 0 ? 'No apps generated yet' : 'No apps match your search'}</h3>
        <p>${apps.length === 0 ? 'Click "+ Generate New App" to create a real working mini-app!' : 'Try changing your search or filter'}</p>
      </div>
    `;
    return;
  }

  filtered.forEach((app, idx) => {
    const realIndex = apps.indexOf(app);
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="icon">${app.icon || TEMPLATE_ICONS[app.template] || '📱'}</div>
      <span class="template-badge">${TEMPLATE_LABELS[app.template] || app.template}</span>
      <h3>${escapeHtml(app.name)}</h3>
      <p class="description">${escapeHtml(app.description || '')}</p>
      <div class="card-actions">
        <button class="btn-success open-btn" data-index="${realIndex}">▶ Open</button>
        <button class="btn-primary edit-btn" data-index="${realIndex}">✏️</button>
        <button class="btn-ghost dup-btn" data-index="${realIndex}" title="Duplicate">📋</button>
        <button class="btn-danger delete-btn" data-index="${realIndex}">🗑️</button>
      </div>
    `;
    appGrid.appendChild(card);
  });

  document.querySelectorAll('.open-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openDetail(parseInt(btn.dataset.index)); });
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openEditModal(parseInt(btn.dataset.index)); });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteApp(parseInt(btn.dataset.index)); });
  });
  document.querySelectorAll('.dup-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); duplicateApp(parseInt(btn.dataset.index)); });
  });
}

// === Helpers ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveToStorage() {
  localStorage.setItem('appCreatorApps', JSON.stringify(apps));
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// === CRUD ===
function createApp(data) {
  apps.push(data);
  saveToStorage();
  render();
}

function updateApp(index, data) {
  apps[index] = data;
  saveToStorage();
  render();
}

function deleteApp(index) {
  if (!confirm(`Delete "${apps[index].name}"?`)) return;
  apps.splice(index, 1);
  saveToStorage();
  render();
  updateStats();
}

function duplicateApp(index) {
  const orig = apps[index];
  const dup = { ...orig, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: orig.name + ' (copy)', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  apps.push(dup);
  saveToStorage();
  render();
  toast(`Duplicated "${orig.name}"`);
  updateStats();
}

// === Modal Open/Close ===
function openCreateModal() {
  editingId = null;
  appForm.reset();
  submitBtn.textContent = 'Generate App';
  modalTitle.textContent = 'Generate a New App';
  appModal.classList.add('active');
}

function openEditModal(index) {
  editingId = index;
  const app = apps[index];
  nameInput.value = app.name;
  descInput.value = app.description || '';
  templateInput.value = app.template;
  iconInput.value = app.icon || '';
  submitBtn.textContent = 'Update App';
  modalTitle.textContent = 'Edit App';
  appModal.classList.add('active');
}

function closeAppModal() {
  appModal.classList.remove('active');
  appForm.reset();
  editingId = null;
}

// === Detail Modal ===
function openDetail(index) {
  const app = apps[index];
  const html = generateAppHtml(app);

  detailBody.innerHTML = `
    <div class="detail-header">
      <div class="app-icon">${app.icon || TEMPLATE_ICONS[app.template] || '📱'}</div>
      <h2>${escapeHtml(app.name)}</h2>
      <div class="detail-meta">${TEMPLATE_LABELS[app.template] || app.template} ${app.description ? '— ' + escapeHtml(app.description) : ''}</div>
    </div>
    <div class="detail-actions">
      <button class="btn-success run-app-btn" data-index="${index}">▶ Run App</button>
      <button class="btn-primary download-app-btn" data-index="${index}">⬇ Download .html</button>
      <button class="btn-secondary copy-code-btn" data-index="${index}">📋 Copy Code</button>
    </div>
    <div class="app-frame-container">
      <iframe id="appFrame" srcdoc="${escapeHtml(html)}"></iframe>
    </div>
    <div class="detail-code">
      <h3>
        <span>Source Code</span>
        <span style="font-weight:400;font-size:0.78rem;color:var(--text-muted)">${html.length.toLocaleString()} bytes</span>
      </h3>
      <pre class="code-block">${escapeHtml(html)}</pre>
    </div>
  `;
  detailModal.classList.add('active');

  // Use event listeners instead of inline onclick to avoid HTML/JS escaping bugs
  const runBtn = detailBody.querySelector('.run-app-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      const frame = document.getElementById('appFrame');
      if (frame) {
        frame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        toast('App launched in iframe');
      }
    });
  }

  const downloadBtn = detailBody.querySelector('.download-app-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Downloaded "${app.name}.html"`);
    });
  }

  const copyBtn = detailBody.querySelector('.copy-code-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(html).then(() => toast('Source code copied!'));
    });
  }
}

window.runApp = function(html) {
  const frame = document.getElementById('appFrame');
  frame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
};

function closeDetailModal() {
  detailModal.classList.remove('active');
  detailBody.innerHTML = '';
}

window.downloadApp = function(index) {
  const app = apps[index];
  const html = generateAppHtml(app);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}.html`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`Downloaded "${app.name}.html"`);
};

window.copyCode = function(index) {
  const app = apps[index];
  const html = generateAppHtml(app);
  navigator.clipboard.writeText(html).then(() => toast('Source code copied!'));
};

// === Form Submit ===
appForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const template = templateInput.value;
  if (!template) { alert('Please select a template.'); return; }
  const name = nameInput.value.trim();
  if (!name) { alert('Please enter an app name.'); return; }

  const data = {
    id: editingId !== null ? apps[editingId].id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    description: descInput.value.trim(),
    template,
    icon: iconInput.value.trim() || TEMPLATE_ICONS[template] || '📱',
    createdAt: editingId !== null ? apps[editingId].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (editingId !== null) updateApp(editingId, data);
  else createApp(data);
  closeAppModal();
  updateStats();
});

// === Event Listeners ===
createAllBtn.addEventListener('click', () => {
  if (apps.length === 0) { toast('No apps to generate'); return; }
  const count = apps.length;
  apps.forEach((app, i) => {
    setTimeout(() => {
      const html = generateAppHtml(app);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
      if (i === count - 1) toast(`Created ${count} app files!`);
    }, i * 300);
  });
});

openBtn.addEventListener('click', openCreateModal);
closeBtn.addEventListener('click', closeAppModal);
cancelBtn.addEventListener('click', closeAppModal);
closeDetailBtn.addEventListener('click', closeDetailModal);

appModal.addEventListener('click', e => { if (e.target === appModal) closeAppModal(); });
detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetailModal(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (detailModal.classList.contains('active')) closeDetailModal();
    else if (appModal.classList.contains('active')) closeAppModal();
  }
});

templateInput.addEventListener('change', () => {
  const t = templateInput.value;
  if (t && !iconInput.value) iconInput.value = TEMPLATE_ICONS[t] || '📱';
});

searchInput.addEventListener('input', render);
filterTemplate.addEventListener('change', render);
sortSelect.addEventListener('change', render);

// === Stats Dashboard ===
function updateStats() {
  if (!statsVisible) return;
  renderStats();
}

function renderStats() {
  const total = apps.length;
  const byTemplate = {};
  apps.forEach(a => { byTemplate[a.template] = (byTemplate[a.template] || 0) + 1; });
  const topTemplate = Object.entries(byTemplate).sort((a, b) => b[1] - a[1])[0];

  statsGrid.innerHTML = `
    <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total Apps</div></div>
    <div class="stat-card"><div class="stat-value">${Object.keys(byTemplate).length}</div><div class="stat-label">Different Templates</div></div>
    <div class="stat-card"><div class="stat-value">${topTemplate ? topTemplate[1] : 0}</div><div class="stat-label">Most Used</div><div class="stat-sub">${topTemplate ? TEMPLATE_LABELS[topTemplate[0]] || topTemplate[0] : ''}</div></div>
    <div class="stat-card"><div class="stat-value">${total > 0 ? Math.round(apps.reduce((s, a) => s + generateAppHtml(a).length, 0) / total / 1024 * 10) / 10 : 0}kb</div><div class="stat-label">Avg Size</div></div>
    <div class="stat-card"><div class="stat-value">${new Date().toLocaleDateString()}</div><div class="stat-label">Last Opened</div></div>
    <div class="stat-card"><div class="stat-value">${appGrid.querySelectorAll('.app-card').length}</div><div class="stat-label">Visible Now</div></div>
  `;
}

statsBtn.addEventListener('click', () => {
  statsVisible = !statsVisible;
  statsPanel.style.display = statsVisible ? 'block' : 'none';
  if (statsVisible) renderStats();
});

// === Export / Import ===
exportBtn.addEventListener('click', () => {
  if (apps.length === 0) { toast('No apps to export'); return; }
  const blob = new Blob([JSON.stringify(apps, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `app-creator-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`Exported ${apps.length} apps`);
});

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      const count = imported.length;
      apps = apps.concat(imported);
      saveToStorage();
      render();
      toast(`Imported ${count} apps`);
      updateStats();
    } catch (err) {
      alert('Invalid file. Please select a valid JSON backup.');
    }
  };
  reader.readAsText(file);
  importFile.value = '';
});

// Initial render on load
try {
  render();
  updateStats();
} catch (err) {
  console.error('Error during initial render:', err);
}

// === App Generation Engine ===
function generateAppHtml(app) {
  const name = app.name || 'My App';
  switch (app.template) {
    case 'todo': return generateTodoApp(name, app.id);
    case 'counter': return generateCounterApp(name, app.id);
    case 'timer': return generateTimerApp(name, app.id);
    case 'notes': return generateNotesApp(name, app.id);
    case 'calculator': return generateCalculatorApp(name, app.id);
    case 'colorpicker': return generateColorPickerApp(name, app.id);
    case 'password': return generatePasswordApp(name, app.id);
    case 'weather': return generateWeatherApp(name, app.id);
    case 'pomodoro': return generatePomodoroApp(name, app.id);
    case 'quiz': return generateQuizApp(name, app.id);
    case 'tictactoe': return generateTicTacToeApp(name, app.id);
    case 'markdown': return generateMarkdownApp(name, app.id);
    case 'converter': return generateConverterApp(name, app.id);
    case 'memory': return generateMemoryApp(name, app.id);
    default: return generateTodoApp(name, app.id);
  }
}

// ========== TEMPLATES ==========

// --- Todo List ---
function generateTodoApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#fff;border-radius:16px;padding:2rem;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
h1{font-size:1.5rem;margin-bottom:1rem;color:#333}
.input-row{display:flex;gap:0.5rem;margin-bottom:1rem}
.input-row input{flex:1;padding:0.7rem 1rem;border:2px solid #e0e0e0;border-radius:10px;font-size:0.95rem;outline:none}
.input-row input:focus{border-color:#667eea}
.input-row button{padding:0.7rem 1.3rem;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer}
.todo-list{list-style:none}
.todo-item{display:flex;align-items:center;gap:0.7rem;padding:0.7rem 0;border-bottom:1px solid #f0f0f0}
.todo-item:last-child{border-bottom:none}
.todo-item input[type="checkbox"]{width:1.2rem;height:1.2rem;cursor:pointer;accent-color:#667eea}
.todo-item .todo-text{flex:1;font-size:0.95rem;color:#444}
.todo-item .todo-text.done{text-decoration:line-through;color:#aaa}
.todo-item .delete-todo{background:none;border:none;color:#e74c3c;cursor:pointer;font-size:1rem;opacity:0.5}
.todo-item .delete-todo:hover{opacity:1}
.stats{display:flex;justify-content:space-between;margin-top:1rem;font-size:0.82rem;color:#888}
</style></head><body><div class="card"><h1>📋 ${escapeHtml(name)}</h1><div class="input-row"><input id="todoInput" placeholder="Add a task..." autofocus><button onclick="addTodo()">Add</button></div><ul class="todo-list" id="todoList"></ul><div class="stats"><span id="todoCount">0 remaining</span><button onclick="clearDoneTodo()" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:0.82rem">Clear done</button></div></div><script>
let todos=JSON.parse(localStorage.getItem('todos_${id}'))||[];function s(){localStorage.setItem('todos_${id}',JSON.stringify(todos));r()}
function r(){const l=document.getElementById('todoList');l.innerHTML=todos.map((x,i)=>'<li class="todo-item"><input type="checkbox"'+(x.done?' checked':'')+' onchange="toggleTodo('+i+')"><span class="todo-text'+(x.done?' done':'')+'">'+e(x.text)+'</span><button class="delete-todo" onclick="delTodo('+i+')">✕</button></li>').join('');document.getElementById('todoCount').textContent=todos.filter(x=>!x.done).length+' remaining'}
function addTodo(){const i=document.getElementById('todoInput'),x=i.value.trim();if(!x)return;todos.push({text:x,done:false});i.value='';s()}
function toggleTodo(i){todos[i].done=!todos[i].done;s()}
function delTodo(i){todos.splice(i,1);s()}
function clearDoneTodo(){todos=todos.filter(x=>!x.done);s()}
function e(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
document.getElementById('todoInput').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo()});r()
</script></body></html>`;
}

// --- Counter ---
function generateCounterApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#11998e,#38ef7d);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:400px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25)}
h1{font-size:1.4rem;margin-bottom:1.5rem;color:#333}
.number{font-size:5rem;font-weight:800;color:#11998e;line-height:1;margin-bottom:1.5rem}
.buttons{display:flex;gap:0.7rem;justify-content:center}
.buttons button{padding:0.8rem 1.5rem;font-size:1.1rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;transition:transform 0.15s;min-width:70px}
.buttons button:hover{transform:scale(1.05)}
.btn-inc{background:linear-gradient(135deg,#11998e,#38ef7d);color:#fff}
.btn-dec{background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff}
.btn-reset{background:#f0f0f0;color:#555}
.steps{display:flex;gap:0.4rem;justify-content:center;margin:1rem 0}
.steps button{padding:0.4rem 0.7rem;font-size:0.8rem;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:#fafafa}
.steps button.active{background:#11998e;color:#fff;border-color:#11998e}
.history{margin-top:1rem;font-size:0.82rem;color:#888}
</style></head><body><div class="card"><h1>🔢 ${escapeHtml(name)}</h1><div class="number" id="display">0</div><div class="steps"><button class="active" onclick="setStep(1)">×1</button><button onclick="setStep(5)">×5</button><button onclick="setStep(10)">×10</button></div><div class="buttons"><button class="btn-dec" onclick="change(-step)">−</button><button class="btn-reset" onclick="resetCount()">Reset</button><button class="btn-inc" onclick="change(step)">+</button></div><div class="history" id="history"></div></div><script>
let c=parseInt(localStorage.getItem('counter_${id}')||'0'),step=1,h=[];
function r(){document.getElementById('display').textContent=c;document.getElementById('history').textContent=h.length?'History: '+h.slice(-8).join(', '):'';localStorage.setItem('counter_${id}',c.toString())}
function change(n){c+=n;h.push((n>0?'+':'')+n);r()}
function resetCount(){c=0;h.push('⟳');r()}
function setStep(n){step=n;document.querySelectorAll('.steps button').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.steps button')[n===1?0:n===5?1:2].classList.add('active')}
r()
</script></body></html>`;
}

// --- Timer ---
function generateTimerApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;background:linear-gradient(135deg,#1a1a2e,#16213e);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#0f3460;border-radius:20px;padding:2.5rem;width:100%;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
h1{font-size:1.3rem;margin-bottom:1.5rem;color:#e94560;letter-spacing:0.05em}
.timer{font-size:4rem;font-weight:800;color:#fff;letter-spacing:0.05em;margin-bottom:1.5rem;font-variant-numeric:tabular-nums}
.controls{display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;margin-bottom:1rem}
.controls button{padding:0.7rem 1.4rem;font-size:0.9rem;font-weight:600;border:none;border-radius:10px;cursor:pointer;transition:transform 0.15s;font-family:inherit;text-transform:uppercase;letter-spacing:0.05em}
.controls button:hover{transform:scale(1.05)}
.btn-start{background:#e94560;color:#fff}
.btn-stop{background:#fca311;color:#222}
.btn-reset{background:#333;color:#ccc}
.laps{margin-top:1rem;max-height:150px;overflow-y:auto}
.lap{display:flex;justify-content:space-between;padding:0.3rem 0.5rem;color:#a0a0c0;font-size:0.8rem;border-bottom:1px solid rgba(255,255,255,0.05)}
.lap .lap-num{color:#666}
</style></head><body><div class="card"><h1>⏱️ ${escapeHtml(name)}</h1><div class="timer" id="display">00:00.00</div><div class="controls"><button class="btn-start" onclick="start()" id="startBtn">Start</button><button class="btn-stop" onclick="lap()">Lap</button><button class="btn-reset" onclick="resetT()">Reset</button></div><div class="laps" id="laps"></div></div><script>
let ms=0,r=0,i=null,l=[],lc=0;
function f(t){return String(Math.floor(t/60000)).padStart(2,'0')+':'+String(Math.floor((t%60000)/1000)).padStart(2,'0')+'.'+String(Math.floor((t%1000)/10)).padStart(2,'0')}
function u(){document.getElementById('display').textContent=f(ms)}
function start(){if(r){clearInterval(i);r=0;document.getElementById('startBtn').textContent='Resume';return}r=1;document.getElementById('startBtn').textContent='Pause';i=setInterval(()=>{ms+=10;u()},10)}
function lap(){if(!r)return;lc++;l.push(ms);document.getElementById('laps').innerHTML=l.map((x,i)=>'<div class="lap"><span class="lap-num">Lap '+(i+1)+'</span><span>'+f(x)+'</span></div>').reverse().join('')}
function resetT(){clearInterval(i);r=0;ms=0;lc=0;l=[];document.getElementById('startBtn').textContent='Start';document.getElementById('laps').innerHTML='';u()}
u()
</script></body></html>`;
}

// --- Notes ---
function generateNotesApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#fc5c7d,#6a82fb);min-height:100vh;padding:1rem;display:flex;align-items:center;justify-content:center}
.card{background:#fff;border-radius:16px;padding:2rem;width:100%;max-width:550px;box-shadow:0 20px 60px rgba(0,0,0,0.25)}
h1{font-size:1.5rem;margin-bottom:1rem;color:#333}
.input-row{display:flex;gap:0.5rem;margin-bottom:1rem}
.input-row input{flex:1;padding:0.7rem 1rem;border:2px solid #e0e0e0;border-radius:10px;font-size:0.95rem;outline:none}
.input-row input:focus{border-color:#6a82fb}
.input-row button{padding:0.7rem 1.3rem;background:linear-gradient(135deg,#fc5c7d,#6a82fb);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer}
.note-grid{display:grid;gap:0.6rem}
.note{background:#f8f9ff;border-radius:10px;padding:1rem;border:1px solid #e8e8f0;display:flex;align-items:flex-start;gap:0.7rem}
.note .note-text{flex:1;font-size:0.92rem;color:#444;line-height:1.4;word-break:break-word}
.note .note-time{font-size:0.72rem;color:#aaa;white-space:nowrap}
.note .del-btn{background:none;border:none;color:#e74c3c;cursor:pointer;font-size:1rem;opacity:0.5;padding:0.2rem}
.note .del-btn:hover{opacity:1}
.empty{text-align:center;color:#aaa;padding:2rem;font-size:0.9rem}
.search-note{margin-bottom:0.8rem}
.search-note input{width:100%;padding:0.6rem 1rem;border:1px solid #e0e0e0;border-radius:8px;font-size:0.85rem;outline:none}
.search-note input:focus{border-color:#6a82fb}
</style></head><body><div class="card"><h1>📝 ${escapeHtml(name)}</h1><div class="input-row"><input id="noteInput" placeholder="Write a note..." autofocus><button onclick="addNote()">Add</button></div><div class="search-note"><input id="searchNote" placeholder="Search notes..." oninput="render()"></div><div class="note-grid" id="noteGrid"></div></div><script>
let n=JSON.parse(localStorage.getItem('notes_${id}'))||[];
function s(){localStorage.setItem('notes_${id}',JSON.stringify(n));render()}
function render(){const q=document.getElementById('searchNote').value.toLowerCase();const g=document.getElementById('noteGrid');let f=n;if(q)f=f.filter(x=>x.text.toLowerCase().includes(q));if(!f.length){g.innerHTML='<div class="empty">'+(n.length?'No matching notes':'No notes yet')+'</div>';return}
g.innerHTML=f.map((x,i)=>'<div class="note"><div class="note-text">'+e(x.text)+'</div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem"><button class="del-btn" onclick="del('+n.indexOf(x)+')">✕</button><span class="note-time">'+(x.time||'')+'</span></div></div>').join('')}
function addNote(){const i=document.getElementById('noteInput'),x=i.value.trim();if(!x)return;const d=new Date();n.push({text:x,time:d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});i.value='';s()}
function del(i){n.splice(i,1);s()}
function e(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
document.getElementById('noteInput').addEventListener('keydown',e=>{if(e.key==='Enter')addNote()});render()
</script></body></html>`;
}

// --- Calculator ---
function generateCalculatorApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#2c3e50,#3498db);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.calc{background:#1a1a2e;border-radius:20px;padding:1.5rem;width:100%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
h1{font-size:1rem;margin-bottom:0.8rem;color:#6a82fb;text-align:center}
.display{background:#0f0f23;border-radius:12px;padding:1rem 1.2rem;margin-bottom:1rem;text-align:right}
.display .expr{font-size:0.85rem;color:#666;min-height:1.2em;word-break:break-all}
.display .result{font-size:2.2rem;font-weight:700;color:#fff;min-height:1.4em}
.buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem}
.buttons button{padding:0.8rem;font-size:1.1rem;font-weight:600;border:none;border-radius:10px;cursor:pointer;transition:transform 0.1s}
.buttons button:active{transform:scale(0.93)}
.btn-num{background:#2a2a4a;color:#e0e0f0}
.btn-op{background:#3a3a6a;color:#6a82fb}
.btn-eq{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-clr{background:#4a2a2a;color:#e74c3c}
.btn-fn{background:#2a3a2a;color:#38ef7d}
.span-2{grid-column:span 2}
</style></head><body><div class="calc"><h1>🧮 ${escapeHtml(name)}</h1><div class="display"><div class="expr" id="expr"></div><div class="result" id="result">0</div></div><div class="buttons"><button class="btn-clr" onclick="c()">AC</button><button class="btn-fn" onclick="o('(')">(</button><button class="btn-fn" onclick="o(')')">)</button><button class="btn-op" onclick="o('/')">÷</button><button class="btn-num" onclick="n('7')">7</button><button class="btn-num" onclick="n('8')">8</button><button class="btn-num" onclick="n('9')">9</button><button class="btn-op" onclick="o('*')">×</button><button class="btn-num" onclick="n('4')">4</button><button class="btn-num" onclick="n('5')">5</button><button class="btn-num" onclick="n('6')">6</button><button class="btn-op" onclick="o('-')">−</button><button class="btn-num" onclick="n('1')">1</button><button class="btn-num" onclick="n('2')">2</button><button class="btn-num" onclick="n('3')">3</button><button class="btn-op" onclick="o('+')">+</button><button class="btn-fn" onclick="n('0')">0</button><button class="btn-fn" onclick="n('.')">.</button><button class="btn-eq span-2" onclick="eq()">=</button></div></div><script>
let e='';function r(){document.getElementById('expr').textContent=e;try{if(e)document.getElementById('result').textContent=eval(e)}catch(ee){}}
function n(v){e+=v;r()}
function o(v){if(e&&/[\\d)]$/.test(e)){e+=v;r()}}
function eq(){try{if(e){const x=eval(e);document.getElementById('result').textContent=x;e=String(x)}}catch(ee){document.getElementById('result').textContent='Error'}}
function c(){e='';document.getElementById('result').textContent='0';document.getElementById('expr').textContent=''}
document.addEventListener('keydown',ev=>{if(/[\\d.()]/.test(ev.key))n(ev.key);else if('+-*/'.includes(ev.key))o(ev.key);else if(ev.key==='Enter'||ev.key==='=')eq();else if(ev.key==='Backspace'){e=e.slice(0,-1);r()}})
</script></body></html>`;
}

// --- Color Picker ---
function generateColorPickerApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#1a1a2e;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#16213e;border-radius:20px;padding:2rem;width:100%;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
h1{font-size:1.3rem;margin-bottom:1.5rem;color:#e94560}
.preview{width:100%;height:160px;border-radius:14px;margin-bottom:1.5rem;transition:background 0.15s;border:3px solid rgba(255,255,255,0.1)}
.controls{display:flex;flex-direction:column;gap:0.8rem}
.row{display:flex;align-items:center;gap:0.8rem}
.row label{width:25px;font-weight:700;color:#a0a0c0;font-size:0.85rem}
.row input[type="range"]{flex:1;accent-color:#e94560;height:6px}
.row .v{min-width:35px;text-align:right;color:#e0e0f0;font-weight:600;font-size:0.85rem}
.picker-row{display:flex;gap:0.8rem;justify-content:center;margin-top:0.5rem}
.picker-row input[type="color"]{width:50px;height:50px;border:none;border-radius:10px;cursor:pointer;background:none}
.picker-row input[type="color"]::-webkit-color-swatch-wrapper{padding:0}
.picker-row input[type="color"]::-webkit-color-swatch{border:2px solid rgba(255,255,255,0.15);border-radius:8px}
.hex{display:flex;justify-content:center;gap:0.5rem;margin-top:1rem;background:#0f0f23;padding:0.7rem;border-radius:10px;font-family:'Courier New',monospace;font-size:1.1rem;color:#fff;cursor:pointer}
.hex span{background:rgba(255,255,255,0.05);padding:0.2rem 0.6rem;border-radius:6px;font-size:0.75rem;color:#888}
</style></head><body><div class="card"><h1>🎨 ${escapeHtml(name)}</h1><div class="preview" id="preview"></div><div class="controls"><div class="row"><label>R</label><input type="range" min="0" max="255" value="102" id="r"><span class="v" id="rv">102</span></div><div class="row"><label>G</label><input type="range" min="0" max="255" value="126" id="g"><span class="v" id="gv">126</span></div><div class="row"><label>B</label><input type="range" min="0" max="255" value="234" id="b"><span class="v" id="bv">234</span></div><div class="picker-row"><input type="color" id="cp" value="#667eea"></div><div class="hex" id="hexD" onclick="copyH()">#667eea <span>Copy</span></div></div></div><script>
const rS=document.getElementById('r'),gS=document.getElementById('g'),bS=document.getElementById('b');
const rV=document.getElementById('rv'),gV=document.getElementById('gv'),bV=document.getElementById('bv');
const pv=document.getElementById('preview'),hx=document.getElementById('hexD'),cp=document.getElementById('cp');
function up(){const r=+rS.value,g=+gS.value,b=+bS.value;rV.textContent=r;gV.textContent=g;bV.textContent=b;const hex='#'+[r,g,b].map(c=>c.toString(16).padStart(2,'0')).join('');pv.style.background=hex;hx.childNodes[0].textContent=hex;cp.value=hex}
function fp(){const c=cp.value;rS.value=parseInt(c.slice(1,3),16);gS.value=parseInt(c.slice(3,5),16);bS.value=parseInt(c.slice(5,7),16);up()}
function copyH(){navigator.clipboard.writeText(hx.childNodes[0].textContent.trim()).then(()=>{const t=hx.innerHTML;hx.innerHTML='Copied! ✓';setTimeout(()=>hx.innerHTML=t,1200)})}
rS.addEventListener('input',up);gS.addEventListener('input',up);bS.addEventListener('input',up);cp.addEventListener('input',fp);up()
</script></body></html>`;
}

// --- Password Generator ---
function generatePasswordApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#1e1e3a;border-radius:20px;padding:2rem;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06)}
h1{font-size:1.4rem;margin-bottom:1.5rem;color:#f7971e;text-align:center}
.pw-display{background:#0f0f23;border-radius:12px;padding:1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.7rem}
.pw-display input{flex:1;background:none;border:none;color:#fff;font-size:1.3rem;font-family:'Courier New',monospace;outline:none;letter-spacing:0.05em}
.pw-display button{background:#667eea;color:#fff;border:none;padding:0.5rem 1rem;border-radius:8px;cursor:pointer;font-weight:600;white-space:nowrap}
.options{display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem}
.opt-row{display:flex;align-items:center;justify-content:space-between}
.opt-row label{color:#b0b0d0;font-size:0.88rem}
.opt-row input[type="number"]{width:70px;padding:0.5rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#e0e0f0;text-align:center;font-size:0.9rem}
.opt-row input[type="checkbox"]{width:1.2rem;height:1.2rem;accent-color:#667eea;cursor:pointer}
.strength{display:flex;align-items:center;gap:0.7rem;margin-bottom:1.5rem}
.strength-bar{flex:1;height:6px;background:#333;border-radius:3px;overflow:hidden}
.strength-bar div{height:100%;border-radius:3px;transition:width 0.3s,background 0.3s}
.strength-label{font-size:0.82rem;color:#888;min-width:50px;text-align:right}
button.gen{width:100%;padding:0.8rem;background:linear-gradient(135deg,#f7971e,#ffd200);color:#222;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;transition:transform 0.15s}
button.gen:hover{transform:translateY(-2px)}
</style></head><body><div class="card"><h1>🔐 ${escapeHtml(name)}</h1><div class="pw-display"><input id="pw" readonly value="P@ssw0rd!"><button onclick="copyPw()">Copy</button></div><div class="options"><div class="opt-row"><label>Length</label><input type="number" id="len" value="16" min="4" max="64"></div><div class="opt-row"><label>Uppercase (A-Z)</label><input type="checkbox" id="up" checked></div><div class="opt-row"><label>Lowercase (a-z)</label><input type="checkbox" id="low" checked></div><div class="opt-row"><label>Numbers (0-9)</label><input type="checkbox" id="num" checked></div><div class="opt-row"><label>Symbols (!@#)</label><input type="checkbox" id="sym" checked></div><div class="opt-row"><label>Exclude Similar</label><input type="checkbox" id="excl"></div></div><div class="strength"><span style="font-size:0.82rem;color:#888">Strength</span><div class="strength-bar"><div id="strBar" style="width:70%;background:#38ef7d"></div></div><span class="strength-label" id="strLabel">Strong</span></div><button class="gen" onclick="gen()">🔄 Generate Password</button></div><script>
const U='ABCDEFGHJKLMNPQRSTUVWXYZ',L='abcdefghjkmnpqrstuvwxyz',N='23456789',S='!@#$%^&*()_+-=[]{}|;:,.<>?',SIM='O0Il1|';
function gen(){const len=Math.min(64,Math.max(4,+document.getElementById('len').value||16));let chars='',ex=document.getElementById('excl').checked;if(document.getElementById('up').checked)chars+=ex?U:U+'O';if(document.getElementById('low').checked)chars+=ex?L:L+'il';if(document.getElementById('num').checked)chars+=ex?N:N+'01';if(document.getElementById('sym').checked)chars+=S;if(!chars){document.getElementById('pw').value='Select options';return}let pw='';for(let i=0;i<len;i++)pw+=chars[Math.floor(Math.random()*chars.length)];document.getElementById('pw').value=pw;upStr(pw.length,chars.length)}
function upStr(l,p){const b=document.getElementById('strBar'),lb=document.getElementById('strLabel');let s=Math.min(100,(l/8)*25+(p/15)*35+(l>=12?20:0)+(l>=16?20:0));if(s<30){b.style.background='#e74c3c';lb.textContent='Weak'}else if(s<55){b.style.background='#fca311';lb.textContent='Medium'}else if(s<80){b.style.background='#38ef7d';lb.textContent='Strong'}else{b.style.background='#11998e';lb.textContent='Very Strong'}b.style.width=s+'%'}
function copyPw(){const p=document.getElementById('pw');navigator.clipboard.writeText(p.value).then(()=>{const t=p.value;p.value='Copied!';setTimeout(()=>p.value=t,800)})}
gen()
</script></body></html>`;
}

// --- Weather Demo ---
function generateWeatherApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#1a2a6c,#b21f1f,#fdbb2d);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:rgba(255,255,255,0.1);backdrop-filter:blur(16px);border-radius:20px;padding:2rem;width:100%;max-width:400px;text-align:center;border:1px solid rgba(255,255,255,0.15);box-shadow:0 20px 60px rgba(0,0,0,0.3)}
h1{font-size:1.3rem;margin-bottom:0.3rem;color:#fff}
.sub{font-size:0.82rem;color:rgba(255,255,255,0.6);margin-bottom:1.5rem}
.search{display:flex;gap:0.5rem;margin-bottom:1.5rem}
.search input{flex:1;padding:0.7rem 1rem;border:1px solid rgba(255,255,255,0.2);border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;font-size:0.95rem;outline:none}
.search input::placeholder{color:rgba(255,255,255,0.4)}
.search input:focus{border-color:rgba(255,255,255,0.5)}
.search button{padding:0.7rem 1.2rem;background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:10px;cursor:pointer;font-weight:600}
.wicon{font-size:4rem;margin-bottom:0.5rem}
.temp{font-size:3.5rem;font-weight:800;color:#fff;line-height:1;margin-bottom:0.3rem}
.cond{font-size:1.1rem;color:rgba(255,255,255,0.8);margin-bottom:0.3rem}
.city{font-size:1.1rem;color:rgba(255,255,255,0.7);margin-bottom:1.2rem}
.details{display:grid;grid-template-columns:repeat(3,1fr);gap:0.7rem}
.detail{background:rgba(255,255,255,0.08);border-radius:12px;padding:0.7rem}
.detail .l{font-size:0.7rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.05em}
.detail .v{font-size:1rem;font-weight:700;color:#fff;margin-top:0.2rem}
.note{margin-top:1rem;font-size:0.75rem;color:rgba(255,255,255,0.35)}
</style></head><body><div class="card"><h1>🌤️ ${escapeHtml(name)}</h1><p class="sub">Browser weather demo</p><div class="search"><input id="city" placeholder="Enter city..." value="Tunis"><button onclick="fw()">Search</button></div><div id="wd"><div class="wicon">🌤️</div><div class="temp">24°C</div><div class="cond">Partly Cloudy</div><div class="city">📍 Tunis</div><div class="details"><div class="detail"><div class="l">Humidity</div><div class="v">58%</div></div><div class="detail"><div class="l">Wind</div><div class="v">12 km/h</div></div><div class="detail"><div class="l">Feels</div><div class="v">23°C</div></div></div></div><p class="note">Demo data · Try: Tunis, London, Tokyo, Paris, Dubai, New York</p></div><script>
const D={tunis:{t:24,c:'Partly Cloudy',h:58,w:12,f:23,i:'🌤️',co:'Tunisia'},london:{t:12,c:'Light Rain',h:75,w:18,f:10,i:'🌧️',co:'UK'},tokyo:{t:18,c:'Clear',h:45,w:8,f:17,i:'☀️',co:'Japan'},paris:{t:15,c:'Cloudy',h:65,w:14,f:13,i:'☁️',co:'France'},dubai:{t:38,c:'Sunny',h:20,w:10,f:36,i:'☀️',co:'UAE'},newyork:{t:20,c:'Fair',h:55,w:16,f:19,i:'🌤️',co:'USA'}};
function fw(){const i=document.getElementById('city'),c=i.value.trim().toLowerCase().replace(/\\s/g,'');const d=D[c];if(!d){document.getElementById('wd').innerHTML='<p style="color:rgba(255,255,255,0.7);padding:1rem">City not found</p>';return}
const n=c.charAt(0).toUpperCase()+c.slice(1);document.getElementById('wd').innerHTML='<div class="wicon">'+d.i+'</div><div class="temp">'+d.t+'°C</div><div class="cond">'+d.c+'</div><div class="city">📍 '+n+', '+d.co+'</div><div class="details"><div class="detail"><div class="l">Humidity</div><div class="v">'+d.h+'%</div></div><div class="detail"><div class="l">Wind</div><div class="v">'+d.w+' km/h</div></div><div class="detail"><div class="l">Feels</div><div class="v">'+d.f+'°C</div></div></div>'}
document.getElementById('city').addEventListener('keydown',e=>{if(e.key==='Enter')fw()})
</script></body></html>`;
}

// --- Pomodoro ---
function generatePomodoroApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#e74c3c,#c0392b);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:400px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
h1{font-size:1.4rem;margin-bottom:1.5rem;color:#c0392b}
.mode{display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem}
.mode button{padding:0.5rem 1rem;border:2px solid #e0e0e0;background:transparent;border-radius:8px;font-weight:600;cursor:pointer;color:#888;transition:0.2s;font-size:0.82rem}
.mode button.active{border-color:#e74c3c;color:#e74c3c;background:rgba(231,76,60,0.05)}
.timer{font-size:5rem;font-weight:800;color:#c0392b;font-variant-numeric:tabular-nums;line-height:1;margin-bottom:1.5rem}
.controls{display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;margin-bottom:0.8rem}
.controls button{padding:0.7rem 1.5rem;font-size:0.95rem;font-weight:600;border:none;border-radius:10px;cursor:pointer;transition:transform 0.15s}
.controls button:hover{transform:scale(1.05)}
.btn-start{background:#e74c3c;color:#fff}
.btn-reset{background:#eee;color:#555}
.session-count{font-size:0.85rem;color:#aaa;margin-top:0.5rem}
</style></head><body><div class="card"><h1>🍅 ${escapeHtml(name)}</h1><div class="mode"><button class="active" onclick="setM('p')">Pomodoro</button><button onclick="setM('s')">Short</button><button onclick="setM('l')">Long</button></div><div class="timer" id="timer">25:00</div><div class="controls"><button class="btn-start" onclick="tog()" id="startBtn">Start</button><button class="btn-reset" onclick="resetT()">Reset</button></div><div class="session-count" id="sess">Sessions: 0</div></div><script>
const D={p:25,s:5,l:15};let m='p',t=D.p*60,r=0,i=null,se=parseInt(localStorage.getItem('pomo_${id}')||'0');
function u(){const m=Math.floor(t/60),s=t%60;document.getElementById('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function setM(n){if(r)tog();m=n;document.querySelectorAll('.mode button').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.mode button')['psl'.indexOf(n)].classList.add('active');t=D[n]*60;u()}
function tog(){if(r){clearInterval(i);r=0;document.getElementById('startBtn').textContent='Resume';return}r=1;document.getElementById('startBtn').textContent='Pause';i=setInterval(()=>{t--;u();if(t<=0){clearInterval(i);r=0;document.getElementById('startBtn').textContent='Start';se++;localStorage.setItem('pomo_${id}',se.toString());document.getElementById('sess').textContent='Sessions: '+se;alert('Time\\'s up!');setM(m==='p'?'s':'p')}},1000)}
function resetT(){if(r){clearInterval(i);r=0;document.getElementById('startBtn').textContent='Start'}t=D[m]*60;u()}
document.getElementById('sess').textContent='Sessions: '+se;u()
</script></body></html>`;
}

// --- Quiz ---
function generateQuizApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#6a11cb,#2575fc);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
h1{font-size:1.3rem;margin-bottom:0.5rem;color:#333}
.progress{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem}
.progress .count{font-size:0.82rem;color:#888}
.progress .bar{flex:1;height:4px;background:#e0e0e0;border-radius:2px;margin:0 1rem;overflow:hidden}
.progress .bar div{height:100%;background:linear-gradient(90deg,#6a11cb,#2575fc);border-radius:2px;transition:width 0.3s}
.q{font-size:1.1rem;font-weight:600;color:#444;margin-bottom:1rem;line-height:1.5}
.opts{display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.2rem}
.opt{padding:0.8rem 1rem;border:2px solid #e0e0e0;border-radius:10px;cursor:pointer;font-size:0.95rem;transition:0.2s;background:#fafafa;color:#444}
.opt:hover{border-color:#6a11cb;background:#f0edff}
.opt.sel{border-color:#6a11cb;background:#6a11cb;color:#fff}
.opt.cor{border-color:#11998e;background:#11998e;color:#fff}
.opt.wro{border-color:#e74c3c;background:#e74c3c;color:#fff}
.next{width:100%;padding:0.8rem;background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:transform 0.15s}
.next:hover{transform:translateY(-2px)}
.next:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.result{text-align:center}
.result .score{font-size:4rem;font-weight:800;color:#6a11cb;margin-bottom:0.5rem}
.result .msg{font-size:1.1rem;color:#666;margin-bottom:1.5rem}
.result .restart{padding:0.8rem 2rem;background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;border:none;border-radius:12px;font-weight:600;cursor:pointer}
.shuffle{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem;font-size:0.82rem;color:#888}
.shuffle input{cursor:pointer}
</style></head><body><div class="card"><h1>❓ ${escapeHtml(name)}</h1><div id="quizBody"></div></div><script>
const ALL_Q=[{q:'What does HTML stand for?',o:['Hyper Text Markup Language','High Tech Modern Language','Home Tool Management Language','Hyper Transfer Markup Language'],a:0},{q:'Which language runs in a web browser?',o:['Java','C++','Python','JavaScript'],a:3},{q:'What is the capital of France?',o:['London','Berlin','Paris','Madrid'],a:2},{q:'What year was JavaScript created?',o:['1993','1995','1998','2000'],a:1},{q:'What does CSS stand for?',o:['Computer Style Sheets','Cascading Style Sheets','Creative Style System','Colorful Style Sheets'],a:1},{q:'Which planet is known as the Red Planet?',o:['Venus','Jupiter','Mars','Saturn'],a:2},{q:'What is the chemical symbol for water?',o:['H2O','CO2','NaCl','O2'],a:0},{q:'Which data structure uses FIFO?',o:['Stack','Queue','Tree','Graph'],a:1},{q:'What is the largest ocean?',o:['Atlantic','Indian','Arctic','Pacific'],a:3},{q:'Who painted the Mona Lisa?',o:['Michelangelo','Da Vinci','Raphael','Donatello'],a:1}];
let questions=[...ALL_Q],cur=0,score=0,ans=false,shuff=false;
const body=document.getElementById('quizBody');
function sf(){if(shuff){const qs=[...ALL_Q];for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]]}questions=qs}else questions=[...ALL_Q];cur=0;score=0;render()}
function render(){if(cur>=questions.length){showR();return}const q=questions[cur];body.innerHTML='<div class="shuffle"><label><input type="checkbox" '+(shuff?'checked':'')+' onchange="shuff=!shuff;sf()"> Shuffle questions</label></div><div class="progress"><span class="count">'+(cur+1)+' / '+questions.length+'</span><div class="bar"><div style="width:'+((cur)/questions.length*100)+'%"></div></div></div><div class="q">'+q.q+'</div><div class="opts">'+q.o.map((o,i)=>'<div class="opt" onclick="sel('+i+')">'+o+'</div>').join('')+'</div><button class="next" id="nextBtn" disabled onclick="nextQ()">Next</button>';ans=false}
function sel(i){if(ans)return;const q=questions[cur];const opts=document.querySelectorAll('.opt');opts.forEach((o,idx)=>{o.classList.remove('sel','cor','wro');if(idx===i)o.classList.add('sel')});ans=true;const s=opts[i];if(i===q.a){s.classList.add('cor');score++}else{s.classList.add('wro');opts[q.a].classList.add('cor')}document.getElementById('nextBtn').disabled=false}
function nextQ(){cur++;render()}
function showR(){const p=Math.round(score/questions.length*100);const m=p>=80?'Excellent!':p>=60?'Good job!':p>=40?'Not bad!':'Keep practicing!';body.innerHTML='<div class="result"><div class="score">'+score+' / '+questions.length+'</div><div class="msg">'+m+' ('+p+'%)</div><button class="restart" onclick="sf()">🔄 Try Again</button></div>'}
render()
</script></body></html>`;
}

// --- NEW: Tic-Tac-Toe ---
function generateTicTacToeApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#1e1e3a;border-radius:20px;padding:2rem;width:100%;max-width:380px;text-align:center;border:1px solid rgba(255,255,255,0.06);box-shadow:0 20px 60px rgba(0,0,0,0.4)}
h1{font-size:1.3rem;margin-bottom:0.5rem;color:#e94560}
.status{font-size:1.1rem;color:#a0a0d0;margin-bottom:1rem;min-height:1.5em}
.board{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:1.2rem;max-width:300px;margin-left:auto;margin-right:auto}
.cell{aspect-ratio:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;font-size:2.5rem;font-weight:800;cursor:pointer;transition:0.2s;display:flex;align-items:center;justify-content:center;color:#e0e0f0}
.cell:hover{background:rgba(255,255,255,0.08)}
.cell.x{color:#e94560}
.cell.o{color:#38ef7d}
.cell.win{background:rgba(56,239,125,0.15)}
.score{display:flex;justify-content:center;gap:2rem;margin-bottom:1rem;font-size:0.9rem;color:#8888aa}
.score span{font-weight:700;font-size:1.2rem;color:#e0e0f0}
.controls{display:flex;gap:0.5rem;justify-content:center}
.controls button{padding:0.6rem 1.2rem;font-size:0.85rem;font-weight:600;border:none;border-radius:8px;cursor:pointer;transition:transform 0.15s}
.controls button:hover{transform:scale(1.05)}
.btn-restart{background:#e94560;color:#fff}
.btn-ai{background:#667eea;color:#fff}
.mode-badge{font-size:0.75rem;color:#888;margin-bottom:0.5rem}
</style></head><body><div class="card"><h1>✖️ ${escapeHtml(name)}</h1><div class="mode-badge" id="modeLabel">vs Player</div><div class="status" id="status">X's turn</div><div class="score"><div>X <span id="scoreX">0</span></div><div>Draw <span id="scoreD">0</span></div><div>O <span id="scoreO">0</span></div></div><div class="board" id="board"></div><div class="controls"><button class="btn-restart" onclick="restart()">↻ Restart</button><button class="btn-ai" onclick="toggleAI()" id="aiBtn">🤖 AI</button></div></div><script>
let b=['','','','','','','','',''],turn='X',over=false,ai=false,sX=parseInt(localStorage.getItem('tttX_${id}')||'0'),sO=parseInt(localStorage.getItem('tttO_${id}')||'0'),sD=parseInt(localStorage.getItem('tttD_${id}')||'0');
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function render(){const brd=document.getElementById('board');brd.innerHTML=b.map((c,i)=>'<div class="cell '+(c==='X'?'x':c==='O'?'o':'')+'" onclick="move('+i+')">'+c+'</div>').join('');document.getElementById('scoreX').textContent=sX;document.getElementById('scoreO').textContent=sO;document.getElementById('scoreD').textContent=sD;document.getElementById('status').textContent=over?document.getElementById('status').textContent:(turn==='X'?"X's turn":"O's turn");document.getElementById('modeLabel').textContent=ai?'vs AI':'vs Player';if(ai&&turn==='O'&&!over)setTimeout(aiMove,300)}
function move(i){if(over||b[i])return;b[i]=turn;const w=checkWin(turn);if(w){over=true;w.forEach(j=>document.querySelectorAll('.cell')[j].classList.add('win'));if(turn==='X')sX++;else sO++;localStorage.setItem('tttX_${id}',sX.toString());localStorage.setItem('tttO_${id}',sO.toString());document.getElementById('status').textContent=turn+' wins!';render();return}if(b.every(c=>c)){over=true;sD++;localStorage.setItem('tttD_${id}',sD.toString());document.getElementById('status').textContent='Draw!';render();return}turn=turn==='X'?'O':'X';render()}
function checkWin(p){for(const w of wins)if(w.every(i=>b[i]===p))return w;return null}
function restart(){b=['','','','','','','','',''];turn='X';over=false;render();document.getElementById('status').textContent="X's turn";document.querySelectorAll('.cell').forEach(c=>c.classList.remove('win'))}
function toggleAI(){ai=!ai;document.getElementById('aiBtn').textContent=ai?'🤖 AI On':'🤖 AI Off';restart()}
function aiMove(){const e=b.map((c,i)=>c?'':i).filter(i=>i!==false);if(!e.length)return;let m;for(let i=0;i<9;i++){if(!b[i]){b[i]='O';if(checkWin('O')){b[i]='';m=i;break}b[i]=''}}if(m===undefined){for(let i=0;i<9;i++){if(!b[i]){b[i]='X';if(checkWin('X')){b[i]='';m=i;break}b[i]=''}}}if(m===undefined){m=e[Math.floor(Math.random()*e.length)]}move(m)}
restart()
</script></body></html>`;
}

// --- NEW: Markdown Previewer ---
function generateMarkdownApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#1a1a2e,#16213e);min-height:100vh;padding:1rem;display:flex;align-items:center;justify-content:center}
.card{background:#0f3460;border-radius:16px;padding:1.5rem;width:100%;max-width:900px;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
h1{font-size:1.3rem;margin-bottom:1rem;color:#e94560;text-align:center}
.panes{display:grid;grid-template-columns:1fr 1fr;gap:1rem;height:500px}
.pane{background:#1a1a3e;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.pane-header{padding:0.5rem 1rem;background:rgba(255,255,255,0.04);font-size:0.8rem;color:#8888aa;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid rgba(255,255,255,0.05)}
textarea{flex:1;width:100%;padding:1rem;background:none;border:none;color:#e0e0f0;font-family:'Courier New',monospace;font-size:0.88rem;line-height:1.6;resize:none;outline:none}
.preview{flex:1;padding:1rem;overflow-y:auto;color:#e0e0f0;font-size:0.92rem;line-height:1.6}
.preview h1{color:#fff;font-size:1.5rem;margin:0.5rem 0;text-align:left}
.preview h2{color:#e94560;font-size:1.2rem;margin:0.5rem 0;text-align:left}
.preview h3{color:#fca311;font-size:1rem;margin:0.4rem 0;text-align:left}
.preview p{margin:0.4rem 0}
.preview code{background:rgba(255,255,255,0.06);padding:0.1em 0.3em;border-radius:4px;font-size:0.85em}
.preview pre{background:#12122a;padding:0.8rem;border-radius:8px;overflow-x:auto;margin:0.5rem 0}
.preview pre code{background:none;padding:0}
.preview ul,.preview ol{padding-left:1.5rem;margin:0.4rem 0}
.preview blockquote{border-left:3px solid #e94560;padding-left:1rem;color:#a0a0c0;margin:0.5rem 0}
.preview a{color:#6a82fb}
.preview hr{border:none;border-top:1px solid rgba(255,255,255,0.1);margin:0.8rem 0}
.preview table{width:100%;border-collapse:collapse;margin:0.5rem 0}
.preview th,.preview td{border:1px solid rgba(255,255,255,0.1);padding:0.4rem 0.6rem;text-align:left}
.preview th{background:rgba(255,255,255,0.04)}
.preview img{max-width:100%;border-radius:6px}
</style></head><body><div class="card"><h1>📄 ${escapeHtml(name)}</h1><div class="panes"><div class="pane"><div class="pane-header">Markdown</div><textarea id="mdInput" placeholder="Type Markdown..."># Hello World

This is **bold** and *italic* text.

## Features
- Lists
- **Bold** & *italic*
- \`inline code\`
- \`\`\`
code blocks
\`\`\`
- [Links](https://example.com)

> Blockquote

| Col 1 | Col 2 |
|-------|-------|
| A     | B     |

---

*Created with ♥*</textarea></div><div class="pane"><div class="pane-header">Preview</div><div class="preview" id="preview"></div></div></div></div><script>
const md=document.getElementById('mdInput'),pv=document.getElementById('preview');
function render(){function e(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}const t=md.value;let h=e(t);h=h.replace(/### (.+)/g,'<h3>$1</h3>');h=h.replace(/## (.+)/g,'<h2>$1</h2>');h=h.replace(/# (.+)/g,'<h1>$1</h1>');h=h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');h=h.replace(/\*(.+?)\*/g,'<em>$1</em>');h=h.replace(/```(.+?)```/gs,'<pre><code>$1</code></pre>');h=h.replace(/`(.+?)`/g,'<code>$1</code>');h=h.replace(/!\[(.*?)\]\((.*?)\)/g,'<img src="$2" alt="$1">');h=h.replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2">$1</a>');h=h.replace(/^> (.+)/gm,'<blockquote>$1</blockquote>');h=h.replace(/^\* (.+)/gm,'<li>$1</li>');h=h.replace(/^- (.+)/gm,'<li>$1</li>');h=h.replace(/^\d+\. (.+)/gm,'<li>$1</li>');h=h.replace(/(<li>.*?<\/li>\n?)+/g,'<ul>$&</ul>');h=h.replace(/^---+$/gm,'<hr>');h=h.replace(/\n\n/g,'</p><p>');h='<p>'+h+'</p>';pv.innerHTML=h}
md.addEventListener('input',render);render()
</script></body></html>`;
}

// --- NEW: Unit Converter ---
function generateConverterApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#2d3436,#636e72);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
h1{font-size:1.4rem;margin-bottom:1.2rem;color:#2d3436;text-align:center}
.tabs{display:flex;gap:0.4rem;margin-bottom:1.2rem;flex-wrap:wrap}
.tabs button{padding:0.5rem 0.9rem;border:1px solid #ddd;background:#fafafa;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:0.2s;color:#666}
.tabs button.active{background:#636e72;color:#fff;border-color:#636e72}
.conv{display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem}
.conv input{flex:1;padding:0.8rem 1rem;border:2px solid #e0e0e0;border-radius:10px;font-size:1.1rem;outline:none;min-width:0}
.conv input:focus{border-color:#636e72}
.conv .swap{background:#f0f0f0;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:1.2rem;transition:0.2s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.conv .swap:hover{background:#ddd}
.conv select{padding:0.7rem;border:2px solid #e0e0e0;border-radius:10px;font-size:0.9rem;outline:none;background:#fafafa;min-width:70px}
.formula{text-align:center;font-size:0.85rem;color:#888;margin-top:0.5rem;padding:0.5rem;background:#f8f8f8;border-radius:8px}
.history{max-height:120px;overflow-y:auto;margin-top:0.8rem;border-top:1px solid #eee;padding-top:0.5rem}
.h-item{display:flex;justify-content:space-between;font-size:0.82rem;color:#888;padding:0.2rem 0}
.h-item .val{color:#444;font-weight:600}
</style></head><body><div class="card"><h1>🔄 ${escapeHtml(name)}</h1><div class="tabs" id="tabs"><button class="active" onclick="setCat('length')">Length</button><button onclick="setCat('mass')">Mass</button><button onclick="setCat('temp')">Temp</button><button onclick="setCat('area')">Area</button><button onclick="setCat('volume')">Volume</button><button onclick="setCat('speed')">Speed</button><button onclick="setCat('time')">Time</button><button onclick="setCat('data')">Data</button></div><div class="conv"><input id="val1" type="number" value="1" oninput="conv(1)"><select id="unit1" onchange="conv(1)"></select></div><div class="conv"><button class="swap" onclick="swap()">⇄</button></div><div class="conv"><input id="val2" type="number" value="" oninput="conv(2)"><select id="unit2" onchange="conv(2)"></select></div><div class="formula" id="formula"></div><div class="history" id="history"></div></div><script>
const UNITS={length:{m:1,km:1000,cm:0.01,mm:0.001,mi:1609.344,yd:0.9144,ft:0.3048,in:0.0254},mass:{kg:1,g:0.001,mg:0.000001,lb:0.453592,oz:0.0283495,t:1000},temp:{'°C':'C','°F':'F','K':'K'},area:{m2:1,km2:1000000,cm2:0.0001,ha:10000,ac:4046.86,ft2:0.092903},volume:{L:1,mL:0.001,gal:3.78541,qt:0.946353,pt:0.473176,cup:0.236588,floz:0.0295735,m3:1000},speed:{'m/s':1,'km/h':0.277778,'mph':0.44704,knot:0.514444},time:{s:1,min:60,h:3600,d:86400,week:604800,month:2629800,year:31557600},data:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776}};
let cat='length',h=JSON.parse(localStorage.getItem('conv_${id}'))||[];
const val1=document.getElementById('val1'),val2=document.getElementById('val2'),unit1=document.getElementById('unit1'),unit2=document.getElementById('unit2'),formula=document.getElementById('formula'),hist=document.getElementById('history');
function setCat(c){cat=c;document.querySelectorAll('#tabs button').forEach(b=>b.classList.remove('active'));document.querySelectorAll('#tabs button')[['length','mass','temp','area','volume','speed','time','data'].indexOf(c)].classList.add('active');populateUnits();conv(1)}
function populateUnits(){const units=UNITS[cat];unit1.innerHTML=Object.keys(units).map(u=>'<option value="'+u+'"'+(u===(cat==='temp'?'°C':cat==='mass'?'kg':cat==='length'?'m':cat==='speed'?'m/s':cat==='time'?'min':cat==='data'?'MB':cat==='area'?'m2':cat==='volume'?'L':'')?' selected':'')+'>'+u+'</option>').join('');unit2.innerHTML=unit1.innerHTML}
function swap(){const t=unit1.value;unit1.value=unit2.value;unit2.value=t;conv(1)}
function conv(src){const units=UNITS[cat];const u1=unit1.value,u2=unit2.value;let v=src===1?parseFloat(val1.value):parseFloat(val2.value);if(isNaN(v))return;if(cat==='temp'){let c;if(src===1){if(u1==='°C')c=v;else if(u1==='°F')c=(v-32)*5/9;else c=v-273.15;let r;if(u2==='°C')r=c;else if(u2==='°F')r=c*9/5+32;else r=c+273.15;val2.value=Math.round(r*1000000)/1000000}else{if(u2==='°C')c=v;else if(u2==='°F')c=(v-32)*5/9;else c=v-273.15;let r;if(u1==='°C')r=c;else if(u1==='°F')r=c*9/5+32;else r=c+273.15;val1.value=Math.round(r*1000000)/1000000}formula.textContent='Temperature conversion';return}
if(src===1){const base=v*units[u1];val2.value=Math.round(base/units[u2]*1000000)/1000000}else{const base=v*units[u2];val1.value=Math.round(base/units[u1]*1000000)/1000000}
const f=src===1?\`\${val1.value} \${u1} = \${val2.value} \${u2}\`:\`\${val2.value} \${u2} = \${val1.value} \${u1}\`;formula.textContent=f;if(v){h.unshift({from:u1,to:u2,val:src===1?val1.value:val2.value,res:src===1?val2.value:val1.value,cat});if(h.length>10)h.pop();localStorage.setItem('conv_${id}',JSON.stringify(h));renderHist()}}
function renderHist(){hist.innerHTML=h.slice(0,6).map(x=>'<div class="h-item"><span>'+x.val+' '+x.from+'</span><span class="val">= '+x.res+' '+x.to+'</span></div>').join('')}
populateUnits();conv(1);renderHist()
</script></body></html>`;
}

// --- NEW: Memory Game ---
function generateMemoryApp(name, id) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(name)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.card{background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:2rem;width:100%;max-width:500px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
h1{font-size:1.4rem;margin-bottom:0.5rem;color:#ffd200}
.info{display:flex;justify-content:center;gap:1.5rem;margin-bottom:1rem;font-size:0.9rem;color:#a0a0c0}
.info span{font-weight:700;color:#fff}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.6rem;margin-bottom:1.2rem;max-width:400px;margin-left:auto;margin-right:auto}
.card-m{aspect-ratio:1;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.8rem;transition:transform 0.3s,background 0.3s;color:transparent;user-select:none}
.card-m.flipped{background:rgba(255,255,255,0.1);color:#fff;transform:rotateY(0)}
.card-m.matched{background:rgba(56,239,125,0.2);color:#38ef7d;cursor:default}
.card-m:not(.flipped):not(.matched):hover{transform:scale(1.05)}
.controls{display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap}
.controls button{padding:0.6rem 1.3rem;font-size:0.85rem;font-weight:600;border:none;border-radius:8px;cursor:pointer;transition:transform 0.15s;font-family:inherit}
.controls button:hover{transform:scale(1.05)}
.btn-start{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-hard{background:#333;color:#ccc}
button:disabled{opacity:0.5;cursor:not-allowed;transform:none!important}
</style></head><body><div class="card"><h1>🧠 ${escapeHtml(name)}</h1><div class="info">Moves: <span id="moves">0</span> · Matches: <span id="matches">0</span> · <span id="timer">0:00</span></div><div class="grid" id="grid"></div><div class="controls"><button class="btn-start" onclick="startGame()">🔄 New Game</button><button class="btn-hard" onclick="setHard()" id="hardBtn">4×4</button></div></div><script>
const E=['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐸','🦁','🐯','🐮','🐷','🐵','🐔'];
let cards=[],flipped=[],matched=0,moves=0,locked=false,gridSize=4,timer=0,interval=null,running=false,best=parseInt(localStorage.getItem('mem_${id}')||'999');
function startGame(){clearInterval(interval);running=false;timer=0;document.getElementById('timer').textContent='0:00';const n=gridSize*gridSize/2;cards=[...E.slice(0,n),...E.slice(0,n)];for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}flipped=[];matched=0;moves=0;locked=false;document.getElementById('moves').textContent='0';document.getElementById('matches').textContent='0';render();document.getElementById('hardBtn').textContent=gridSize+'×'+gridSize}
function setHard(){gridSize=gridSize===4?6:4;if(gridSize===6&&cards.length){const n=gridSize*gridSize/2;if(n>E.length)gridSize=4;document.getElementById('hardBtn').textContent=gridSize+'×'+gridSize;startGame()}}
function render(){const g=document.getElementById('grid');g.style.gridTemplateColumns='repeat('+gridSize+',1fr)';g.innerHTML=cards.map((c,i)=>{const f=flipped.includes(i);const m=matched>0&&cards[i]===cards[flipped[0]]&&flipped.includes(i);return '<div class="card-m'+(f||m?' flipped':'')+(m?' matched':'')+'" onclick="flip('+i+')">'+(f||m?c:'')+'</div>'}).join('')}
function flip(i){if(locked||flipped.length>=2||flipped.includes(i)||matched>=cards.length/2)return;if(!running){running=true;interval=setInterval(()=>{timer++;const m=Math.floor(timer/60),s=timer%60;document.getElementById('timer').textContent=m+':'+String(s).padStart(2,'0')},1000)}flipped.push(i);render();if(flipped.length===2){moves++;document.getElementById('moves').textContent=moves;locked=true;const a=flipped[0],b=flipped[1];if(cards[a]===cards[b]){matched++;document.getElementById('matches').textContent=matched;flipped=[];locked=false;if(matched===cards.length/2){clearInterval(interval);if(timer<best){best=timer;localStorage.setItem('mem_${id}',best.toString())}document.getElementById('timer').textContent+=' 🎉'}}else{setTimeout(()=>{flipped=[];locked=false;render()},800)}}}
startGame()
</script></body></html>`;
}

// === Initialize ===
render();