import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const FALLBACK_QUOTES = [
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
];

export default function QuoteGenerator() {
  const [quote, setQuote] = useLocalStorage('current-quote', null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useLocalStorage('favorite-quotes', []);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.quotable.io/random');
      if (res.ok) {
        const data = await res.json();
        setQuote({ text: data.content, author: data.author });
      } else {
        throw new Error('API error');
      }
    } catch {
      const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote(random);
    }
    setLoading(false);
  }, [setQuote]);

  useEffect(() => {
    if (!quote) fetchQuote();
  }, []);

  const toggleFavorite = useCallback(() => {
    if (!quote) return;
    setFavorites(prev => {
      const exists = prev.some(f => f.text === quote.text);
      if (exists) return prev.filter(f => f.text !== quote.text);
      return [...prev, quote];
    });
  }, [quote, setFavorites]);

  const isFavorite = quote && favorites.some(f => f.text === quote.text);

  return (
    <div className="feature-card quotes-card">
      <div className="card-header">
        <h2>💬 Quote Generator</h2>
        <p className="card-subtitle">Get inspired with random quotes. Save your favorites.</p>
      </div>

      <div className="quote-display">
        {loading ? (
          <div className="quote-loading">✨ Finding inspiration...</div>
        ) : quote ? (
          <>
            <blockquote className="quote-text">"{quote.text}"</blockquote>
            <cite className="quote-author">— {quote.author}</cite>
          </>
        ) : null}
      </div>

      <div className="quote-actions">
        <button className="btn primary" onClick={fetchQuote} disabled={loading}>
          {loading ? '⏳' : '🎲 New Quote'}
        </button>
        <button
          className={`btn secondary ${isFavorite ? 'favorited' : ''}`}
          onClick={toggleFavorite}
        >
          {isFavorite ? '❤️ Saved' : '🤍 Save'}
        </button>
      </div>

      {favorites.length > 0 && (
        <div className="favorites-section">
          <h3>Saved Quotes ({favorites.length})</h3>
          <div className="favorites-list">
            {favorites.map((f, i) => (
              <div key={i} className="favorite-item">
                <p>"{f.text}"</p>
                <span>— {f.author}</span>
                <button
                  className="remove-fav"
                  onClick={() => setFavorites(prev => prev.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}