import React from 'react';
import './ArticleViewer.css';

const ArticleViewer = ({ article }) => {
  if (!article) {
    return (
      <div className="article-viewer empty">
        <p>No article selected</p>
      </div>
    );
  }

  return (
    <div className="article-viewer">
      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      
      <div className="article-info">
        <div className="info-section">
          <h4>Article Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Language:</span>
              <span className="info-value">{article.language}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Page ID:</span>
              <span className="info-value">{article.pageid}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Modified:</span>
              <span className="info-value">
                {new Date(article.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Categories:</span>
              <span className="info-value">
                {article.categories ? article.categories.slice(0, 3).join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>
        
        {article.links && article.links.length > 0 && (
          <div className="links-section">
            <h4>Related Links</h4>
            <div className="links-grid">
              {article.links.slice(0, 6).map((link, index) => (
                <a 
                  key={index} 
                  href={`https://${article.language}.wikipedia.org/wiki/${encodeURIComponent(link)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="article-link"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleViewer;