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

// State
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// Initialize
init();

function init() {
  fetchRandomArticles(6);
  setupEventListeners();
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.trim();
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      fetchRandomArticles(6);
      return;
    }

    searchTimeout = setTimeout(() => {
      searchWikipedia(query);
    }, 500);
  });

  backBtn.addEventListener('click', () => {
    landingView.classList.remove('hidden');
    articleView.classList.add('hidden');
    window.scrollTo(0, 0);
  });

  logo.addEventListener('click', () => {
    searchInput.value = '';
    fetchRandomArticles(6);
    landingView.classList.remove('hidden');
    articleView.classList.add('hidden');
    window.scrollTo(0, 0);
  });
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
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${article.thumbnail ? `<img src="${article.thumbnail.source}" alt="${article.title}" loading="lazy">` : '<div class="skeleton" style="width:100%; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; background:#222; color:#555;">No Image</div>'}
      <div class="card-body">
        <h3>${article.displaytitle || article.title}</h3>
        <p>${article.extract || 'No summary available.'}</p>
      </div>
    `;
    card.onclick = () => {
      console.log('Card clicked:', article.title);
      showArticle(article);
    };
    resultsGrid.appendChild(card);
  });
}

async function showArticle(article: WikiSummary) {
  if (!article) return;
  
  // Transition to article view
  landingView.classList.add('hidden');
  articleView.classList.remove('hidden');
  window.scrollTo(0, 0);

  // Initial render with summary data (Immediate feedback)
  const renderInitial = () => {
    articleContainer.innerHTML = `
      <div class="article-header">
        <h1>${article.displaytitle || article.title}</h1>
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
