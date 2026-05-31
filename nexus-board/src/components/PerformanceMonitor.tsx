import { useState, useEffect } from 'react';
import type { Task } from '../types';

interface PerformanceMonitorProps {
  tasks: Task[];
}

const PerformanceMonitor = ({ tasks }: PerformanceMonitorProps) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [metrics, setMetrics] = useState({
    completionRate: 0,
    avgCompletionTime: 0,
    productivityScore: 0,
    teamVelocity: 0
  });
  
  useEffect(() => {
    // Calculate metrics based on tasks
    const completedTasks = tasks.filter(t => t.status === 'done');
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Calculate average completion time (simplified)
    let totalCompletionTime = 0;
    completedTasks.forEach(task => {
      const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
      totalCompletionTime += completionTime;
    });
    const avgCompletionTime = completedTasks.length > 0 ? totalCompletionTime / completedTasks.length : 0;
    
    // Productivity score (simplified calculation)
    const productivityScore = Math.min(100, completionRate * 0.7 + (completedTasks.length > 0 ? 30 : 0));
    
    // Team velocity (tasks completed per week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCompleted = completedTasks.filter(t => t.updatedAt > oneWeekAgo);
    const teamVelocity = recentCompleted.length;
    
    setMetrics({
      completionRate,
      avgCompletionTime: avgCompletionTime / (1000 * 60 * 60 * 24), // Convert to days
      productivityScore,
      teamVelocity
    });
  }, [tasks, timeRange]);
  
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'var(--accent-success)' };
    if (score >= 60) return { level: 'Good', color: 'var(--accent-warning)' };
    return { level: 'Needs Improvement', color: 'var(--accent-danger)' };
  };
  
  const performanceLevel = getPerformanceLevel(metrics.productivityScore);
  
  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3 className="monitor-title">Performance Monitor</h3>
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === 'day' ? 'active' : ''}`}
            onClick={() => setTimeRange('day')}
          >
            Day
          </button>
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
        </div>
      </div>
      
      <div className="performance-overview">
        <div className="overview-card">
          <div className="overview-header">
            <div className="overview-title">Overall Performance</div>
            <div className="performance-level" style={{ color: performanceLevel.color }}>
              {performanceLevel.level}
            </div>
          </div>
          <div className="performance-score">
            <div className="score-circle">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="var(--border-color)" 
                  strokeWidth="12"
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke={performanceLevel.color}
                  strokeWidth="12"
                  strokeDasharray={`${(metrics.productivityScore / 100) * 339.292} 339.292`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-value">{metrics.productivityScore.toFixed(1)}</div>
            </div>
          </div>
          <div className="performance-trend">
            <span className="trend-icon">📈</span>
            <span className="trend-text">+5.2% from last week</span>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Completion Rate</div>
              <div className="metric-trend positive">+2.1%</div>
            </div>
            <div className="metric-value">{metrics.completionRate.toFixed(1)}%</div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${metrics.completionRate}%`,
                    background: metrics.completionRate >= 70 ? 'var(--accent-success)' : 
                               metrics.completionRate >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Avg Completion Time</div>
              <div className="metric-trend negative">-1.5d</div>
            </div>
            <div className="metric-value">{metrics.avgCompletionTime.toFixed(1)} days</div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(100, metrics.avgCompletionTime * 10)}%`,
                    background: metrics.avgCompletionTime <= 3 ? 'var(--accent-success)' : 
                               metrics.avgCompletionTime <= 7 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Team Velocity</div>
              <div className="metric-trend positive">+3</div>
            </div>
            <div className="metric-value">{metrics.teamVelocity} tasks/week</div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(100, metrics.teamVelocity * 10)}%`,
                    background: metrics.teamVelocity >= 10 ? 'var(--accent-success)' : 
                               metrics.teamVelocity >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Workload Balance</div>
              <div className="metric-trend neutral">±0</div>
            </div>
            <div className="metric-value">78%</div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: '78%',
                    background: 'var(--accent-primary)'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="performance-details">
        <div className="detail-section">
          <h4 className="detail-title">Performance Insights</h4>
          <div className="insights-list">
            <div className="insight-item positive">
              <div className="insight-icon">✅</div>
              <div className="insight-content">
                <div className="insight-text">Completion rate improved by 5.2% this week</div>
                <div className="insight-detail">Keep up the good work!</div>
              </div>
            </div>
            <div className="insight-item warning">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <div className="insight-text">High priority tasks taking longer than expected</div>
                <div className="insight-detail">Consider reallocating resources</div>
              </div>
            </div>
            <div className="insight-item positive">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <div className="insight-text">Team collaboration increased by 15%</div>
                <div className="insight-detail">More comments and task assignments</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h4 className="detail-title">Recommendations</h4>
          <div className="recommendations-list">
            <div className="recommendation">
              <div className="recommendation-icon">🎯</div>
              <div className="recommendation-content">
                <div className="recommendation-text">Focus on completing overdue tasks</div>
                <div className="recommendation-action">
                  <button className="btn-secondary btn-sm">View Overdue</button>
                </div>
              </div>
            </div>
            <div className="recommendation">
              <div className="recommendation-icon">⚡</div>
              <div className="recommendation-content">
                <div className="recommendation-text">Optimize team capacity allocation</div>
                <div className="recommendation-action">
                  <button className="btn-secondary btn-sm">Adjust Capacity</button>
                </div>
              </div>
            </div>
            <div className="recommendation">
              <div className="recommendation-icon">📈</div>
              <div className="recommendation-content">
                <div className="recommendation-text">Set weekly performance goals</div>
                <div className="recommendation-action">
                  <button className="btn-secondary btn-sm">Set Goals</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="performance-export">
        <div className="export-options">
          <button className="btn-secondary">
            <span className="export-icon">📊</span>
            Export Report
          </button>
          <button className="btn-secondary">
            <span className="export-icon">🔔</span>
            Set Alerts
          </button>
          <button className="btn-secondary">
            <span className="export-icon">📋</span>
            Compare History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;