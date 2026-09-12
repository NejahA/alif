import React, { useState } from 'react';
import './SharePanel.css';

const SharePanel = ({ article, selectedLanguage }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!article || !article.title) return null;

  const articleUrl = `https://${selectedLanguage}.wikipedia.org/wiki/${encodeURIComponent(article.title)}`;
  const shareText = `Check out "${article.title}" on Wikipedia: ${articleUrl}`;
  const pageUrl = window.location.href;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = () => {
    const subject = `Wikipedia Article: ${article.title}`;
    const body = `Check out this Wikipedia article:\n\n${article.title}\n${articleUrl}\n\nShared via 313rifts Wikipedia Translator`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="share-panel">
      <button 
        className="share-button"
        onClick={() => setShowShareMenu(!showShareMenu)}
        title="Share this article"
      >
        <span className="share-icon">🔗</span>
        <span className="share-label">Share</span>
        {showShareMenu ? '▲' : '▼'}
      </button>

      {showShareMenu && (
        <div className="share-menu">
          <div className="share-menu-header">
            <h4 className="share-menu-title">Share Article</h4>
            <button 
              className="share-menu-close"
              onClick={() => setShowShareMenu(false)}
            >
              ×
            </button>
          </div>

          <div className="share-url-section">
            <div className="share-url-display">
              <input
                type="text"
                value={articleUrl}
                readOnly
                className="share-url-input"
              />
              <button 
                className="btn-copy-url"
                onClick={() => copyToClipboard(articleUrl)}
                title="Copy URL to clipboard"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="share-platforms">
            <h5 className="share-platforms-title">Share via:</h5>
            <div className="share-platforms-grid">
              <button className="share-platform-btn" onClick={shareViaTwitter}>
                <span className="platform-icon">🐦</span>
                <span className="platform-name">Twitter</span>
              </button>
              
              <button className="share-platform-btn" onClick={shareViaFacebook}>
                <span className="platform-icon">📘</span>
                <span className="platform-name">Facebook</span>
              </button>
              
              <button className="share-platform-btn" onClick={shareViaWhatsApp}>
                <span className="platform-icon">💬</span>
                <span className="platform-name">WhatsApp</span>
              </button>
              
              <button className="share-platform-btn" onClick={shareViaEmail}>
                <span className="platform-icon">✉️</span>
                <span className="platform-name">Email</span>
              </button>
              
              <button className="share-platform-btn" onClick={() => copyToClipboard(shareText)}>
                <span className="platform-icon">📋</span>
                <span className="platform-name">Copy Text</span>
              </button>
              
              <button className="share-platform-btn" onClick={() => copyToClipboard(pageUrl)}>
                <span className="platform-icon">🔗</span>
                <span className="platform-name">Copy Page</span>
              </button>
            </div>
          </div>

          <div className="share-qr-section">
            <h5 className="share-qr-title">QR Code</h5>
            <div className="share-qr-placeholder">
              <div className="qr-icon">📱</div>
              <p className="qr-text">Scan to open article</p>
              <p className="qr-url">{article.title.substring(0, 30)}...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePanel;