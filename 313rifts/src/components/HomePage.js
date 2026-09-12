import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ArticleViewer from './ArticleViewer';
import LanguageSelector from './LanguageSelector';
import TranslationPanel from './TranslationPanel';
import LoadingSpinner from './LoadingSpinner';
import HistoryPanel from './HistoryPanel';
import SharePanel from './SharePanel';
import { getLanguageName, getLanguageFlag } from '../utils/languageUtils';

const DEFAULT_FEATURED = [
  {
    id: 'f1',
    title: 'Artificial Intelligence',
    summary: 'Explore the capability of computational systems to perform tasks associated with human intelligence, learning, and reasoning.',
    category: 'Technology',
    language: 'en',
    views: 15420
  },
  {
    id: 'f2',
    title: 'Quantum Mechanics',
    summary: 'A fundamental theory in physics that provides a description of the physical properties of nature at subatomic scales.',
    category: 'Science',
    language: 'en',
    views: 12300
  },
  {
    id: 'f3',
    title: 'Leonardo da Vinci',
    summary: 'Polymath of the High Renaissance active as a painter, scientist, engineer, architect, and theorist.',
    category: 'Art & Culture',
    language: 'en',
    views: 18900
  },
  {
    id: 'f4',
    title: 'Climate Change',
    summary: 'Contemporary climate change includes global warming driven by human emissions and resulting weather shifts.',
    category: 'Science',
    language: 'en',
    views: 14200
  },
  {
    id: 'f5',
    title: 'Solar System',
    summary: 'The gravitationally bound system of the Sun and the celestial objects that orbit it.',
    category: 'Astronomy',
    language: 'en',
    views: 16800
  },
  {
    id: 'f6',
    title: 'World War II',
    summary: 'A global conflict that lasted from 1939 to 1945 involving the vast majority of the world\'s countries.',
    category: 'History',
    language: 'en',
    views: 21000
  }
];

const HomePage = (props) => {
  const {
    searchQuery,
    setSearchQuery,
    article,
    setArticle,
    languages,
    setLanguages,
    selectedLanguage,
    setSelectedLanguage,
    isLoading,
    setIsLoading,
    error,
    setError,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    handleArticleSelect,
    handleLanguageChange,
    handleSearchChange,
    handleClearSearch,
    isAuthenticated,
    user,
    popularArticles = []
  } = props;

  const [activeCategory, setActiveCategory] = useState('All');

  const displayArticles = popularArticles && popularArticles.length > 0
    ? popularArticles
    : DEFAULT_FEATURED;

  const categories = ['All', 'Technology', 'Science', 'History', 'Art & Culture'];

  const filteredArticles = activeCategory === 'All'
    ? displayArticles
    : displayArticles.filter(item => {
        const cat = item.category || (item.categories && item.categories[0]) || '';
        return cat.toLowerCase().includes(activeCategory.toLowerCase());
      });

  return (
    <>
      <div className="search-section">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Search Wikipedia articles in any language..."
        />
        
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            <h3 className="results-title">Search Results</h3>
            <div className="results-grid">
              {searchResults.slice(0, 8).map((result, index) => (
                <button
                  key={index}
                  className="result-item"
                  onClick={() => handleArticleSelect(result.title, 'en')}
                >
                  <span className="result-title">{result.title}</span>
                  {result.description && (
                    <span className="result-description">{result.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleClearSearch} className="btn btn-secondary">
            Clear & Try Again
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <LoadingSpinner size={60} />
          <p className="loading-text">Loading article...</p>
        </div>
      )}

      {article && !isLoading && (
        <div className="article-section">
          <div className="article-header">
            <div className="article-title-section">
              <h2 className="article-title">{article.title}</h2>
              <div className="article-meta">
                <span className="language-badge">
                  <span className="language-flag">{getLanguageFlag(selectedLanguage)}</span>
                  <span>{getLanguageName(selectedLanguage)}</span>
                </span>
                <span className="article-updated">
                  Last updated: {article.timestamp ? new Date(article.timestamp).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
            
            <div className="article-controls">
              <LanguageSelector
                languages={languages}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                currentArticle={article}
              />
              <SharePanel article={article} selectedLanguage={selectedLanguage} />
            </div>
          </div>

          <div className="content-grid">
            <div className="article-content">
              <ArticleViewer article={article} />
            </div>
            
            <div className="translation-sidebar">
              <TranslationPanel
                languages={languages}
                selectedLanguage={selectedLanguage}
                onLanguageSelect={handleLanguageChange}
                articleTitle={article.title}
              />
              {isAuthenticated && <HistoryPanel article={article} selectedLanguage={selectedLanguage} />}
            </div>
          </div>
        </div>
      )}

      {!article && !isLoading && !error && !showSearchResults && (
        <div className="home-dashboard">
          {/* Hero Banner */}
          <div className="hero-banner">
            <div className="hero-content">
              <span className="hero-tag">🌐 Wikipedia Multilingual Explorer</span>
              <h2 className="hero-title">Explore Articles Across Languages</h2>
              <p className="hero-subtitle">
                Read, translate, and cross-reference millions of Wikipedia articles in over 300 languages.
              </p>
            </div>
          </div>

          {/* Featured & Popular Articles Section */}
          <div className="articles-container-section">
            <div className="section-header-row">
              <div>
                <h3 className="section-title">Featured Articles</h3>
                <p className="section-subtitle">Select an article below to instantly load and translate</p>
              </div>

              <div className="category-tabs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="article-cards-grid">
              {filteredArticles.map((item, idx) => (
                <div 
                  key={item.id || item._id || idx} 
                  className="article-card"
                  onClick={() => handleArticleSelect(item.title, item.language || 'en')}
                >
                  {item.thumbnail ? (
                    <div className="card-image-wrapper">
                      <img src={item.thumbnail} alt={item.title} className="card-image" />
                    </div>
                  ) : (
                    <div className="card-image-placeholder">
                      <span className="placeholder-icon">📚</span>
                    </div>
                  )}

                  <div className="card-body">
                    <div className="card-badges">
                      <span className="badge category-badge">
                        {item.category || (item.categories && item.categories[0]) || 'General'}
                      </span>
                      <span className="badge lang-badge">
                        {(item.language || 'en').toUpperCase()}
                      </span>
                    </div>

                    <h4 className="card-title">{item.title}</h4>
                    <p className="card-summary">{item.summary || 'Click to view the full article and explore translations.'}</p>

                    <div className="card-footer">
                      <span className="card-views">
                        👁️ {(item.pageViews || item.views || 1000).toLocaleString()} reads
                      </span>
                      <button className="btn-read-now">Read Article →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Features List */}
          <div className="features-banner">
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <div>
                <h5>Cross-Language Translation</h5>
                <p>Switch between 300+ language editions of Wikipedia seamlessly</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <div>
                <h5>Reading History & Favorites</h5>
                <p>Save favorite articles and track reading stats with your backend account</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h5>Instant Wikipedia Search</h5>
                <p>Real-time fuzzy search with live article extraction and previews</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;