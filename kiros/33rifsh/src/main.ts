import './style.css'

interface WikiSummary {
  title: string;
  displaytitle: string;
  thumbnail?: { source: string };
  extract: string;
  content_urls: { desktop: { page: string } };
}

interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

const ACTION_API = 'https://en.wikipedia.org/w/api.php';

// Selectors
const searchInput = document.getElementById('search') as HTMLInputElement;
const resultsGrid = document.getElementById('featured-results') as HTMLDivElement;
const landingView = document.getElementById('landing-view') as HTMLElement;
const articleView = document.getElementById('article-view') as HTMLElement;
const articleContainer = document.getElementById('article-container') as HTMLDivElement;
const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
const logo = document.querySelector('.logo') as HTMLElement;

// New selectors
const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
const favoritesBtn = document.getElementById('favorites-btn') as HTMLButtonElement;
const historyBtn = document.getElementById('history-btn') as HTMLButtonElement;
const searchSuggestions = document.getElementById('search-suggestions') as HTMLDivElement;
const favoritesView = document.getElementById('favorites-view') as HTMLElement;
const historyView = document.getElementById('history-view') as HTMLElement;
const favoritesGrid = document.getElementById('favorites-grid') as HTMLDivElement;
const historyGrid = document.getElementById('history-grid') as HTMLDivElement;
const backFromFavorites = document.getElementById('back-from-favorites') as HTMLButtonElement;
const backFromHistory = document.getElementById('back-from-history') as HTMLButtonElement;

// State
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
let favorites: WikiSummary[] = JSON.parse(localStorage.getItem('3rifts-favorites') || '[]');
let history: WikiSummary[] = JSON.parse(localStorage.getItem('3rifts-history') || '[]');

// Initialize
init();

function init() {
  fetchRandomArticles(6);
  setupEventListeners();
  loadFavorites();
  loadHistory();
  applyTheme();
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.trim();
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      fetchRandomArticles(6);
      hideSuggestions();
      return;
    }

    searchTimeout = setTimeout(() => {
      searchWikipedia(query);
      fetchSearchSuggestions(query);
    }, 500);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length >= 2) {
      fetchSearchSuggestions(searchInput.value);
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchSuggestions.contains(e.target as Node) && e.target !== searchInput) {
      hideSuggestions();
    }
  });

  backBtn.addEventListener('click', () => {
    showLandingView();
  });

  logo.addEventListener('click', () => {
    searchInput.value = '';
    fetchRandomArticles(6);
    showLandingView();
  });

  themeToggle.addEventListener('click', toggleTheme);
  favoritesBtn.addEventListener('click', showFavoritesView);
  historyBtn.addEventListener('click', showHistoryView);
  backFromFavorites.addEventListener('click', showLandingView);
  backFromHistory.addEventListener('click', showLandingView);
}

function showLandingView() {
  landingView.classList.remove('hidden');
  articleView.classList.add('hidden');
  favoritesView.classList.add('hidden');
  historyView.classList.add('hidden');
  window.scrollTo(0, 0);
}

function showFavoritesView() {
  landingView.classList.add('hidden');
  articleView.classList.add('hidden');
  favoritesView.classList.remove('hidden');
  historyView.classList.add('hidden');
  renderFavorites();
  window.scrollTo(0, 0);
}

function showHistoryView() {
  landingView.classList.add('hidden');
  articleView.classList.add('hidden');
  favoritesView.classList.add('hidden');
  historyView.classList.remove('hidden');
  renderHistory();
  window.scrollTo(0, 0);
}

// Fetch 6 random summaries using Action API for CORS compatibility
async function fetchRandomArticles(count: number) {
  resultsGrid.innerHTML = Array(count).fill(0).map(() => `
    <div class="card skeleton" style="height: 350px;"></div>
  `).join('');

  try {
     // For random articles, we'll use action=query with list=random
     const randomRes = await fetch(`${ACTION_API}?action=query&list=random&rnlimit=${count}&rnnamespace=0&format=json&origin=*`);
     const randomData = await randomRes.json();
     const titles = randomData.query.random.map((r: any) => r.title);
     
     // Fetch extracts and images for these titles
     const articles = await fetchDetailedSummaries(titles);
     renderCards(articles);
  } catch (err) {
    console.error('Error fetching random articles:', err);
    resultsGrid.innerHTML = '<p>Something went wrong. Please check your connection.</p>';
  }
}

async function fetchDetailedSummaries(titles: string[]): Promise<WikiSummary[]> {
  const titlesParam = encodeURIComponent(titles.join('|'));
  const res = await fetch(`${ACTION_API}?action=query&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&titles=${titlesParam}&format=json&pithumbsize=500&origin=*`);
  const data = await res.json();
  const pages = data.query.pages;
  
  return Object.values(pages).map((p: any) => ({
    title: p.title,
    displaytitle: p.title,
    thumbnail: p.thumbnail ? { source: p.thumbnail.source } : undefined,
    extract: p.extract,
    content_urls: { desktop: { page: p.fullurl } }
  })) as WikiSummary[];
}

