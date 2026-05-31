import { useState } from 'react';
import { checkHealth, seedDatabase } from '../services/api';

const APITest = () => {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [seedResult, setSeedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const result = await checkHealth();
      setHealthStatus(`✅ Backend healthy: ${result.status} at ${new Date(result.timestamp).toLocaleTimeString()}`);
    } catch (error) {
      setHealthStatus(`❌ Backend error: ${error.message}`);
    }
    setLoading(false);
  };

  const testSeed = async () => {
    setLoading(true);
    try {
      const result = await seedDatabase();
      setSeedResult(result);
      setHealthStatus('✅ Database seeded successfully!');
    } catch (error) {
      setHealthStatus(`❌ Seed failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="api-test">
      <h3>API Connection Test</h3>
      <div className="test-buttons">
        <button 
          className="btn-primary"
          onClick={testHealth}
          disabled={loading}
        >
          Test Backend Health
        </button>
        <button 
          className="btn-secondary"
          onClick={testSeed}
          disabled={loading}
        >
          Seed Database
        </button>
      </div>
      
      {healthStatus && (
        <div className={`test-result ${healthStatus.includes('✅') ? 'success' : 'error'}`}>
          {healthStatus}
        </div>
      )}
      
      {seedResult && (
        <div className="seed-result">
          <h4>Seed Results:</h4>
          <pre>{JSON.stringify(seedResult, null, 2)}</pre>
        </div>
      )}
      
      {loading && <div className="loading">Testing...</div>}
    </div>
  );
};

export default APITest;