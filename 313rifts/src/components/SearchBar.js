import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ value, onChange, onClear, placeholder = "Search..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onClear();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
      <div className="search-icon">
        <FiSearch />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search Wikipedia articles"
      />
      {value && (
        <button 
          onClick={handleClear} 
          className="clear-button"
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
      <div className="search-hint">
        Press Enter to search or browse suggestions
      </div>
    </div>
  );
};

export default SearchBar;