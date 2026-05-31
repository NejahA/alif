import { useState, useEffect } from 'react';

interface DevOpsDashboardProps {
  onDeploy: (environment: string) => void;
  onRollback: (version: string) => void;
  onMonitor: (service: string) => void;
}

const DevOpsDashboard = ({ onDeploy, onRollback, onMonitor }: DevOpsDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deployments' | 'monitoring' | 'logs'>('overview');
  const [services, setServices] = useState([
    { id: 'api', name: 'API Service', status: 'healthy', version: 'v1.2.3', uptime: '99.9%', cpu: 45, memory: 68, latency: 120 },
    { id: 'web', name: 'Web Frontend', status: 'healthy', version: 'v1.1.8', uptime: '99.8%', cpu: 32, memory: 45, latency: 85 },
    { id: 'db', name: 'Database', status: 'warning', version: 'v2.0.1', uptime: '99.5%', cpu: 78, memory: 82, latency: 210 },
    { id: 'cache', name: 'Cache Service', status: 'healthy', version: 'v1.0.5', uptime: '99.9%', cpu: 25, memory: 34, latency: 15 },
    { id: 'queue', name: 'Message Queue', status: 'error', version: 'v1.3.2', uptime: '95.2%', cpu: 92, memory: 88, latency: 350 },
    { id: 'auth', name: 'Auth Service', status: 'healthy', version: 'v1.4.0', uptime: '99.7%', cpu: 38, memory: 52, latency: 95 },
  ]);
  
  const [deployments, setDeployments] = useState([
    { id: 'deploy-1', service: 'API Service', environment: 'production', version: 'v1.2.3', status: 'success', time: '2 hours ago', duration: '4m 23s', triggeredBy: 'Alex Johnson' },
    { id: 'deploy-2', service: 'Web Frontend', environment: 'staging', version: 'v1.1.8', status: 'success', time: '5 hours ago', duration: '2m 15s', triggeredBy: 'Sam Wilson' },
    { id: 'deploy-3', service: 'Database', environment: 'production', version: 'v2.0.1', status: 'failed', time: '1 day ago', duration: '8m 45s', triggeredBy: 'Jordan Lee' },
    { id: 'deploy-4', service: 'Cache Service', environment: 'production', version: 'v1.0.5', status: 'success', time: '2 days ago', duration: '1m 30s', triggeredBy: 'Taylor Swift' },
    { id: 'deploy-5', service: 'Message Queue', environment: 'staging', version: 'v1.3.2', status: 'running', time: '30 minutes ago', duration: '3m 10s', triggeredBy: 'Casey Kim' },
  ]);
  
  const [alerts, setAlerts] = useState([
    { id: 'alert-1', service: 'Message Queue', type: 'error', message: 'High CPU usage detected', severity: 'critical', time: '15 minutes ago', acknowledged: false },
    { id: 'alert-2', service: 'Database', type: 'warning', message: 'Memory usage above threshold', severity: 'warning', time: '2 hours ago', acknowledged: true },
    { id: 'alert-3', service: 'API Service', type: 'info', message: 'Increased latency detected', severity: 'info', time: '5 hours ago', acknowledged: true },
    { id: 'alert-4', service: 'Web Frontend', type: 'warning', message: 'Error rate increased', severity: 'warning', time: '1 day ago', acknowledged: true },
  ]);
  
  const [metrics, setMetrics] = useState({
    totalRequests: 1248500,
    errorRate: 0.42,
    avgResponseTime: 145,
    activeUsers: 2450,
    deploymentFrequency: '3/day',
    changeFailureRate: 8.2,
    meanTimeToRecovery: '15m 30s',
    leadTime: '2h 45m'
  });
  
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        cpu: Math.max(10, Math.min(100, service.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(20, Math.min(100, service.memory + (Math.random() * 8 - 4))),
        latency: Math.max(10, Math.min(500, service.latency + (Math.random() * 20 - 10)))
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleDeploy = (environment: string) => {
    onDeploy(environment);
    alert(`Deploying to ${environment} environment...`);
  };
  
  const handleRollback = (version: string) => {
    onRollback(version);
    alert(`Rolling back to version ${version}...`);
  };
  
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    alert(`Alert ${alertId} acknowledged`);
  };
  
  const handleRestartService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { ...service, status: 'restarting' } : service
    ));
    
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, status: 'healthy', cpu: 25, memory: 40, latency: 50 } : service
      ));
    }, 3000);
    
    alert(`Restarting ${serviceId} service...`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'var(--accent-success)';
      case 'warning': return 'var(--accent-warning)';
      case 'error': return 'var(--accent-danger)';
      case 'restarting': return 'var(--accent-primary)';
      default: return 'var(--text-secondary)';
    }
  };
  
  return (
    <div className="devops-dashboard">
      <div className="dashboard-header">
        <h3 className="dashboard-title">DevOps Dashboard</h3>
        <div className="dashboard-tabs">
          <button 
            className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'deployments' ? 'active' : ''}`}
            onClick={() => setActiveTab('deployments')}
          >
            <span className="tab-icon">🚀</span>
            Deployments
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            <span className="tab-icon">👁️</span>
            Monitoring
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <span className="tab-icon">📝</span>
            Logs
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-metrics">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Total Requests</div>
                    <div className="metric-trend positive">+12%</div>
                  </div>
                  <div className="metric-value">{metrics.totalRequests.toLocaleString()}</div>
                  <div className="metric-label">Last 24 hours</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Error Rate</div>
                    <div className="metric-trend negative">+0.2%</div>
                  </div>
                  <div className="metric-value">{metrics.errorRate}%</div>
                  <div className="metric-label">Target: &lt; 1%</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Avg Response Time</div>
                    <div className="metric-trend positive">-15ms</div>
                  </div>
                  <div className="metric-value">{metrics.avgResponseTime}ms</div>
                  <div className="metric-label">P95: 210ms</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Active Users</div>
                    <div className="metric-trend positive">+8%</div>
                  </div>
                  <div className="metric-value">{metrics.activeUsers.toLocaleString()}</div>
                  <div className="metric-label">Concurrent</div>
                </div>
              </div>
            </div>
            
            <div className="overview-services">
              <div className="services-header">
                <h4 className="services-title">Service Health</h4>
                <div className="services-actions">
                  <button className="btn-secondary btn-sm" onClick={() => handleDeploy('staging')}>
                    Deploy to Staging
                  </button>
                  <button className="btn-secondary btn-sm" onClick={() => handleDeploy('production')}>
                    Deploy to Production
                  </button>
                </div>
              </div>
              
              <div className="services-grid">
                {services.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="service-header">
                      <div className="service-name">{service.name}</div>
                      <div 
                        className={`service-status status-${service.status}`}
                        style={{ color: getStatusColor(service.status) }}
                      >
                        {service.status}
                      </div>
                    </div>
                    
                    <div className="service-metrics">
                      <div className="metric">
                        <div className="metric-label">CPU</div>
                        <div className="metric-value">{service.cpu}%</div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill"
                            style={{ 
                              width: `${service.cpu}%`,
                              background: service.cpu > 80 ? 'var(--accent-danger)' : 
                                         service.cpu > 60 ? 'var(--accent-warning)' : 'var(--accent-success)'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="metric">
                        <div className="metric-label">Memory</div>
                        <div className="metric-value">{service.memory}%</div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill"
                            style={{ 
                              width: `${service.memory}%`,
                              background: service.memory > 85 ? 'var(--accent-danger)' : 
                                         service.memory > 70 ? 'var(--accent-warning)' : 'var(--accent-success)'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="metric">
                        <div className="metric-label">Latency</div>
                        <div className="metric-value">{service.latency}ms</div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill"
                            style={{ 
                              width: `${Math.min(100, service.latency / 5)}%`,
                              background: service.latency > 300 ? 'var(--accent-danger)' : 
                                         service.latency > 150 ? 'var(--accent-warning)' : 'var(--accent-success)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="service-footer">
                      <div className="service-version">{service.version}</div>
                      <div className="service-uptime">{service.uptime} uptime</div>
                      <div className="service-actions">
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => onMonitor(service.id)}
                        >
                          Monitor
                        </button>
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => handleRestartService(service.id)}
                          disabled={service.status === 'restarting'}
                        >
                          {service.status === 'restarting' ? 'Restarting...' : 'Restart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="overview-alerts">
              <div className="alerts-header">
                <h4 className="alerts-title">Active Alerts</h4>
                <div className="alerts-count">
                  <span className="count-critical">{alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length} critical</span>
                  <span className="count-warning">{alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length} warning</span>
                </div>
              </div>
              
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}>
                    <div className="alert-header">
                      <div className="alert-service">{alert.service}</div>
                      <div className={`alert-severity severity-${alert.severity}`}>
                        {alert.severity}
                      </div>
                    </div>
                    
                    <div className="alert-message">{alert.message}</div>
                    
                    <div className="alert-footer">
                      <div className="alert-time">{alert.time}</div>
                      <div className="alert-actions">
                        {!alert.acknowledged && (
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </button>
                        )}
                        <button className="btn-secondary btn-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'deployments' && (
          <div className="deployments-section">
            <div className="section-header">
              <h4 className="section-title">Deployment History</h4>
              <div className="section-actions">
                <button className="btn-primary" onClick={() => handleDeploy('production')}>
                  New Deployment
                </button>
                <button className="btn-secondary">
                  View Pipeline
                </button>
              </div>
            </div>
            
            <div className="deployments-table">
              <div className="table-header">
                <div className="header-cell service">Service</div>
                <div className="header-cell environment">Environment</div>
                <div className="header-cell version">Version</div>
                <div className="header-cell status">Status</div>
                <div className="header-cell time">Time</div>
                <div className="header-cell duration">Duration</div>
                <div className="header-cell triggered">Triggered By</div>
                <div className="header-cell actions">Actions</div>
              </div>
              
              {deployments.map(deployment => (
                <div key={deployment.id} className="table-row">
                  <div className="row-cell service">
                    <div className="service-name">{deployment.service}</div>
                  </div>
                  <div className="row-cell environment">
                    <div className={`env-badge env-${deployment.environment}`}>
                      {deployment.environment}
                    </div>
                  </div>
                  <div className="row-cell version">
                    <div className="version-value">{deployment.version}</div>
                  </div>
                  <div className="row-cell status">
                    <div className={`status-badge status-${deployment.status}`}>
                      {deployment.status}
                    </div>
                  </div>
                  <div className="row-cell time">
                    <div className="time-value">{deployment.time}</div>
                  </div>
                  <div className="row-cell duration">
                    <div className="duration-value">{deployment.duration}</div>
                  </div>
                  <div className="row-cell triggered">
                    <div className="triggered-by">{deployment.triggeredBy}</div>
                  </div>
                  <div className="row-cell actions">
                    <div className="action-buttons">
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => handleRollback(deployment.version)}
                      >
                        Rollback
                      </button>
                      <button className="btn-secondary btn-sm">
                        Logs
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="deployment-metrics">
              <div className="metrics-card">
                <h5 className="metrics-title">Deployment Metrics</h5>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value">{metrics.deploymentFrequency}</div>
                    <div className="metric-label">Deployment Frequency</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{metrics.changeFailureRate}%</div>
                    <div className="metric-label">Change Failure Rate</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{metrics.meanTimeToRecovery}</div>
                    <div className="metric-label">Mean Time to Recovery</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{metrics.leadTime}</div>
                    <div className="metric-label">Lead Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'monitoring' && (
          <div className="monitoring-section">
            <div className="section-header">
              <h4 className="section-title">Real-time Monitoring</h4>
              <div className="section-actions">
                <button className="btn-secondary">
                  <span className="action-icon">📊</span>
                  Export Metrics
                </button>
                <button className="btn-secondary">
                  <span className="action-icon">🔔</span>
                  Set Alerts
                </button>
              </div>
            </div>
            
            <div className="monitoring-charts">
              <div className="chart-card">
                <div className="chart-header">
                  <h5 className="chart-title">CPU Usage</h5>
                  <div className="chart-legend">
                    <span className="legend-item api">API</span>
                    <span className="legend-item web">Web</span>
                    <span className="legend-item db">Database</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="placeholder-text">CPU usage chart visualization</div>
                </div>
              </div>
              
              <div className="chart-card">
                <div className="chart-header">
                  <h5 className="chart-title">Memory Usage</h5>
                  <div className="chart-legend">
                    <span className="legend-item api">API</span>
                    <span className="legend-item web">Web</span>
                    <span className="legend-item db">Database</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="placeholder-text">Memory usage chart visualization</div>
                </div>
              </div>
              
              <div className="chart-card">
                <div className="chart-header">
                  <h5 className="chart-title">Response Time</h5>
                  <div className="chart-legend">
                    <span className="legend-item p50">P50</span>
                    <span className="legend-item p95">P95</span>
                    <span className="legend-item p99">P99</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="placeholder-text">Response time chart visualization</div>
                </div>
              </div>
              
              <div className="chart-card">
                <div className="chart-header">
                  <h5 className="chart-title">Error Rate</h5>
                  <div className="chart-legend">
                    <span className="legend-item errors">Errors</span>
                    <span className="legend-item warnings">Warnings</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="placeholder-text">Error rate chart visualization</div>
                </div>
              </div>
            </div>
            
            <div className="monitoring-insights">
              <div className="insights-card">
                <h5 className="insights-title">Performance Insights</h5>
                <div className="insights-list">
                  <div className="insight positive">
                    <div className="insight-icon">✅</div>
                    <div className="insight-content">
                      <div className="insight-text">API response times improved by 15%</div>
                      <div className="insight-detail">After recent optimizations</div>
                    </div>
                  </div>
                  <div className="insight warning">
                    <div className="insight-icon">⚠️</div>
                    <div className="insight-content">
                      <div className="insight-text">Database memory usage trending upward</div>
                      <div className="insight-detail">Consider scaling or optimization</div>
                    </div>
                  </div>
                  <div className="insight positive">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <div className="insight-text">Cache hit rate at 92%</div>
                      <div className="insight-detail">Excellent cache performance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="logs-section">
            <div className="section-header">
              <h4 className="section-title">System Logs</h4>
              <div className="section-filters">
                <select className="log-filter">
                  <option>All Services</option>
                  <option>API Service</option>
                  <option>Web Frontend</option>
                  <option>Database</option>
                </select>
                <select className="log-filter">
                  <option>All Levels</option>
                  <option>Error</option>
                  <option>Warning</option>
                  <option>Info</option>
                </select>
                <button className="btn-secondary">
                  <span className="action-icon">🔍</span>
                  Search Logs
                </button>
              </div>
            </div>
            
            <div className="logs-viewer">
              <div className="logs-container">
                <div className="log-entry error">
                  <div className="log-timestamp">2024-01-15 14:30:22</div>
                  <div className="log-service">Message Queue</div>
                  <div className="log-level">ERROR</div>
                  <div className="log-message">Failed to process message: Connection timeout</div>
                </div>
                <div className="log-entry warning">
                  <div className="log-timestamp">2024-01-15 14:28:15</div>
                  <div className="log-service">Database</div>
                  <div className="log-level">WARNING</div>
                  <div className="log-message">High memory usage detected: 82%</div>
                </div>
                <div className="log-entry info">
                  <div className="log-timestamp">2024-01-15 14:25:10</div>
                  <div className="log-service">API Service</div>
                  <div className="log-level">INFO</div>
                  <div className="log-message">Deployed version v1.2.3 to production</div>
                </div>
                <div className="log-entry info">
                  <div className="log-timestamp">2024-01-15 14:20:05</div>
                  <div className="log-service">Web Frontend</div>
                  <div className="log-level">INFO</div>
                  <div className="log-message">User session created: user-12345</div>
                </div>
                <div className="log-entry error">
                  <div className="log-timestamp">2024-01-15 14:15:42</div>
                  <div className="log-service">Cache Service</div>
                  <div className="log-level">ERROR</div>
                  <div className="log-message">Cache miss rate increased to 8%</div>
                </div>
              </div>
            </div>
            
            <div className="logs-actions">
              <div className="action-buttons">
                <button className="btn-primary">
                  Download Logs
                </button>
                <button className="btn-secondary">
                  Clear Logs
                </button>
                <button className="btn-secondary">
                  Set Up Logging
                </button>
              </div>
              
              <div className="logs-info">
                <div className="info-item">
                  <span className="info-icon">📊</span>
                  <span className="info-text">Log retention: 30 days</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔍</span>
                  <span className="info-text">Real-time log streaming available</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📈</span>
                  <span className="info-text">Log analytics dashboard</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="dashboard-footer">
        <div className="footer-info">
          <div className="info-card">
            <h5 className="info-title">System Status</h5>
            <div className="info-content">
              <div className="status-item">
                <span className="status-dot healthy"></span>
                <span className="status-text">All systems operational</span>
              </div>
              <div className="status-item">
                <span className="status-dot warning"></span>
                <span className="status-text">1 service needs attention</span>
              </div>
              <div className="status-item">
                <span className="status-dot error"></span>
                <span className="status-text">1 critical alert</span>
              </div>
            </div>
          </div>
          
          <div className="info-card">
            <h5 className="info-title">Last Deployment</h5>
            <div className="info-content">
              <div className="deployment-info">
                <div className="deployment-service">API Service v1.2.3</div>
                <div className="deployment-time">2 hours ago</div>
                <div className="deployment-status success">Success</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-primary">
            Run Health Check
          </button>
          <button className="btn-secondary">
            Generate Report
          </button>
          <button className="btn-secondary">
            System Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevOpsDashboard;