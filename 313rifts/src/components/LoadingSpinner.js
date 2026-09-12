import React from 'react';
import './LoadingSpinner.css';
import { FaGlobe, FaSearch, FaBookReader } from 'react-icons/fa';

const LoadingSpinner = ({ size = 40, type = 'default', message = null }) => {
  const getIcon = () => {
    switch(type) {
      case 'search':
        return <FaSearch className="spinner-icon" />;
      case 'globe':
        return <FaGlobe className="spinner-icon" />;
      case 'book':
        return <FaBookReader className="spinner-icon" />;
      default:
        return (
          <div className="spinner-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
    }
  };

  const getMessage = () => {
    if (message) return message;
    switch(type) {
      case 'search':
        return 'Searching Wikipedia...';
      case 'globe':
        return 'Loading language data...';
      case 'book':
        return 'Fetching article...';
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="loading-spinner">
      <div 
        className="spinner-container" 
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {getIcon()}
      </div>
      {getMessage() && (
        <div className="spinner-message">{getMessage()}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;