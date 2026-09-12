import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ languages, selectedLanguage, onLanguageChange, currentArticle }) => {
  const handleLanguageSelect = (language) => {
    if (language.code !== selectedLanguage) {
      onLanguageChange(language.code);
    }
  };

  return (
    <div className="language-selector">
      <div className="selector-header">
        <h3 className="selector-title">Available Languages</h3>
        <span className="language-count">{languages.length} languages</span>
      </div>
      
      <div className="languages-grid">
        {languages.map((language) => (
          <button
            key={language.code}
            className={`language-item ${language.code === selectedLanguage ? 'active' : ''}`}
            onClick={() => handleLanguageSelect(language)}
            title={`${language.name} (${language.code}) - ${language['*']}`}
          >
            <span className="language-code">{language.code.toUpperCase()}</span>
            <span className="language-name">{language.name}</span>
            {language.code === selectedLanguage && (
              <span className="selected-indicator">✓</span>
            )}
          </button>
        ))}
      </div>
      
      <div className="language-info">
        <p className="info-text">
          Click any language to view the article in that language. 
          The article content will be fetched from Wikipedia in the selected language.
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;