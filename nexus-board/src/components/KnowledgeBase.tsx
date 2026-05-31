import { useState } from 'react';

interface KnowledgeBaseProps {
  onSearch: (query: string) => void;
  onArticleSelect: (articleId: string) => void;
}

const KnowledgeBase = ({ onSearch, onArticleSelect }: KnowledgeBaseProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'getting-started' | 'features' | 'troubleshooting' | 'api'>('all');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  
  const categories = [
    { id: 'all', name: 'All Articles', icon: '📚', count: 24 },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀', count: 8 },
    { id: 'features', name: 'Features', icon: '✨', count: 10 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧', count: 4 },
    { id: 'api', name: 'API & Integration', icon: '🔌', count: 2 },
  ];
  
  const articles = [
    {
      id: 'article-1',
      title: 'Getting Started with Nextus',
      category: 'getting-started',
      description: 'Learn how to set up your account, create your first project, and invite team members.',
      readTime: '5 min',
      popularity: 'high',
      tags: ['onboarding', 'basics', 'setup']
    },
    {
      id: 'article-2',
      title: 'Task Management Best Practices',
      category: 'features',
      description: 'Learn how to effectively manage tasks, set priorities, and track progress.',
      readTime: '8 min',
      popularity: 'high',
      tags: ['tasks', 'productivity', 'workflow']
    },
    {
      id: 'article-3',
      title: 'Using the Calendar View',
      category: 'features',
      description: 'Master the calendar view for scheduling tasks and tracking deadlines.',
      readTime: '6 min',
      popularity: 'medium',
      tags: ['calendar', 'scheduling', 'deadlines']
    },
    {
      id: 'article-4',
      title: 'Troubleshooting Common Issues',
      category: 'troubleshooting',
      description: 'Solutions for common problems like sync issues, missing data, and performance.',
      readTime: '10 min',
      popularity: 'medium',
      tags: ['help', 'issues', 'support']
    },
    {
      id: 'article-5',
      title: 'API Integration Guide',
      category: 'api',
      description: 'Learn how to integrate Nextus with your existing tools using our API.',
      readTime: '15 min',
      popularity: 'low',
      tags: ['api', 'integration', 'developers']
    },
    {
      id: 'article-6',
      title: 'Team Collaboration Features',
      category: 'features',
      description: 'Make the most of team collaboration tools like comments, assignments, and notifications.',
      readTime: '7 min',
      popularity: 'high',
      tags: ['team', 'collaboration', 'communication']
    },
    {
      id: 'article-7',
      title: 'Advanced Analytics Dashboard',
      category: 'features',
      description: 'Understand your team performance with detailed analytics and reports.',
      readTime: '9 min',
      popularity: 'medium',
      tags: ['analytics', 'reports', 'metrics']
    },
    {
      id: 'article-8',
      title: 'Mobile App Guide',
      category: 'getting-started',
      description: 'Learn how to use Nextus on your mobile device for on-the-go task management.',
      readTime: '4 min',
      popularity: 'medium',
      tags: ['mobile', 'app', 'on-the-go']
    }
  ];
  
  const filteredArticles = articles.filter(article => {
    if (activeCategory !== 'all' && article.category !== activeCategory) return false;
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !article.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  const handleArticleClick = (articleId: string) => {
    setSelectedArticle(articleId);
    onArticleSelect(articleId);
  };
  
  const selectedArticleData = selectedArticle ? articles.find(a => a.id === selectedArticle) : null;
  
  return (
    <div className="knowledge-base">
      <div className="kb-header">
        <h3 className="kb-title">Knowledge Base</h3>
        <div className="kb-stats">
          <span className="stat-badge articles">{articles.length} articles</span>
          <span className="stat-badge categories">{categories.length - 1} categories</span>
        </div>
      </div>
      
      <div className="kb-search">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </div>
        </form>
      </div>
      
      <div className="kb-content">
        <div className="kb-sidebar">
          <div className="categories-section">
            <h4 className="section-title">Categories</h4>
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id as any)}
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-content">
                    <div className="category-name">{category.name}</div>
                    <div className="category-count">{category.count} articles</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="popular-section">
            <h4 className="section-title">Popular Articles</h4>
            <div className="popular-list">
              {articles.filter(a => a.popularity === 'high').map(article => (
                <button
                  key={article.id}
                  className="popular-item"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="popular-title">{article.title}</div>
                  <div className="popular-readtime">{article.readTime} read</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="help-section">
            <div className="help-card">
              <div className="help-icon">💬</div>
              <div className="help-content">
                <div className="help-title">Need Help?</div>
                <div className="help-text">Can't find what you're looking for?</div>
                <button className="btn-secondary btn-sm">Contact Support</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="kb-main">
          {selectedArticle ? (
            <div className="article-view">
              <div className="article-header">
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => setSelectedArticle(null)}
                >
                  ← Back to Articles
                </button>
                <div className="article-actions">
                  <button className="btn-secondary btn-sm">
                    <span className="action-icon">📖</span>
                    Mark as Read
                  </button>
                  <button className="btn-secondary btn-sm">
                    <span className="action-icon">⭐</span>
                    Bookmark
                  </button>
                  <button className="btn-secondary btn-sm">
                    <span className="action-icon">📋</span>
                    Copy Link
                  </button>
                </div>
              </div>
              
              <div className="article-content">
                <h2 className="article-title">{selectedArticleData?.title}</h2>
                <div className="article-meta">
                  <span className="meta-category">{selectedArticleData?.category}</span>
                  <span className="meta-readtime">{selectedArticleData?.readTime} read</span>
                  <span className="meta-popularity">{selectedArticleData?.popularity} popularity</span>
                </div>
                
                <div className="article-tags">
                  {selectedArticleData?.tags.map(tag => (
                    <span key={tag} className="article-tag">{tag}</span>
                  ))}
                </div>
                
                <div className="article-body">
                  <p>
                    This is a detailed article about {selectedArticleData?.title.toLowerCase()}. 
                    In a real implementation, this would contain comprehensive documentation, 
                    step-by-step guides, screenshots, and examples.
                  </p>
                  
                  <h3>Key Points</h3>
                  <ul>
                    <li>Comprehensive guide to using this feature</li>
                    <li>Best practices and tips</li>
                    <li>Troubleshooting common issues</li>
                    <li>Advanced usage examples</li>
                  </ul>
                  
                  <h3>Step-by-Step Instructions</h3>
                  <ol>
                    <li>Start by accessing the feature from the main menu</li>
                    <li>Configure your settings according to your needs</li>
                    <li>Follow the on-screen instructions</li>
                    <li>Save your changes and test the functionality</li>
                  </ol>
                  
                  <div className="article-tip">
                    <div className="tip-icon">💡</div>
                    <div className="tip-content">
                      <strong>Pro Tip:</strong> {selectedArticleData?.description}
                    </div>
                  </div>
                </div>
                
                <div className="article-footer">
                  <div className="article-feedback">
                    <h4>Was this article helpful?</h4>
                    <div className="feedback-buttons">
                      <button className="btn-secondary btn-sm">👍 Yes</button>
                      <button className="btn-secondary btn-sm">👎 No</button>
                    </div>
                  </div>
                  
                  <div className="article-related">
                    <h4>Related Articles</h4>
                    <div className="related-articles">
                      {articles
                        .filter(a => a.id !== selectedArticle && a.category === selectedArticleData?.category)
                        .slice(0, 2)
                        .map(article => (
                          <button
                            key={article.id}
                            className="related-article"
                            onClick={() => handleArticleClick(article.id)}
                          >
                            <div className="related-title">{article.title}</div>
                            <div className="related-meta">{article.readTime} • {article.popularity}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="articles-grid">
              <div className="grid-header">
                <h4 className="grid-title">
                  {activeCategory === 'all' ? 'All Articles' : 
                   categories.find(c => c.id === activeCategory)?.name}
                </h4>
                <div className="grid-count">{filteredArticles.length} articles</div>
              </div>
              
              <div className="articles-list">
                {filteredArticles.map(article => (
                  <div 
                    key={article.id}
                    className="article-card"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <div className="article-card-header">
                      <div className="article-category">{article.category}</div>
                      <div className={`article-popularity ${article.popularity}`}>
                        {article.popularity}
                      </div>
                    </div>
                    
                    <h5 className="article-card-title">{article.title}</h5>
                    <p className="article-card-description">{article.description}</p>
                    
                    <div className="article-card-footer">
                      <div className="article-tags">
                        {article.tags.map(tag => (
                          <span key={tag} className="article-tag">{tag}</span>
                        ))}
                      </div>
                      <div className="article-readtime">{article.readTime}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredArticles.length === 0 && (
                <div className="no-articles">
                  <div className="no-articles-icon">📚</div>
                  <div className="no-articles-text">No articles found. Try a different search or category.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;