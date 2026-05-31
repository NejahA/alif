import { useState, useEffect } from 'react';
import { fetchIntegrations, updateIntegration } from '../services/api';

interface IntegrationHubProps {
  onConnect: (integration: string) => void;
  onDisconnect: (integration: string) => void;
}

interface Integration {
  _id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
}

const IntegrationHub = ({ onConnect, onDisconnect }: IntegrationHubProps) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const data = await fetchIntegrations();
        setIntegrations(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load integrations:', error);
        setLoading(false);
      }
    };
    
    loadIntegrations();
  }, []);
  
  const handleToggleIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i._id === integrationId);
    if (!integration) return;
    
    const newConnectedState = !integration.connected;
    
    try {
      const updatedIntegration = await updateIntegration(integrationId, { connected: newConnectedState });
      setIntegrations(integrations.map(i => i._id === integrationId ? updatedIntegration : i));
      
      if (newConnectedState) {
        onConnect(integration.name);
      } else {
        onDisconnect(integration.name);
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      alert('Failed to update integration. Please check backend connection.');
    }
  };
  
  if (loading) {
    return (
      <div className="integration-hub">
        <div className="integration-header">
          <h3 className="integration-title">Integration Hub</h3>
          <div className="integration-stats">
            <span className="stat-badge">Loading...</span>
          </div>
        </div>
        <div className="loading-message">Loading integrations...</div>
      </div>
    );
  }

  const connectedCount = integrations.filter(i => i.connected).length;
  
  return (
    <div className="integration-hub">
      <div className="integration-header">
        <h3 className="integration-title">Integration Hub</h3>
        <div className="integration-stats">
          <span className="stat-badge connected">{connectedCount} connected</span>
          <span className="stat-badge total">{integrations.length} available</span>
        </div>
      </div>
      
      <div className="integration-grid">
        {integrations.map(integration => (
          <div 
            key={integration._id}
            className={`integration-card ${integration.connected ? 'connected' : ''}`}
            onClick={() => handleToggleIntegration(integration._id)}
          >
            <div className="integration-icon">{integration.icon}</div>
            <div className="integration-content">
              <div className="integration-name">{integration.name}</div>
              <div className="integration-description">{integration.description}</div>
            </div>
            <div className="integration-status">
              <div className={`status-indicator ${integration.connected ? 'connected' : 'disconnected'}`}>
                {integration.connected ? 'Connected' : 'Connect'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="integration-actions">
        <div className="action-section">
          <h4 className="action-title">API Access</h4>
          <div className="api-info">
            <div className="api-key">
              <span className="key-label">API Key:</span>
              <span className="key-value">••••••••••••••••</span>
              <button className="btn-secondary btn-sm">Regenerate</button>
            </div>
            <div className="api-docs">
              <a href="#" className="btn-secondary btn-sm">View Documentation</a>
              <a href="#" className="btn-secondary btn-sm">Download SDK</a>
            </div>
          </div>
        </div>
        
        <div className="action-section">
          <h4 className="action-title">Webhooks</h4>
          <div className="webhook-info">
            <div className="webhook-url">
              <span className="url-label">Webhook URL:</span>
              <span className="url-value">https://api.nextus.com/webhook</span>
              <button className="btn-secondary btn-sm">Copy</button>
            </div>
            <div className="webhook-events">
              <div className="event-list">
                <span className="event-tag">task.created</span>
                <span className="event-tag">task.updated</span>
                <span className="event-tag">task.deleted</span>
                <span className="event-tag">comment.added</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationHub;
