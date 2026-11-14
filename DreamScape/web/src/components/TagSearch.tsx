import React, { useState } from 'react';
import axios from 'axios';

interface Dream {
  id: string;
  title: string;
  content: string;
  tags?: string;
  emotion?: string;
  createdAt: string;
}

const TagSearch: React.FC = () => {
  const [tag, setTag] = useState('');
  const [results, setResults] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/dreams/search?tag=${encodeURIComponent(tag)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Search Dreams by Tag</h2>
      <input
        type="text"
        placeholder="Enter tag"
        value={tag}
        onChange={e => setTag(e.target.value)}
        style={{ marginRight: '0.5rem' }}
      />
      <button onClick={search} disabled={loading}>
        {loading ? 'Searching…' : 'Search'}
      </button>

      {results.length > 0 && (
        <ul style={{ marginTop: '1rem' }}>
          {results.map(d => (
            <li key={d.id}>
              <strong>{d.title}</strong> – {d.tags}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagSearch;

