import React, { useState } from 'react';
import './TranslationPanel.css';
import { FaLanguage, FaExchangeAlt, FaCopy, FaShareAlt } from 'react-icons/fa';

const TranslationPanel = ({ languages, selectedLanguage, onLanguageSelect, articleTitle }) => {
  const [showQuickTranslate, setShowQuickTranslate] = useState(false);
  const [translationText, setTranslationText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleQuickTranslate = async () => {
    if (!translationText.trim()) return;
    
    setIsTranslating(true);
    
    // Simulate translation API call
    setTimeout(() => {
      setTranslatedText(`Translated "${translationText}" to ${targetLanguage}`);
      setIsTranslating(false);
    }, 1000);
  };

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedText)
      .then(() => alert('Translation copied to clipboard!'))
      .catch(() => alert('Failed to copy translation'));
  };

  const handleShareTranslation = () => {
    const shareData = {
      title: `Wikipedia Translation: ${articleTitle}`,
      text: `Check out this Wikipedia article in ${selectedLanguage}: ${articleTitle}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="translation-panel">
      <div className="panel-header">
        <div className="header-content">
          <FaLanguage className="header-icon" />
          <div>
            <h3 className="panel-title">Translation Tools</h3>
            <p className="panel-subtitle">
              Current language: <span className="current-language">{selectedLanguage.toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="language-switcher">
        <h4 className="section-title">Switch to:</h4>
        <div className="quick-switch">
          {languages.slice(0, 6).map((language) => (
            <button
              key={language.code}
              className={`switch-button ${language.code === selectedLanguage ? 'active' : ''}`}
              onClick={() => onLanguageSelect(language.code)}
              title={language.name}
            >
              <span className="switch-code">{language.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="quick-translate-section">
        <div className="section-header">
          <h4 className="section-title">Quick Translate</h4>
          <button 
            className="toggle-button"
            onClick={() => setShowQuickTranslate(!showQuickTranslate)}
          >
            {showQuickTranslate ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showQuickTranslate && (
          <div className="translate-content">
            <div className="translate-input">
              <textarea
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
                placeholder="Enter text to translate..."
                className="translate-textarea"
                rows="3"
              />
              
              <div className="translate-controls">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="language-select"
                >
                  <option value="fr">French (FR)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="de">German (DE)</option>
                  <option value="it">Italian (IT)</option>
                  <option value="pt">Portuguese (PT)</option>
                  <option value="ru">Russian (RU)</option>
                  <option value="zh">Chinese (ZH)</option>
                  <option value="ja">Japanese (JA)</option>
                  <option value="ko">Korean (KO)</option>
                  <option value="ar">Arabic (AR)</option>
                </select>
                
                <button
                  onClick={handleQuickTranslate}
                  disabled={!translationText.trim() || isTranslating}
                  className="translate-button"
                >
                  <FaExchangeAlt className="button-icon" />
                  {isTranslating ? 'Translating...' : 'Translate'}
                </button>
              </div>
            </div>
            
            {translatedText && (
              <div className="translation-result">
                <div className="result-header">
                  <span className="result-label">Translation:</span>
                  <div className="result-actions">
                    <button onClick={handleCopyTranslation} className="action-button">
                      <FaCopy className="action-icon" />
                      Copy
                    </button>
                  </div>
                </div>
                <div className="result-text">{translatedText}</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="panel-actions">
        <button className="action-button large" onClick={handleShareTranslation}>
          <FaShareAlt className="button-icon" />
          Share Article
        </button>
        
        <div className="language-stats">
          <div className="stat-item">
            <span className="stat-value">{languages.length}</span>
            <span className="stat-label">Languages Available</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">All</span>
            <span className="stat-label">Wikipedia Editions</span>
          </div>
        </div>
      </div>
      
      <div className="panel-footer">
        <p className="footer-text">
          Note: This tool helps navigate Wikipedia's multi-language content. 
          Actual translations may vary between language editions.
        </p>
      </div>
    </div>
  );
};

export default TranslationPanel;