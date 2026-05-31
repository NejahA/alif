import { useState } from 'react';

interface BlockchainVerificationProps {
  onTaskVerify: (taskId: string) => void;
  onAuditRequest: () => void;
  onSmartContractDeploy: (contract: any) => void;
}

const BlockchainVerification = ({ onTaskVerify, onAuditRequest, onSmartContractDeploy }: BlockchainVerificationProps) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'audit' | 'contracts'>('verification');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  
  const tasks = [
    {
      id: 'task-1',
      title: 'Design System Update',
      hash: '0x4a8f5c...b3d2e1',
      block: 1245678,
      timestamp: '2024-01-15 14:30:22',
      verified: true,
      transactions: 3,
      gasUsed: '0.0021 ETH'
    },
    {
      id: 'task-2',
      title: 'API Rate Limiting',
      hash: '0x9b2c4d...f7a8e9',
      block: 1245679,
      timestamp: '2024-01-15 14:25:15',
      verified: true,
      transactions: 2,
      gasUsed: '0.0018 ETH'
    },
    {
      id: 'task-3',
      title: 'Database Migration',
      hash: '0x3c5d7e...a9b8c7',
      block: 1245680,
      timestamp: '2024-01-15 14:20:08',
      verified: false,
      transactions: 5,
      gasUsed: '0.0035 ETH'
    },
    {
      id: 'task-4',
      title: 'Authentication Refactor',
      hash: '0x8d1e2f...c4b5a6',
      block: 1245681,
      timestamp: '2024-01-15 14:15:42',
      verified: true,
      transactions: 4,
      gasUsed: '0.0028 ETH'
    },
    {
      id: 'task-5',
      title: 'Mobile Responsive Fixes',
      hash: '0x7a9b8c...d5e6f7',
      block: 1245682,
      timestamp: '2024-01-15 14:10:35',
      verified: false,
      transactions: 2,
      gasUsed: '0.0015 ETH'
    }
  ];
  
  const smartContracts = [
    {
      id: 'contract-1',
      name: 'Task Verification',
      address: '0x1234...5678',
      network: 'Ethereum',
      type: 'verification',
      deployed: '2 days ago',
      transactions: 24,
      balance: '0.5 ETH'
    },
    {
      id: 'contract-2',
      name: 'Team Rewards',
      address: '0x8765...4321',
      network: 'Polygon',
      type: 'rewards',
      deployed: '1 week ago',
      transactions: 156,
      balance: '2.8 ETH'
    },
    {
      id: 'contract-3',
      name: 'Audit Trail',
      address: '0xabcd...efgh',
      network: 'Arbitrum',
      type: 'audit',
      deployed: '3 days ago',
      transactions: 89,
      balance: '1.2 ETH'
    }
  ];
  
  const auditLogs = [
    {
      id: 'log-1',
      action: 'Task Verified',
      user: 'Alex Johnson',
      hash: '0x4a8f5c...b3d2e1',
      timestamp: '2024-01-15 14:30:22',
      block: 1245678,
      status: 'confirmed'
    },
    {
      id: 'log-2',
      action: 'Contract Deployed',
      user: 'Sam Wilson',
      hash: '0x9b2c4d...f7a8e9',
      timestamp: '2024-01-15 14:25:15',
      block: 1245679,
      status: 'confirmed'
    },
    {
      id: 'log-3',
      action: 'Rewards Distributed',
      user: 'Jordan Lee',
      hash: '0x3c5d7e...a9b8c7',
      timestamp: '2024-01-15 14:20:08',
      block: 1245680,
      status: 'pending'
    },
    {
      id: 'log-4',
      action: 'Audit Request',
      user: 'Taylor Swift',
      hash: '0x8d1e2f...c4b5a6',
      timestamp: '2024-01-15 14:15:42',
      block: 1245681,
      status: 'confirmed'
    },
    {
      id: 'log-5',
      action: 'Gas Fee Updated',
      user: 'Casey Kim',
      hash: '0x7a9b8c...d5e6f7',
      timestamp: '2024-01-15 14:10:35',
      block: 1245682,
      status: 'confirmed'
    }
  ];
  
  const handleVerifyTask = (taskId: string) => {
    setVerificationInProgress(true);
    onTaskVerify(taskId);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setVerificationInProgress(false);
      alert(`Task ${taskId} verified on blockchain!`);
    }, 3000);
  };
  
  const handleRequestAudit = () => {
    onAuditRequest();
    alert('Audit request submitted to blockchain!');
  };
  
  const handleDeployContract = () => {
    const newContract = {
      id: `contract-${Date.now()}`,
      name: 'New Smart Contract',
      address: `0x${Math.random().toString(16).substring(2, 10)}...`,
      network: 'Ethereum',
      type: 'custom',
      deployed: 'Just now',
      transactions: 0,
      balance: '0 ETH'
    };
    
    onSmartContractDeploy(newContract);
    alert('Smart contract deployment initiated!');
  };
  
  const selectedTaskData = selectedTask ? tasks.find(t => t.id === selectedTask) : null;
  
  return (
    <div className="blockchain-verification">
      <div className="verification-header">
        <h3 className="verification-title">Blockchain Verification</h3>
        <div className="verification-tabs">
          <button 
            className={`verification-tab ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <span className="tab-icon">🔗</span>
            Verification
          </button>
          <button 
            className={`verification-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <span className="tab-icon">📋</span>
            Audit Trail
          </button>
          <button 
            className={`verification-tab ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            <span className="tab-icon">📄</span>
            Smart Contracts
          </button>
        </div>
      </div>
      
      <div className="verification-content">
        {activeTab === 'verification' && (
          <div className="verification-section">
            <div className="section-header">
              <h4 className="section-title">Task Verification</h4>
              <div className="section-actions">
                <button 
                  className="btn-primary"
                  onClick={() => selectedTask && handleVerifyTask(selectedTask)}
                  disabled={!selectedTask || verificationInProgress}
                >
                  {verificationInProgress ? 'Verifying...' : 'Verify Selected Task'}
                </button>
                <button className="btn-secondary" onClick={handleRequestAudit}>
                  Request Audit
                </button>
              </div>
            </div>
            
            <div className="verification-grid">
              <div className="tasks-list">
                <div className="list-header">
                  <h5 className="list-title">Tasks</h5>
                  <div className="list-stats">
                    <span className="stat-badge verified">{tasks.filter(t => t.verified).length} verified</span>
                    <span className="stat-badge total">{tasks.length} total</span>
                  </div>
                </div>
                
                <div className="tasks-table">
                  <div className="table-header">
                    <div className="header-cell task">Task</div>
                    <div className="header-cell hash">Hash</div>
                    <div className="header-cell block">Block</div>
                    <div className="header-cell verified">Verified</div>
                    <div className="header-cell actions">Actions</div>
                  </div>
                  
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      className={`table-row ${selectedTask === task.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTask(task.id)}
                    >
                      <div className="row-cell task">
                        <div className="task-name">{task.title}</div>
                        <div className="task-time">{task.timestamp}</div>
                      </div>
                      <div className="row-cell hash">
                        <div className="hash-value">{task.hash}</div>
                      </div>
                      <div className="row-cell block">
                        <div className="block-number">{task.block.toLocaleString()}</div>
                      </div>
                      <div className="row-cell verified">
                        <div className={`verification-status ${task.verified ? 'verified' : 'unverified'}`}>
                          {task.verified ? '✅ Verified' : '❌ Unverified'}
                        </div>
                      </div>
                      <div className="row-cell actions">
                        <div className="action-buttons">
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={() => handleVerifyTask(task.id)}
                            disabled={task.verified || verificationInProgress}
                          >
                            {task.verified ? 'Verified' : 'Verify'}
                          </button>
                          <button className="btn-secondary btn-sm">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedTaskData && (
                <div className="task-detail">
                  <div className="detail-header">
                    <h5 className="detail-title">{selectedTaskData.title}</h5>
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => setSelectedTask(null)}
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="detail-content">
                    <div className="detail-section">
                      <h6 className="section-title">Blockchain Details</h6>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Transaction Hash:</span>
                          <span className="detail-value hash">{selectedTaskData.hash}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Block Number:</span>
                          <span className="detail-value">{selectedTaskData.block.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Timestamp:</span>
                          <span className="detail-value">{selectedTaskData.timestamp}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Gas Used:</span>
                          <span className="detail-value">{selectedTaskData.gasUsed}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Transactions:</span>
                          <span className="detail-value">{selectedTaskData.transactions}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-section">
                      <h6 className="section-title">Verification Status</h6>
                      <div className="verification-status-card">
                        <div className={`status-indicator ${selectedTaskData.verified ? 'verified' : 'unverified'}`}>
                          {selectedTaskData.verified ? '✅ Verified on Blockchain' : '❌ Not Verified'}
                        </div>
                        <div className="status-description">
                          {selectedTaskData.verified 
                            ? 'This task has been permanently recorded on the blockchain and cannot be altered.'
                            : 'This task has not been verified on the blockchain yet.'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-section">
                      <h6 className="section-title">Actions</h6>
                      <div className="action-buttons">
                        <button 
                          className="btn-primary"
                          onClick={() => handleVerifyTask(selectedTaskData.id)}
                          disabled={selectedTaskData.verified || verificationInProgress}
                        >
                          {selectedTaskData.verified ? 'Already Verified' : 'Verify on Blockchain'}
                        </button>
                        <button className="btn-secondary">
                          View on Explorer
                        </button>
                        <button className="btn-secondary">
                          Export Proof
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'audit' && (
          <div className="audit-section">
            <div className="section-header">
              <h4 className="section-title">Audit Trail</h4>
              <div className="section-actions">
                <button className="btn-primary" onClick={handleRequestAudit}>
                  New Audit Request
                </button>
                <button className="btn-secondary">
                  Export Audit Log
                </button>
              </div>
            </div>
            
            <div className="audit-logs">
              <div className="logs-header">
                <h5 className="logs-title">Recent Blockchain Activity</h5>
                <div className="logs-filter">
                  <select className="filter-select">
                    <option>All Actions</option>
                    <option>Verifications</option>
                    <option>Contracts</option>
                    <option>Rewards</option>
                  </select>
                </div>
              </div>
              
              <div className="logs-list">
                {auditLogs.map(log => (
                  <div key={log.id} className="log-item">
                    <div className="log-header">
                      <div className="log-action">{log.action}</div>
                      <div className={`log-status status-${log.status}`}>
                        {log.status}
                      </div>
                    </div>
                    
                    <div className="log-details">
                      <div className="log-user">
                        <span className="label">User:</span>
                        <span className="value">{log.user}</span>
                      </div>
                      <div className="log-hash">
                        <span className="label">Hash:</span>
                        <span className="value">{log.hash}</span>
                      </div>
                      <div className="log-block">
                        <span className="label">Block:</span>
                        <span className="value">{log.block.toLocaleString()}</span>
                      </div>
                      <div className="log-time">
                        <span className="label">Time:</span>
                        <span className="value">{log.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="log-actions">
                      <button className="btn-secondary btn-sm">
                        View Transaction
                      </button>
                      <button className="btn-secondary btn-sm">
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="audit-stats">
              <div className="stats-card">
                <h5 className="stats-title">Audit Statistics</h5>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{auditLogs.length}</div>
                    <div className="stat-label">Total Logs</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{auditLogs.filter(l => l.status === 'confirmed').length}</div>
                    <div className="stat-label">Confirmed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{auditLogs.filter(l => l.status === 'pending').length}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">24h</div>
                    <div className="stat-label">Avg Confirmation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'contracts' && (
          <div className="contracts-section">
            <div className="section-header">
              <h4 className="section-title">Smart Contracts</h4>
              <div className="section-actions">
                <button className="btn-primary" onClick={handleDeployContract}>
                  Deploy New Contract
                </button>
                <button className="btn-secondary">
                  Contract Templates
                </button>
              </div>
            </div>
            
            <div className="contracts-grid">
              {smartContracts.map(contract => (
                <div key={contract.id} className="contract-card">
                  <div className="card-header">
                    <div className="card-title">{contract.name}</div>
                    <div className={`card-network network-${contract.network.toLowerCase()}`}>
                      {contract.network}
                    </div>
                  </div>
                  
                  <div className="card-address">
                    <span className="address-label">Address:</span>
                    <span className="address-value">{contract.address}</span>
                  </div>
                  
                  <div className="card-metrics">
                    <div className="metric">
                      <div className="metric-label">Type</div>
                      <div className="metric-value">{contract.type}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Deployed</div>
                      <div className="metric-value">{contract.deployed}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Transactions</div>
                      <div className="metric-value">{contract.transactions}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Balance</div>
                      <div className="metric-value">{contract.balance}</div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="btn-primary btn-sm">
                      Interact
                    </button>
                    <button className="btn-secondary btn-sm">
                      View Code
                    </button>
                    <button className="btn-secondary btn-sm">
                      Monitor
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="contracts-info">
              <div className="info-card">
                <h5 className="info-title">About Smart Contracts</h5>
                <div className="info-content">
                  <p className="info-text">
                    Smart contracts automate task verification, reward distribution,
                    and audit trails on the blockchain. They are immutable, transparent,
                    and execute automatically when conditions are met.
                  </p>
                  <div className="info-tips">
                    <div className="tip">
                      <span className="tip-icon">🔒</span>
                      <span className="tip-text">Contracts are immutable once deployed</span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">⚡</span>
                      <span className="tip-text">Execute automatically without intermediaries</span>
                    </div>
                    <div className="tip">
                      <span className="tip-icon">👁️</span>
                      <span className="tip-text">All transactions are publicly verifiable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="verification-footer">
        <div className="footer-info">
          <div className="info-card">
            <h5 className="info-title">Blockchain Benefits</h5>
            <div className="info-content">
              <div className="benefit">
                <div className="benefit-icon">🔒</div>
                <div className="benefit-content">
                  <div className="benefit-title">Immutable Records</div>
                  <div className="benefit-text">Once verified, tasks cannot be altered or deleted</div>
                </div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">👁️</div>
                <div className="benefit-content">
                  <div className="benefit-title">Transparent Audit Trail</div>
                  <div className="benefit-text">All actions are publicly verifiable on the blockchain</div>
                </div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">⚡</div>
                <div className="benefit-content">
                  <div className="benefit-title">Automated Execution</div>
                  <div className="benefit-text">Smart contracts execute automatically when conditions are met</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-primary">
            Connect Wallet
          </button>
          <button className="btn-secondary">
            Network Settings
          </button>
          <button className="btn-secondary">
            Gas Fee Optimization
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockchainVerification;