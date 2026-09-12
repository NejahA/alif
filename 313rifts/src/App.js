import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// Existing Wikipedia components
import SearchBar from './components/SearchBar';
import ArticleViewer from './components/ArticleViewer';
import LanguageSelector from './components/LanguageSelector';
import TranslationPanel from './components/TranslationPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchWikipediaArticle, fetchArticleLanguages, searchWikipediaArticles } from './services/wikipediaApi';
import { getLanguageName, getLanguageFlag } from './utils/languageUtils';

// New Authentication components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { authService } from './services/auth';
import { articleService } from './services/api';

// New Feature Components
import ThemeToggle from './components/ThemeToggle';
import HistoryPanel from './components/HistoryPanel';
import SharePanel from './components/SharePanel';
import Profile from './components/Profile';
import HistoryPage from './components/HistoryPage';
import HomePage from './components/HomePage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [article, setArticle] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());
  const [popularArticles, setPopularArticles] = useState([]);

  // Fetch popular articles from backend on mount
  useEffect(() => {
    const loadPopular = async () => {
      try {
        const data = await articleService.getPopular({ limit: 12 });
        if (data && data.articles) {
          setPopularArticles(data.articles);
        }
      } catch (err) {
        console.warn('Could not fetch popular articles from backend:', err);
      }
    };
    loadPopular();
  }, []);

  // Fetch article when search query changes
  useEffect(() => {
    const fetchArticle = async () => {
      if (!searchQuery.trim()) return;
      
      setIsLoading(true);
      setError(null);
      setShowSearchResults(false);
      
      try {
        // First, search for articles to get suggestions
        const results = await searchWikipediaArticles(searchQuery);
        if (results.length > 0) {
          setSearchResults(results);
          setShowSearchResults(true);
        } else {
          setError('No articles found. Please try a different search term.');
        }
      } catch (err) {
        setError(`Failed to search articles: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchArticle();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle article selection from search results or featured cards
  const handleArticleSelect = async (title, lang = 'en') => {
    setIsLoading(true);
    setError(null);
    setShowSearchResults(false);
    setSelectedLanguage(lang);
    
    try {
      // Fetch the article content
      const articleData = await fetchWikipediaArticle(title, lang);
      setArticle(articleData);
      
      // Fetch available languages for this article
      const languageData = await fetchArticleLanguages(title);
      setLanguages(languageData);

      // Sync article with backend asynchronously
      articleService.syncArticle(articleData).catch(e => console.warn(e));
      
    } catch (err) {
      setError(`Failed to load article: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = async (langCode) => {
    if (!article) return;
    
    setIsLoading(true);
    setSelectedLanguage(langCode);
    
    try {
      const articleData = await fetchWikipediaArticle(article.title, langCode);
      setArticle(articleData);
    } catch (err) {
      setError(`Failed to load article in ${getLanguageName(langCode)}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setArticle(null);
    setLanguages([]);
    setSearchResults([]);
    setShowSearchResults(false);
    setError(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div className="header-title">
                <h1><Link to="/" className="header-link">313rifts</Link></h1>
                <span className="subtitle">Wikipedia Article Translator</span>
              </div>
              <p className="header-description">
                Explore Wikipedia articles across all available languages
              </p>
              
              <div className="header-controls">
                <nav className="main-nav">
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/history" className="nav-link">History</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                  {isAuthenticated ? (
                    <button 
                      className="nav-link btn-logout"
                      onClick={() => {
                        authService.logout();
                        setIsAuthenticated(false);
                        setUser(null);
                      }}
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="nav-link">Login</Link>
                      <Link to="/register" className="nav-link">Register</Link>
                    </>
                  )}
                </nav>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                article={article}
                setArticle={setArticle}
                languages={languages}
                setLanguages={setLanguages}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                showSearchResults={showSearchResults}
                setShowSearchResults={setShowSearchResults}
                handleArticleSelect={handleArticleSelect}
                handleLanguageChange={handleLanguageChange}
                handleSearchChange={handleSearchChange}
                handleClearSearch={handleClearSearch}
                isAuthenticated={isAuthenticated}
                user={user}
                popularArticles={popularArticles}
              />} />
              
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} />
              <Route path="/login" element={<Login 
                onLoginSuccess={() => {
                  setIsAuthenticated(true);
                  setUser(authService.getCurrentUser());
                }}
              />} />
              <Route path="/register" element={<Register 
                onRegisterSuccess={() => {
                  setIsAuthenticated(true);
                  setUser(authService.getCurrentUser());
                }}
              />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <div className="footer-content">
              <p className="footer-text">
                313rifts - Wikipedia Article Translator • Built with React • Uses Wikipedia API
              </p>
              <p className="footer-links">
                <a href="https://en.wikipedia.org/wiki/Wikipedia:API" target="_blank" rel="noopener noreferrer">
                  Wikipedia API Docs
                </a>
                <span className="separator">•</span>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;