// Search Wikipedia with CORS compatibility
async function searchWikipedia(query: string) {
  resultsGrid.innerHTML = Array(6).fill(0).map(() => `
    <div class="card skeleton" style="height: 350px;"></div>
  `).join('');

  try {
    const res = await fetch(`${ACTION_API}?action=query&list=search&srsearch=${query}&format=json&origin=*`);
    const data = await res.json();
    const results: WikiSearchResult[] = data.query.search;
    const titles = results.slice(0, 6).map(r => r.title);
    
    const detailedArticles = await fetchDetailedSummaries(titles);
    renderCards(detailedArticles);
  } catch (err) {
    console.error('Search error:', err);
    resultsGrid.innerHTML = '<p>No results found or search failed.</p>';
  }
}

function renderCards(articles: WikiSummary[]) {
  console.log('Rendering cards:', articles);
  resultsGrid.innerHTML = '';
  if (!articles || articles.length === 0) {
    resultsGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No articles found. Try a different search.</p>';
    return;
  }

  articles.forEach(article => {
    const card = createArticleCard(article);
    resultsGrid.appendChild(card);
  });
}

function createArticleCard(article: WikiSummary): HTMLDivElement {
  const isFavorite = favorites.some(fav => fav.title === article.title);
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-title="${article.title}">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
    ${article.thumbnail ? `<img src="${article.thumbnail.source}" alt="${article.title}" loading="lazy">` : '<div class="skeleton" style="width:100%; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; background:#222; color:#555;">No Image</div>'}
    <div class="card-body">
      <h3>${article.displaytitle || article.title}</h3>
      <p>${article.extract || 'No summary available.'}</p>
    </div>
  `;
  
  card.onclick = (e) => {
    // Don't trigger if clicking the favorite button
    if ((e.target as HTMLElement).closest('.favorite-btn')) {
      return;
    }
    console.log('Card clicked:', article.title);
    showArticle(article);
  };

  const favoriteBtn = card.querySelector('.favorite-btn') as HTMLButtonElement;
  favoriteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(article);
    favoriteBtn.classList.toggle('favorited');
    const svg = favoriteBtn.querySelector('svg') as SVGElement;
    if (favoriteBtn.classList.contains('favorited')) {
      svg.setAttribute('fill', 'currentColor');
    } else {
      svg.setAttribute('fill', 'none');
    }
  });

  return card;
}

async function showArticle(article: WikiSummary) {
  if (!article) return;
  
  addToHistory(article);
  
  // Transition to article view
  landingView.classList.add('hidden');
  articleView.classList.remove('hidden');
  window.scrollTo(0, 0);

  const isFavorite = favorites.some(fav => fav.title === article.title);
  
  // Initial render with summary data (Immediate feedback)
  const renderInitial = () => {
    articleContainer.innerHTML = `
      <div class="article-header">
        <h1>${article.displaytitle || article.title}</h1>
      </div>
      <div class="article-actions">
        <button id="favorite-article-btn" class="action-btn ${isFavorite ? 'favorited' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
        <a href="${article.content_urls?.desktop?.page || '#'}" target="_blank" class="action-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Open on Wikipedia
        </a>
        <button id="share-article-btn" class="action-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
      </div>
      ${article.thumbnail ? `<img src="${article.thumbnail.source}" class="article-banner" onerror="this.style.display='none'">` : ''}
      <div class="article-content">
        <div class="summary-text" style="font-size: 1.4rem; font-style: italic; color: #ccc; margin-bottom: 2rem;">
          ${(article.extract || '').split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>
        <div id="full-content-loading" class="skeleton" style="height: 100px; margin-top: 2rem;"></div>
        <div id="full-content"></div>
        <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 3rem 0;">
        <p style="color: var(--text-secondary); text-align: center;">
          Source: <a href="${article.content_urls?.desktop?.page || '#'}" target="_blank" style="color: var(--accent-color);">Wikipedia</a>
        </p>
      </div>
    `;
    
    // Add event listeners for article action buttons
    const favoriteBtn = document.getElementById('favorite-article-btn') as HTMLButtonElement;
    const shareBtn = document.getElementById('share-article-btn') as HTMLButtonElement;
    
    favoriteBtn.addEventListener('click', () => {
      toggleFavorite(article);
      favoriteBtn.classList.toggle('favorited');
      const svg = favoriteBtn.querySelector('svg') as SVGElement;
      if (favoriteBtn.classList.contains('favorited')) {
        svg.setAttribute('fill', 'currentColor');
        favoriteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Remove from Favorites
        `;
      } else {
        svg.setAttribute('fill', 'none');
        favoriteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Add to Favorites
        `;
      }
    });
    
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.extract.substring(0, 100) + '...',
          url: article.content_urls?.desktop?.page || window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(article.content_urls?.desktop?.page || window.location.href)
          .then(() => {
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              shareBtn.innerHTML = originalText;
            }, 2000);
          });
      }
    });
  };

  renderInitial();

  // Fetch full HTML content via action=parse (CORS compatible)
  try {
    const res = await fetch(`${ACTION_API}?action=parse&page=${encodeURIComponent(article.title)}&format=json&origin=*&prop=text`);
    if (!res.ok) throw new Error('API request failed');
    
    const data = await res.json();
    const loadingEl = document.getElementById('full-content-loading');
    const fullContentEl = document.getElementById('full-content');

    if (loadingEl) loadingEl.style.display = 'none';

    if (data.parse && data.parse.text && fullContentEl) {
      // The parsed text contains absolute links and some unwanted elements
      // We'll clean it up briefly and style it via CSS
      fullContentEl.innerHTML = `
        <div class="wiki-parsed-content">
          ${data.parse.text['*']}
        </div>
      `;
      
      // Post-process: ensure all links open in new tab
      fullContentEl.querySelectorAll('a').forEach(a => {
        if (a.getAttribute('href')?.startsWith('/wiki/')) {
          a.setAttribute('href', `https://en.wikipedia.org${a.getAttribute('href')}`);
        }
        a.setAttribute('target', '_blank');
      });
    }
  } catch (err) {
    console.error('Error fetching full content:', err);
    const loadingEl = document.getElementById('full-content-loading');
    if (loadingEl) loadingEl.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Full content loading unavailable in this view.</p>';
  }
}

