import { useState, useEffect } from 'react';
import type { Task } from '../types';

interface MLPredictionsProps {
  tasks: Task[];
  onPredictionAccept: (prediction: any) => void;
  onPredictionReject: (predictionId: string) => void;
}

const MLPredictions = ({ tasks, onPredictionAccept, onPredictionReject }: MLPredictionsProps) => {
  const [activeTab, setActiveTab] = useState<'completion' | 'priority' | 'bottlenecks' | 'team'>('completion');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState(87.5);
  const [isTraining, setIsTraining] = useState(false);
  
  useEffect(() => {
    // Generate predictions based on tasks
    const generatedPredictions = [
      {
        id: 'pred-1',
        type: 'completion',
        title: 'Task Completion Prediction',
        description: 'Task "Design System Update" will be completed in 2.3 days',
        confidence: 92,
        actualValue: '2.3 days',
        predictedValue: '2.1 days',
        impact: 'high',
        recommendation: 'Allocate additional resources to meet deadline'
      },
      {
        id: 'pred-2',
        type: 'priority',
        title: 'Priority Adjustment',
        description: 'Task "API Rate Limiting" should be upgraded to high priority',
        confidence: 85,
        actualValue: 'medium',
        predictedValue: 'high',
        impact: 'medium',
        recommendation: 'Change priority to prevent security risks'
      },
      {
        id: 'pred-3',
        type: 'bottlenecks',
        title: 'Potential Bottleneck',
        description: 'Database migration task may cause delays in dependent tasks',
        confidence: 78,
        actualValue: 'low risk',
        predictedValue: 'high risk',
        impact: 'high',
        recommendation: 'Break down into smaller subtasks'
      },
      {
        id: 'pred-4',
        type: 'team',
        title: 'Team Workload',
        description: 'Alex Johnson is approaching capacity (92% utilization)',
        confidence: 91,
        actualValue: '92%',
        predictedValue: '95%',
        impact: 'medium',
        recommendation: 'Redistribute 2 tasks to other team members'
      },
      {
        id: 'pred-5',
        type: 'completion',
        title: 'Sprint Completion',
        description: 'Current sprint will be 85% complete by deadline',
        confidence: 88,
        actualValue: '85%',
        predictedValue: '90%',
        impact: 'low',
        recommendation: 'Focus on high-priority tasks first'
      }
    ];
    
    setPredictions(generatedPredictions);
  }, [tasks]);
  
  const filteredPredictions = predictions.filter(p => 
    activeTab === 'completion' ? p.type === 'completion' :
    activeTab === 'priority' ? p.type === 'priority' :
    activeTab === 'bottlenecks' ? p.type === 'bottlenecks' :
    p.type === 'team'
  );
  
  const handleAcceptPrediction = (predictionId: string) => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (prediction) {
      onPredictionAccept(prediction);
      alert(`Prediction accepted: ${prediction.title}`);
    }
  };
  
  const handleRejectPrediction = (predictionId: string) => {
    onPredictionReject(predictionId);
    alert(`Prediction rejected`);
  };
  
  const handleRetrainModel = () => {
    setIsTraining(true);
    
    // Simulate training
    setTimeout(() => {
      setIsTraining(false);
      setModelAccuracy(prev => Math.min(95, prev + 2.5));
      alert('Model retrained successfully! Accuracy improved.');
    }, 2000);
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'var(--accent-success)';
    if (confidence >= 75) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'var(--accent-danger)';
      case 'medium': return 'var(--accent-warning)';
      case 'low': return 'var(--accent-success)';
      default: return 'var(--text-secondary)';
    }
  };
  
  return (
    <div className="ml-predictions">
      <div className="predictions-header">
        <h3 className="predictions-title">ML Predictions</h3>
        <div className="predictions-stats">
          <span className="stat-badge accuracy">{modelAccuracy}% accuracy</span>
          <span className="stat-badge predictions">{predictions.length} predictions</span>
          <span className="stat-badge accepted">{predictions.filter(p => p.accepted).length} accepted</span>
        </div>
      </div>
      
      <div className="predictions-content">
        <div className="predictions-sidebar">
          <div className="sidebar-section">
            <h4 className="section-title">Prediction Types</h4>
            <div className="prediction-tabs">
              <button 
                className={`prediction-tab ${activeTab === 'completion' ? 'active' : ''}`}
                onClick={() => setActiveTab('completion')}
              >
                <span className="tab-icon">📅</span>
                Completion
              </button>
              <button 
                className={`prediction-tab ${activeTab === 'priority' ? 'active' : ''}`}
                onClick={() => setActiveTab('priority')}
              >
                <span className="tab-icon">🎯</span>
                Priority
              </button>
              <button 
                className={`prediction-tab ${activeTab === 'bottlenecks' ? 'active' : ''}`}
                onClick={() => setActiveTab('bottlenecks')}
              >
                <span className="tab-icon">⚠️</span>
                Bottlenecks
              </button>
              <button 
                className={`prediction-tab ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                <span className="tab-icon">👥</span>
                Team
              </button>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Model Performance</h4>
            <div className="model-metrics">
              <div className="metric">
                <div className="metric-label">Accuracy</div>
                <div className="metric-value">{modelAccuracy}%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ 
                      width: `${modelAccuracy}%`,
                      background: modelAccuracy >= 90 ? 'var(--accent-success)' : 
                                 modelAccuracy >= 80 ? 'var(--accent-warning)' : 'var(--accent-primary)'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Precision</div>
                <div className="metric-value">84.2%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: '84.2%', background: 'var(--accent-warning)' }}
                  ></div>
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Recall</div>
                <div className="metric-value">89.7%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: '89.7%', background: 'var(--accent-success)' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Quick Actions</h4>
            <div className="quick-actions">
              <button 
                className="btn-primary"
                onClick={handleRetrainModel}
                disabled={isTraining}
              >
                {isTraining ? 'Training...' : 'Retrain Model'}
              </button>
              <button className="btn-secondary">
                Export Predictions
              </button>
              <button className="btn-secondary">
                Model Settings
              </button>
            </div>
          </div>
        </div>
        
        <div className="predictions-main">
          <div className="predictions-list">
            <div className="list-header">
              <h4 className="list-title">
                {activeTab === 'completion' ? 'Completion Predictions' :
                 activeTab === 'priority' ? 'Priority Predictions' :
                 activeTab === 'bottlenecks' ? 'Bottleneck Predictions' : 'Team Predictions'}
              </h4>
              <div className="list-count">{filteredPredictions.length} predictions</div>
            </div>
            
            <div className="predictions-grid">
              {filteredPredictions.map(prediction => (
                <div key={prediction.id} className="prediction-card">
                  <div className="card-header">
                    <div className="card-title">{prediction.title}</div>
                    <div 
                      className="confidence-badge"
                      style={{ color: getConfidenceColor(prediction.confidence) }}
                    >
                      {prediction.confidence}% confidence
                    </div>
                  </div>
                  
                  <div className="card-description">{prediction.description}</div>
                  
                  <div className="card-metrics">
                    <div className="metric-comparison">
                      <div className="metric-item">
                        <div className="metric-label">Actual</div>
                        <div className="metric-value">{prediction.actualValue}</div>
                      </div>
                      <div className="metric-arrow">→</div>
                      <div className="metric-item">
                        <div className="metric-label">Predicted</div>
                        <div className="metric-value">{prediction.predictedValue}</div>
                      </div>
                    </div>
                    
                    <div className="impact-indicator">
                      <div className="impact-label">Impact:</div>
                      <div 
                        className="impact-value"
                        style={{ color: getImpactColor(prediction.impact) }}
                      >
                        {prediction.impact}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-recommendation">
                    <div className="recommendation-label">Recommendation:</div>
                    <div className="recommendation-text">{prediction.recommendation}</div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => handleAcceptPrediction(prediction.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => handleRejectPrediction(prediction.id)}
                    >
                      Reject
                    </button>
                    <button className="btn-secondary btn-sm">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="predictions-insights">
            <div className="insights-card">
              <h5 className="insights-title">ML Insights</h5>
              <div className="insights-content">
                <div className="insight">
                  <div className="insight-icon">🤖</div>
                  <div className="insight-text">
                    Our ML model analyzes historical task data, team performance patterns,
                    and completion rates to generate accurate predictions.
                  </div>
                </div>
                
                <div className="insight">
                  <div className="insight-icon">📊</div>
                  <div className="insight-text">
                    Model trained on {tasks.length} tasks and historical patterns.
                    Continuously improves with more data.
                  </div>
                </div>
                
                <div className="insight">
                  <div className="insight-icon">🎯</div>
                  <div className="insight-text">
                    Predictions help with resource allocation, deadline management,
                    and identifying potential issues before they occur.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="insights-card">
              <h5 className="insights-title">Prediction Accuracy</h5>
              <div className="accuracy-chart">
                <div className="chart-placeholder">
                  <div className="placeholder-text">Prediction accuracy over time chart</div>
                </div>
              </div>
              
              <div className="accuracy-stats">
                <div className="stat-item">
                  <div className="stat-value">92%</div>
                  <div className="stat-label">Completion Predictions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">85%</div>
                  <div className="stat-label">Priority Predictions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">78%</div>
                  <div className="stat-label">Bottleneck Predictions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="predictions-footer">
        <div className="footer-info">
          <div className="info-card">
            <h5 className="info-title">How Predictions Work</h5>
            <div className="info-content">
              <p className="info-text">
                Our machine learning model analyzes patterns in task completion times,
                team workload, priority changes, and historical data to generate
                accurate predictions about future outcomes.
              </p>
              <div className="info-tips">
                <div className="tip">
                  <span className="tip-icon">📈</span>
                  <span className="tip-text">More data improves prediction accuracy</span>
                </div>
                <div className="tip">
                  <span className="tip-icon">🔄</span>
                  <span className="tip-text">Model retrains automatically weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-primary" onClick={handleRetrainModel}>
            Improve Model Accuracy
          </button>
          <button className="btn-secondary">
            Export All Predictions
          </button>
          <button className="btn-secondary">
            Configure ML Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MLPredictions;