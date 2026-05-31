import { useState } from 'react';

interface SecurityAuditProps {
  onScanStart: () => void;
  onVulnerabilityFix: (vulnerabilityId: string) => void;
  onReportGenerate: () => void;
}

const SecurityAudit = ({ onScanStart, onVulnerabilityFix, onReportGenerate }: SecurityAuditProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vulnerabilities' | 'compliance' | 'logs'>('overview');
  const [scanInProgress, setScanInProgress] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState<string | null>(null);
  
  const vulnerabilities = [
    {
      id: 'vuln-1',
      title: 'SQL Injection Vulnerability',
      severity: 'critical',
      category: 'injection',
      description: 'User input not properly sanitized in database queries',
      location: '/api/users/search',
      discovered: '2 hours ago',
      status: 'open',
      cve: 'CVE-2024-1234',
      impact: 'High',
      remediation: 'Use parameterized queries or prepared statements'
    },
    {
      id: 'vuln-2',
      title: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      category: 'xss',
      description: 'User input reflected in response without sanitization',
      location: '/comments/post',
      discovered: '1 day ago',
      status: 'in-progress',
      cve: 'CVE-2024-1235',
      impact: 'Medium',
      remediation: 'Implement output encoding and Content Security Policy'
    },
    {
      id: 'vuln-3',
      title: 'Broken Authentication',
      severity: 'medium',
      category: 'authentication',
      description: 'Session timeout not properly implemented',
      location: '/auth/session',
      discovered: '3 days ago',
      status: 'open',
      cve: 'CVE-2024-1236',
      impact: 'Medium',
      remediation: 'Implement proper session management with timeout'
    },
    {
      id: 'vuln-4',
      title: 'Sensitive Data Exposure',
      severity: 'high',
      category: 'data-protection',
      description: 'API keys exposed in client-side code',
      location: '/static/js/app.js',
      discovered: '5 days ago',
      status: 'fixed',
      cve: 'CVE-2024-1237',
      impact: 'High',
      remediation: 'Move sensitive data to environment variables'
    },
    {
      id: 'vuln-5',
      title: 'Security Misconfiguration',
      severity: 'low',
      category: 'configuration',
      description: 'Default admin credentials still in use',
      location: '/admin/login',
      discovered: '1 week ago',
      status: 'fixed',
      cve: 'CVE-2024-1238',
      impact: 'Low',
      remediation: 'Change default credentials and implement MFA'
    }
  ];
  
  const complianceChecks = [
    { id: 'check-1', name: 'GDPR Compliance', status: 'compliant', lastCheck: '2 days ago', score: 95 },
    { id: 'check-2', name: 'PCI DSS', status: 'non-compliant', lastCheck: '1 week ago', score: 65 },
    { id: 'check-3', name: 'HIPAA', status: 'partial', lastCheck: '3 days ago', score: 78 },
    { id: 'check-4', name: 'ISO 27001', status: 'compliant', lastCheck: '1 month ago', score: 92 },
    { id: 'check-5', name: 'SOC 2', status: 'in-progress', lastCheck: '2 weeks ago', score: 85 }
  ];
  
  const securityMetrics = {
    totalVulnerabilities: vulnerabilities.length,
    criticalVulnerabilities: vulnerabilities.filter(v => v.severity === 'critical').length,
    avgRemediationTime: '3.2 days',
    complianceScore: 82,
    lastScan: '2 hours ago',
    scanCoverage: '94%'
  };
  
  const handleStartScan = () => {
    setScanInProgress(true);
    onScanStart();
    
    // Simulate scan progress
    setTimeout(() => {
      setScanInProgress(false);
      alert('Security scan completed! Found 3 new vulnerabilities.');
    }, 3000);
  };
  
  const handleFixVulnerability = (vulnerabilityId: string) => {
    onVulnerabilityFix(vulnerabilityId);
    alert(`Starting fix for vulnerability ${vulnerabilityId}`);
  };
  
  const handleGenerateReport = () => {
    onReportGenerate();
    alert('Security report generated and downloaded!');
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--accent-danger)';
      case 'high': return 'var(--accent-warning)';
      case 'medium': return 'var(--accent-primary)';
      case 'low': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  };
  
  const selectedVulnData = selectedVulnerability ? vulnerabilities.find(v => v.id === selectedVulnerability) : null;
  
  return (
    <div className="security-audit">
      <div className="audit-header">
        <h3 className="audit-title">Security Audit</h3>
        <div className="audit-tabs">
          <button 
            className={`audit-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button 
            className={`audit-tab ${activeTab === 'vulnerabilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('vulnerabilities')}
          >
            <span className="tab-icon">⚠️</span>
            Vulnerabilities
          </button>
          <button 
            className={`audit-tab ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            <span className="tab-icon">📋</span>
            Compliance
          </button>
          <button 
            className={`audit-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <span className="tab-icon">📝</span>
            Logs
          </button>
        </div>
      </div>
      
      <div className="audit-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-metrics">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Total Vulnerabilities</div>
                    <div className="metric-trend negative">+2</div>
                  </div>
                  <div className="metric-value">{securityMetrics.totalVulnerabilities}</div>
                  <div className="metric-label">Last scan: {securityMetrics.lastScan}</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Critical Vulnerabilities</div>
                    <div className="metric-trend positive">-1</div>
                  </div>
                  <div className="metric-value">{securityMetrics.criticalVulnerabilities}</div>
                  <div className="metric-label">Require immediate attention</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Avg Remediation Time</div>
                    <div className="metric-trend positive">-0.5d</div>
                  </div>
                  <div className="metric-value">{securityMetrics.avgRemediationTime}</div>
                  <div className="metric-label">Target: &lt; 2 days</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-header">
                    <div className="metric-title">Compliance Score</div>
                    <div className="metric-trend positive">+3%</div>
                  </div>
                  <div className="metric-value">{securityMetrics.complianceScore}%</div>
                  <div className="metric-label">Target: &gt; 90%</div>
                </div>
              </div>
            </div>
            
            <div className="overview-actions">
              <div className="action-buttons">
                <button 
                  className="btn-primary"
                  onClick={handleStartScan}
                  disabled={scanInProgress}
                >
                  {scanInProgress ? (
                    <>
                      <span className="scanning-icon">🔍</span>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <span className="scan-icon">🔍</span>
                      Start Security Scan
                    </>
                  )}
                </button>
                <button className="btn-secondary" onClick={handleGenerateReport}>
                  <span className="report-icon">📄</span>
                  Generate Report
                </button>
                <button className="btn-secondary">
                  <span className="settings-icon">⚙️</span>
                  Security Settings
                </button>
              </div>
              
              <div className="scan-info">
                <div className="info-item">
                  <span className="info-icon">📊</span>
                  <span className="info-text">Scan coverage: {securityMetrics.scanCoverage}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⏱️</span>
                  <span className="info-text">Last scan: {securityMetrics.lastScan}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔒</span>
                  <span className="info-text">Real-time monitoring: Active</span>
                </div>
              </div>
            </div>
            
            <div className="overview-vulnerabilities">
              <div className="vulnerabilities-header">
                <h4 className="vulnerabilities-title">Recent Vulnerabilities</h4>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => setActiveTab('vulnerabilities')}
                >
                  View All
                </button>
              </div>
              
              <div className="vulnerabilities-list">
                {vulnerabilities.slice(0, 3).map(vuln => (
                  <div 
                    key={vuln.id}
                    className={`vulnerability-card severity-${vuln.severity}`}
                    onClick={() => {
                      setSelectedVulnerability(vuln.id);
                      setActiveTab('vulnerabilities');
                    }}
                  >
                    <div className="vulnerability-header">
                      <div className="vulnerability-title">{vuln.title}</div>
                      <div 
                        className={`severity-badge severity-${vuln.severity}`}
                        style={{ color: getSeverityColor(vuln.severity) }}
                      >
                        {vuln.severity}
                      </div>
                    </div>
                    
                    <div className="vulnerability-description">{vuln.description}</div>
                    
                    <div className="vulnerability-footer">
                      <div className="vulnerability-location">{vuln.location}</div>
                      <div className="vulnerability-status">{vuln.status}</div>
                      <div className="vulnerability-time">{vuln.discovered}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'vulnerabilities' && (
          <div className="vulnerabilities-section">
            <div className="section-header">
              <h4 className="section-title">Security Vulnerabilities</h4>
              <div className="section-actions">
                <button className="btn-secondary btn-sm">Filter</button>
                <button className="btn-secondary btn-sm">Export</button>
                <button className="btn-primary btn-sm" onClick={handleStartScan}>
                  New Scan
                </button>
              </div>
            </div>
            
            <div className="vulnerabilities-content">
              <div className="vulnerabilities-sidebar">
                <div className="sidebar-section">
                  <h5 className="section-title">Severity Filter</h5>
                  <div className="severity-filters">
                    <button className="severity-filter active">All</button>
                    <button className="severity-filter critical">Critical</button>
                    <button className="severity-filter high">High</button>
                    <button className="severity-filter medium">Medium</button>
                    <button className="severity-filter low">Low</button>
                  </div>
                </div>
                
                <div className="sidebar-section">
                  <h5 className="section-title">Status Filter</h5>
                  <div className="status-filters">
                    <button className="status-filter active">All</button>
                    <button className="status-filter open">Open</button>
                    <button className="status-filter in-progress">In Progress</button>
                    <button className="status-filter fixed">Fixed</button>
                  </div>
                </div>
                
                <div className="sidebar-section">
                  <h5 className="section-title">Quick Actions</h5>
                  <div className="quick-actions">
                    <button className="btn-secondary" onClick={handleGenerateReport}>
                      Generate Report
                    </button>
                    <button className="btn-secondary">
                      Schedule Scan
                    </button>
                    <button className="btn-secondary">
                      Alert Settings
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="vulnerabilities-main">
                <div className="vulnerabilities-table">
                  <div className="table-header">
                    <div className="header-cell title">Vulnerability</div>
                    <div className="header-cell severity">Severity</div>
                    <div className="header-cell category">Category</div>
                    <div className="header-cell status">Status</div>
                    <div className="header-cell discovered">Discovered</div>
                    <div className="header-cell actions">Actions</div>
                  </div>
                  
                  {vulnerabilities.map(vuln => (
                    <div 
                      key={vuln.id}
                      className={`table-row ${selectedVulnerability === vuln.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVulnerability(vuln.id)}
                    >
                      <div className="row-cell title">
                        <div className="vulnerability-name">{vuln.title}</div>
                        <div className="vulnerability-cve">{vuln.cve}</div>
                      </div>
                      <div className="row-cell severity">
                        <div 
                          className={`severity-indicator severity-${vuln.severity}`}
                          style={{ color: getSeverityColor(vuln.severity) }}
                        >
                          {vuln.severity}
                        </div>
                      </div>
                      <div className="row-cell category">
                        <div className="category-tag">{vuln.category}</div>
                      </div>
                      <div className="row-cell status">
                        <div className={`status-badge status-${vuln.status}`}>
                          {vuln.status}
                        </div>
                      </div>
                      <div className="row-cell discovered">
                        <div className="discovered-time">{vuln.discovered}</div>
                      </div>
                      <div className="row-cell actions">
                        <div className="action-buttons">
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={() => handleFixVulnerability(vuln.id)}
                          >
                            Fix
                          </button>
                          <button className="btn-secondary btn-sm">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedVulnData && (
                  <div className="vulnerability-detail">
                    <div className="detail-header">
                      <h5 className="detail-title">{selectedVulnData.title}</h5>
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => setSelectedVulnerability(null)}
                      >
                        Close
                      </button>
                    </div>
                    
                    <div className="detail-content">
                      <div className="detail-section">
                        <h6 className="section-title">Details</h6>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">CVE:</span>
                            <span className="detail-value">{selectedVulnData.cve}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Severity:</span>
                            <span className={`detail-value severity-${selectedVulnData.severity}`}>
                              {selectedVulnData.severity}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Impact:</span>
                            <span className="detail-value">{selectedVulnData.impact}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{selectedVulnData.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-section">
                        <h6 className="section-title">Description</h6>
                        <div className="detail-text">{selectedVulnData.description}</div>
                      </div>
                      
                      <div className="detail-section">
                        <h6 className="section-title">Remediation</h6>
                        <div className="remediation-text">{selectedVulnData.remediation}</div>
                      </div>
                      
                      <div className="detail-section">
                        <h6 className="section-title">Actions</h6>
                        <div className="action-buttons">
                          <button 
                            className="btn-primary"
                            onClick={() => handleFixVulnerability(selectedVulnData.id)}
                          >
                            Start Fix
                          </button>
                          <button className="btn-secondary">
                            Mark as False Positive
                          </button>
                          <button className="btn-secondary">
                            Schedule Fix
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'compliance' && (
          <div className="compliance-section">
            <div className="section-header">
              <h4 className="section-title">Compliance Checks</h4>
              <div className="section-actions">
                <button className="btn-primary">
                  Run Compliance Check
                </button>
                <button className="btn-secondary">
                  Export Compliance Report
                </button>
              </div>
            </div>
            
            <div className="compliance-grid">
              {complianceChecks.map(check => (
                <div key={check.id} className="compliance-card">
                  <div className="card-header">
                    <div className="card-title">{check.name}</div>
                    <div className={`card-status status-${check.status}`}>
                      {check.status}
                    </div>
                  </div>
                  
                  <div className="card-metrics">
                    <div className="metric-score">
                      <div className="score-value">{check.score}%</div>
                      <div className="score-label">Compliance Score</div>
                    </div>
                    
                    <div className="metric-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${check.score}%`,
                            background: check.score >= 90 ? 'var(--accent-success)' : 
                                       check.score >= 70 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="footer-time">Last check: {check.lastCheck}</div>
                    <div className="footer-actions">
                      <button className="btn-secondary btn-sm">
                        View Details
                      </button>
                      <button className="btn-secondary btn-sm">
                        Remediate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="compliance-info">
              <div className="info-card">
                <h5 className="info-title">Compliance Overview</h5>
                <div className="info-content">
                  <p className="info-text">
                    Regular compliance checks ensure your application meets industry standards
                    and regulatory requirements. Address any non-compliant items promptly.
                  </p>
                  <div className="info-tips">
                    <div className="tip">
                      <span className="tip-icon">📋</span>
                      <span className="tip-text">Maintain compliance documentation</span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">🔍</span>
                      <span className="tip-text">Schedule regular compliance audits</span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">⚡</span>
                      <span className="tip-text">Automate compliance checks where possible</span>
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
              <h4 className="section-title">Security Logs</h4>
              <div className="section-filters">
                <select className="log-filter">
                  <option>All Events</option>
                  <option>Authentication</option>
                  <option>Authorization</option>
                  <option>Data Access</option>
                </select>
                <button className="btn-secondary">
                  <span className="filter-icon">🔍</span>
                  Search Logs
                </button>
              </div>
            </div>
            
            <div className="logs-table">
              <div className="table-header">
                <div className="header-cell time">Time</div>
                <div className="header-cell event">Event</div>
                <div className="header-cell user">User</div>
                <div className="header-cell ip">IP Address</div>
                <div className="header-cell severity">Severity</div>
                <div className="header-cell details">Details</div>
              </div>
              
              <div className="table-row">
                <div className="row-cell time">14:30:22</div>
                <div className="row-cell event">Failed Login Attempt</div>
                <div className="row-cell user">admin</div>
                <div className="row-cell ip">192.168.1.100</div>
                <div className="row-cell severity">
                  <span className="severity-badge warning">Warning</span>
                </div>
                <div className="row-cell details">
                  <button className="btn-secondary btn-sm">View</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="row-cell time">14:25:15</div>
                <div className="row-cell event">Successful Login</div>
                <div className="row-cell user">alex.johnson</div>
                <div className="row-cell ip">10.0.0.45</div>
                <div className="row-cell severity">
                  <span className="severity-badge info">Info</span>
                </div>
                <div className="row-cell details">
                  <button className="btn-secondary btn-sm">View</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="row-cell time">14:20:08</div>
                <div className="row-cell event">Data Export</div>
                <div className="row-cell user">sam.wilson</div>
                <div className="row-cell ip">172.16.0.12</div>
                <div className="row-cell severity">
                  <span className="severity-badge info">Info</span>
                </div>
                <div className="row-cell details">
                  <button className="btn-secondary btn-sm">View</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="row-cell time">14:15:42</div>
                <div className="row-cell event">Access Denied</div>
                <div className="row-cell user">guest</div>
                <div className="row-cell ip">192.168.1.150</div>
                <div className="row-cell severity">
                  <span className="severity-badge warning">Warning</span>
                </div>
                <div className="row-cell details">
                  <button className="btn-secondary btn-sm">View</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="row-cell time">14:10:35</div>
                <div className="row-cell event">Password Change</div>
                <div className="row-cell user">jordan.lee</div>
                <div className="row-cell ip">10.0.0.78</div>
                <div className="row-cell severity">
                  <span className="severity-badge info">Info</span>
                </div>
                <div className="row-cell details">
                  <button className="btn-secondary btn-sm">View</button>
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
                  Configure Alerts
                </button>
              </div>
              
              <div className="logs-info">
                <div className="info-item">
                  <span className="info-icon">📊</span>
                  <span className="info-text">Log retention: 90 days</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔔</span>
                  <span className="info-text">Real-time alerting enabled</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📈</span>
                  <span className="info-text">SIEM integration available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="audit-footer">
        <div className="footer-stats">
          <div className="stat-card">
            <div className="stat-value">{securityMetrics.totalVulnerabilities}</div>
            <div className="stat-label">Total Vulnerabilities</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{securityMetrics.criticalVulnerabilities}</div>
            <div className="stat-label">Critical Issues</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{securityMetrics.complianceScore}%</div>
            <div className="stat-label">Compliance Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{securityMetrics.scanCoverage}</div>
            <div className="stat-label">Scan Coverage</div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-primary" onClick={handleStartScan}>
            Run Full Audit
          </button>
          <button className="btn-secondary" onClick={handleGenerateReport}>
            Export Security Report
          </button>
          <button className="btn-secondary">
            Security Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAudit;