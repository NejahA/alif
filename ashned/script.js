const GITHUB_USER = 'NejahA';
const API_BASE = 'https://api.github.com';

// ─── DOM refs ──────────────────────────────────────
const $ = (id) => document.getElementById(id);

const avatarEl       = $('avatar');
const nameEl         = $('name');
const bioEl          = $('bio');
const reposCountEl   = $('repos-count');
const followersEl    = $('followers-count');
const followingEl    = $('following-count');
const githubLink     = $('github-link');
const websiteLink    = $('website-link');
const repoTotalEl    = $('repo-total');
const reposGrid      = $('repos-grid');
const contribEl      = $('contributions');

// ─── Project type icons ────────────────────────────
const PROJECT_ICONS = {
  flutter:   '📱',
  flutters:  '📱',
  dart:      '🎯',
  react:     '⚛️',
  vue:       '💚',
  angular:   '🅰️',
  python:    '🐍',
  javascript:'🟨',
  typescript:'🔷',
  go:        '🔵',
  rust:      '🦀',
  java:      '☕',
  kotlin:    '🟣',
  swift:     '🟠',
  cpp:       '⚡',
  c:         '🔧',
  ruby:      '💎',
  php:       '🐘',
  html:      '🌐',
  css:       '🎨',
  node:      '💚',
  next:      '▲',
  vite:      '⚡',
  web:       '🌐',
  app:       '📲',
  cli:       '💻',
  api:       '🔌',
  extension: '🧩',
  ai:        '🤖',
  ml:        '🧠',
  data:      '📊',
  game:      '🎮',
  tool:      '🛠️',
  ui:        '🎭',
  server:    '🖥️',
  bot:       '🤖',
  chrome:    '🌍',
  firefox:   '🦊',
  vscode:    '💻',
  electron:  '⚛️',
  desktop:   '🖥️',
  mobile:    '📱',
  backend:   '🔙',
  frontend:  '🎨',
  fullstack: '🌐',
  extension: '🧩',
  plugin:    '🔌',
  theme:     '🎨',
};

function detectProjectIcon(repo) {
  const name = repo.name.toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const lang = (repo.language || '').toLowerCase();
  const text = `${name} ${desc} ${topics.join(' ')} ${lang}`;

  // Check for specific frameworks/tools first
  if (text.includes('flutter') || text.includes('dart')) return '📱';
  if (text.includes('react') || text.includes('next') || text.includes('vite')) return '⚛️';
  if (text.includes('vue')) return '💚';
  if (text.includes('electron')) return '⚛️';
  if (text.includes('ai') || text.includes('machine learn') || text.includes('neural')) return '🤖';
  if (text.includes('cli') || text.includes('terminal')) return '💻';
  if (text.includes('extension') || text.includes('plugin')) return '🧩';
  if (text.includes('api') || text.includes('server') || text.includes('backend')) return '🔌';
  if (text.includes('game') || text.includes('play')) return '🎮';
  if (text.includes('bot')) return '🤖';
  if (text.includes('theme') || text.includes('ui') || text.includes('design')) return '🎨';
  if (text.includes('python')) return '🐍';
  if (text.includes('rust')) return '🦀';
  if (text.includes('go') && name === 'go') return '🔵';
  if (text.includes('desktop') || text.includes('windows') || text.includes('macos')) return '🖥️';
  if (text.includes('web') || text.includes('site') || text.includes('page')) return '🌐';
  if (text.includes('tool') || text.includes('util')) return '🛠️';
  if (text.includes('data') || text.includes('analytics')) return '📊';

  // Fallback by language
  const langIcons = {
    dart: '🎯', javascript: '🟨', typescript: '🔷', python: '🐍',
    go: '🔵', rust: '🦀', java: '☕', kotlin: '🟣',
    swift: '🟠', ruby: '💎', php: '🐘', c: '🔧',
    'c++': '⚡', 'c#': '🎯', html: '🌐', css: '🎨',
  };
  return langIcons[lang] || '📁';
}

// ─── Helpers ───────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} KB`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} GB`;
}

function langColor(lang) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Dart: '#00B4AB',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Shell: '#89e051',
    C: '#555555',
    'C++': '#f34b7d',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Lua: '#000080',
    Vue: '#41b883',
  };
  return colors[lang] || '#8b949e';
}

function langGradient(lang) {
  const c = langColor(lang);
  return `linear-gradient(135deg, ${c}22 0%, transparent 60%)`;
}

function setLoading(el, loading = true) {
  if (loading) {
    el.innerHTML = '<div class="loading">Loading…</div>';
  }
}

function setError(el, msg = 'Something went wrong.') {
  el.innerHTML = `<div class="error-state">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    <p>${msg}</p>
  </div>`;
}

function setEmpty(el, msg = 'Nothing here yet.') {
  el.innerHTML = `<div class="empty-state">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    <p>${msg}</p>
  </div>`;
}

// ─── Fetch helpers ─────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