// Theme Functions
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('3rifts-theme', isLight ? 'light' : 'dark');
}

function applyTheme() {
  const savedTheme = localStorage.getItem('3rifts-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
}

// Favorites Functions
function toggleFavorite(article: WikiSummary) {
  const index = favorites.findIndex(fav => fav.title === article.title);
  if (index === -1) {
    favorites.push(article);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem('3rifts-favorites', JSON.stringify(favorites));
  loadFavorites();
}

function loadFavorites() {
  favorites = JSON.parse(localStorage.getItem('3rifts-favorites') || '[]');
}

function renderFavorites() {
  favoritesGrid.innerHTML = '';
  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h3>No favorites yet</h3>
        <p>Click the heart icon on articles to add them here</p>
      </div>
    `;
    return;
  }
  
  favorites.forEach(article => {
    const card = createArticleCard(article);
    favoritesGrid.appendChild(card);
  });
}

// History Functions
function addToHistory(article: WikiSummary) {
  // Remove if already exists (to move to front)
  const index = history.findIndex(item => item.title === article.title);
  if (index !== -1) {
    history.splice(index, 1);
  }
  
  // Add to beginning (most recent first)
  history.unshift(article);
  
  // Keep only last 20 items
  if (history.length > 20) {
    history = history.slice(0, 20);
  }
  
  localStorage.setItem('3rifts-history', JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  history = JSON.parse(localStorage.getItem('3rifts-history') || '[]');
}

function renderHistory() {
  historyGrid.innerHTML = '';
  if (history.length === 0) {
    historyGrid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <h3>No history yet</h3>
        <p>Articles you view will appear here</p>
      </div>
    `;
    return;
  }
  
  history.forEach(article => {
    const card = createArticleCard(article);
    historyGrid.appendChild(card);
  });
}

// Search Suggestions
async function fetchSearchSuggestions(query: string) {
  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  try {
    const res = await fetch(`${ACTION_API}?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json&origin=*`);
    const data = await res.json();
    const suggestions = data[1]; // Array of titles
    const descriptions = data[2]; // Array of descriptions
    
    showSuggestions(suggestions, descriptions, query);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    hideSuggestions();
  }
}

function showSuggestions(suggestions: string[], descriptions: string[], query: string) {
  searchSuggestions.innerHTML = '';
  searchSuggestions.classList.remove('hidden');
  
  if (suggestions.length === 0) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = 'No suggestions found';
    searchSuggestions.appendChild(item);
    return;
  }
  
  suggestions.forEach((suggestion, index) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    
    // Highlight the matching part of the query
    const lowerSuggestion = suggestion.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerSuggestion.indexOf(lowerQuery);
    
    let highlightedSuggestion = suggestion;
    if (matchIndex !== -1) {
      highlightedSuggestion = 
        suggestion.substring(0, matchIndex) +
        '<strong>' + suggestion.substring(matchIndex, matchIndex + query.length) + '</strong>' +
        suggestion.substring(matchIndex + query.length);
    }
    
    item.innerHTML = `
      <div style="font-weight: 500; margin-bottom: 0.25rem;">${highlightedSuggestion}</div>
      <div style="font-size: 0.9rem; color: var(--text-secondary);">${descriptions[index] || 'No description'}</div>
    `;
    
    item.onclick = () => {
      searchInput.value = suggestion;
      searchWikipedia(suggestion);
      hideSuggestions();
    };
    
    searchSuggestions.appendChild(item);
  });
}

function hideSuggestions() {
  searchSuggestions.classList.add('hidden');
}