// ─── Profile ───────────────────────────────────────
async function loadProfile() {
  const user = await fetchJSON(`${API_BASE}/users/${GITHUB_USER}`);
  avatarEl.src = user.avatar_url + '&s=280';
  avatarEl.alt = user.login;
  nameEl.textContent = user.name || user.login;
  bioEl.textContent = user.bio || '';
  reposCountEl.textContent = user.public_repos;
  followersEl.textContent = user.followers;
  followingEl.textContent = user.following;

  if (user.blog) {
    websiteLink.href = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
    websiteLink.style.display = 'inline-flex';
  } else {
    websiteLink.style.display = 'none';
  }
}

// ─── Repos ─────────────────────────────────────────
async function loadRepos() {
  const repos = await fetchJSON(
    `${API_BASE}/users/${GITHUB_USER}/repos?per_page=100&sort=updated&type=owner`
  );

  const filtered = repos.filter(r => !r.fork && !r.archived);
  repoTotalEl.textContent = filtered.length;

  if (filtered.length === 0) {
    setEmpty(reposGrid, 'No public repositories yet.');
    return;
  }

  reposGrid.innerHTML = filtered
    .map(r => {
      const name = r.name;
      const desc = r.description || '';
      const lang = r.language;
      const stars = r.stargazers_count;
      const forks = r.forks_count;
      const issues = r.open_issues_count;
      const size = r.size; // KB
      const license = r.license;
      const topics = r.topics || [];
      const updated = formatDate(r.updated_at);
      const icon = detectProjectIcon(r);
      const gradient = lang ? langGradient(lang) : '';

      // Topics as badges
      const topicBadges = topics
        .slice(0, 4)
        .map(t => `<span class="topic-badge">${t}</span>`)
        .join('');

      // License badge
      const licenseBadge = license
        ? `<span class="license-badge" title="${license.spdx_id || license.key}">${license.spdx_id || license.key}</span>`
        : '';

      // Size
      const sizeLabel = size > 0 ? formatSize(size * 1024) : '';

      return `
        <div class="repo-card" style="${gradient ? `background-image: ${gradient};` : ''}" data-lang="${lang || ''}">
          <div class="repo-card-inner">
            <div class="repo-top-row">
              <span class="repo-icon">${icon}</span>
              <h3><a href="${r.html_url}" target="_blank" rel="noopener">${name}</a></h3>
            </div>
            <p class="repo-desc">${desc || '<span class="no-desc">No description provided</span>'}</p>
            
            ${topicBadges ? `<div class="topic-badges">${topicBadges}${topics.length > 4 ? `<span class="topic-badge more">+${topics.length - 4}</span>` : ''}</div>` : ''}
            
            <div class="repo-meta">
              <div class="meta-left">
                ${lang ? `<span class="lang"><span class="lang-dot" style="background:${langColor(lang)}"></span>${lang}</span>` : ''}
                <span class="stars" title="Stars">★ ${stars}</span>
                <span class="forks" title="Forks">⑂ ${forks}</span>
                ${issues > 0 ? `<span class="issues" title="Open issues">◉ ${issues}</span>` : ''}
              </div>
              <div class="meta-right">
                ${licenseBadge}
                ${sizeLabel ? `<span class="size-badge">${sizeLabel}</span>` : ''}
              </div>
            </div>

            ${lang ? `
              <div class="lang-bar-wrapper">
                <div class="lang-bar">
                  <div class="lang-bar-fill" style="width:100%;background:${langColor(lang)}"></div>
                </div>
              </div>
            ` : ''}

            <div class="repo-footer">
              <span class="updated">Updated ${updated}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// ─── Contributions (GitHub GraphQL — public only via events) ──
async function loadContributions() {
  // GitHub's public events API is not great for full contribution grids.
  // Instead, we use the public events to build a rough heatmap.
  const events = await fetchJSON(
    `${API_BASE}/users/${GITHUB_USER}/events/public?per_page=100`
  );

  // Count events per day for the last ~90 days
  const today = new Date();
  const map = new Map();

  events.forEach(e => {
    const day = e.created_at.slice(0, 10);
    map.set(day, (map.get(day) || 0) + 1);
  });

  // Build grid: 7 rows (days of week), ~13 columns (weeks)
  let html = '<div class="contribution-grid">';

  const start = new Date(today);
  start.setDate(start.getDate() - 90);
  // align to Sunday
  start.setDate(start.getDate() - start.getDay());

  for (let row = 0; row < 7; row++) {
    html += '<div class="contribution-row">';
    for (let col = 0; col < 13; col++) {
      const d = new Date(start);
      d.setDate(d.getDate() + col * 7 + row);
      const key = d.toISOString().slice(0, 10);
      const count = map.get(key) || 0;
      let level = 0;
      if (count > 0) level = count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      const title = `${key}: ${count} event${count !== 1 ? 's' : ''}`;
      html += `<span class="contribution-cell level-${level}" title="${title}"></span>`;
    }
    html += '</div>';
  }

  html += '</div>';
  contribEl.innerHTML = html;
}

// ─── Init ──────────────────────────────────────────
async function init() {
  try {
    await loadProfile();
  } catch (e) {
    console.error('Profile load failed:', e);
  }

  try {
    await loadRepos();
  } catch (e) {
    console.error('Repos load failed:', e);
    setError(reposGrid, 'Failed to load repositories.');
  }

  try {
    await loadContributions();
  } catch (e) {
    console.error('Contributions load failed:', e);
    setError(contribEl, 'Failed to load contributions.');
  }
}

init();