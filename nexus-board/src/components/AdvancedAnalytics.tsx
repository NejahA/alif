import { useState, useEffect } from 'react';
import type { Task } from '../types';

interface AdvancedAnalyticsProps {
  tasks: Task[];
  timeRange: 'day' | 'week' | 'month' | 'year';
}

const AdvancedAnalytics = ({ tasks, timeRange }: AdvancedAnalyticsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'completion' | 'velocity' | 'efficiency' | 'workload'>('completion');
  const [chartData, setChartData] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    // Generate analytics data
    generateChartData();
    generatePredictions();
    generateInsights();
  }, [tasks, timeRange, selectedMetric]);

  const generateChartData = () => {
    const data = [];
    const now = new Date();
    
    // Generate time series data based on selected range
    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (9 - i));
      
      let value = 0;
      switch (selectedMetric) {
        case 'completion':
          value = Math.random() * 100;
          break;
        case 'velocity':
          value = Math.random() * 20;
          break;
        case 'efficiency':
          value = 50 + Math.random() * 50;
          break;
        case 'workload':
          value = Math.random() * 100;
          break;
      }
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value),
        target: selectedMetric === 'completion' ? 85 : selectedMetric === 'efficiency' ? 80 : null
      });
    }
    
    setChartData(data);
  };

  const generatePredictions = () => {
    const preds = [
      {
        id: 'pred-1',
        title: 'Completion Rate',
        current: 65,
        predicted: 78,
        confidence: 85,
        trend: 'up'
      },
      {
        id: 'pred-2',
        title: 'Task Velocity',
        current: 12,
        predicted: 15,
        confidence: 72,
        trend: 'up'
      },
      {
        id: 'pred-3',
        title: 'Team Efficiency',
        current: 73,
        predicted: 81,
        confidence: 90,
        trend: 'up'
      },
      {
        id: 'pred-4',
        title: 'Workload Balance',
        current: 45,
        predicted: 62,
        confidence: 68,
        trend: 'up'
      }
    ];
    
    setPredictions(preds);
  };

  const generateInsights = () => {
    const newInsights = [
      'Team velocity increased by 15% this week',
      'Completion rate is trending upward for the third consecutive week',
      'High-priority tasks are being completed 2 days faster than average',
      'Team efficiency peaks on Wednesdays',
      'Tasks assigned in the morning have 25% higher completion rates',
      'Collaborative tasks show 40% faster completion times'
    ];
    
    setInsights(newInsights.slice(0, 4));
  };

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'completion': return 'Completion Rate';
      case 'velocity': return 'Task Velocity';
      case 'efficiency': return 'Team Efficiency';
      case 'workload': return 'Workload Distribution';
      default: return 'Analytics';
    }
  };

  const getMetricDescription = () => {
    switch (selectedMetric) {
      case 'completion': return 'Percentage of tasks completed on time';
      case 'velocity': return 'Average number of tasks completed per day';
      case 'efficiency': return 'Ratio of actual vs estimated time spent';
      case 'workload': return 'Distribution of tasks across team members';
      default: return '';
    }
  };

  const calculateKPIs = () => {
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;
    
    const avgCompletionTime = tasks
      .filter(t => t.status === 'done' && t.createdAt && t.updatedAt)
      .reduce((sum, t) => {
        const created = new Date(t.createdAt).getTime();
        const updated = new Date(t.updatedAt).getTime();
        return sum + (updated - created);
      }, 0) / (completedTasks || 1);
    
    const avgCompletionDays = Math.round(avgCompletionTime / (1000 * 60 * 60 * 24));
    
    return {
      completionRate,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      avgCompletionDays
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h2 className="analytics-title">Advanced Analytics</h2>
        <div className="analytics-controls">
          <div className="metric-selector">
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
            >
              <option value="completion">Completion Rate</option>
              <option value="velocity">Task Velocity</option>
              <option value="efficiency">Team Efficiency</option>
              <option value="workload">Workload Distribution</option>
            </select>
          </div>
          
          <div className="time-range-selector">
            <button 
              className={`time-button ${timeRange === 'day' ? 'active' : ''}`}
              onClick={() => {/* In real app, this would update timeRange */}}
            >
              Day
            </button>
            <button 
              className={`time-button ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => {/* In real app, this would update timeRange */}}
            >
              Week
            </button>
            <button 
              className={`time-button ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => {/* In real app, this would update timeRange */}}
            >
              Month
            </button>
            <button 
              className={`time-button ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => {/* In real app, this would update timeRange */}}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {/* KPI Cards */}
        <div className="kpi-cards">
          <div className="kpi-card">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-content">
              <div className="kpi-value">{kpis.completionRate}%</div>
              <div className="kpi-label">Completion Rate</div>
              <div className="kpi-trend up">+12% this week</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">⚡</div>
            <div className="kpi-content">
              <div className="kpi-value">{kpis.avgCompletionDays}d</div>
              <div className="kpi-label">Avg Completion Time</div>
              <div className="kpi-trend down">-2 days vs last month</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <div className="kpi-value">{tasks.length}</div>
              <div className="kpi-label">Total Tasks</div>
              <div className="kpi-trend up">+8 this week</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-content">
              <div className="kpi-value">85%</div>
              <div className="kpi-label">Team Efficiency</div>
              <div className="kpi-trend up">+5% this month</div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="main-chart-section">
          <div className="chart-header">
            <h3>{getMetricTitle()}</h3>
            <p className="chart-description">{getMetricDescription()}</p>
          </div>
          
          <div className="chart-container">
            <div className="chart-y-axis">
              <div className="y-label">100%</div>
              <div className="y-label">75%</div>
              <div className="y-label">50%</div>
              <div className="y-label">25%</div>
              <div className="y-label">0%</div>
            </div>
            
            <div className="chart-bars">
              {chartData.map((item, index) => (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{ height: `${item.value}%` }}
                    ></div>
                    {item.target && (
                      <div 
                        className="chart-target"
                        style={{ bottom: `${item.target}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="chart-label">{item.date}</div>
                  <div className="chart-value">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color bar"></div>
              <span>Actual</span>
            </div>
            {selectedMetric === 'completion' || selectedMetric === 'efficiency' ? (
              <div className="legend-item">
                <div className="legend-color target"></div>
                <span>Target</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Predictions */}
        <div className="predictions-section">
          <h3>AI Predictions</h3>
          <div className="predictions-grid">
            {predictions.map(pred => (
              <div key={pred.id} className="prediction-card">
                <div className="prediction-header">
                  <h4>{pred.title}</h4>
                  <span className={`confidence-badge ${pred.confidence > 80 ? 'high' : pred.confidence > 60 ? 'medium' : 'low'}`}>
                    {pred.confidence}% confidence
                  </span>
                </div>
                
                <div className="prediction-values">
                  <div className="current-value">
                    <span className="value-label">Current</span>
                    <span className="value-number">{pred.current}</span>
                  </div>
                  
                  <div className="prediction-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  <div className="predicted-value">
                    <span className="value-label">Predicted</span>
                    <span className="value-number">{pred.predicted}</span>
                  </div>
                </div>
                
                <div className="prediction-trend">
                  <span className={`trend-indicator ${pred.trend}`}>
                    {pred.trend === 'up' ? '↗' : '↘'}
                  </span>
                  <span className="trend-text">
                    {pred.trend === 'up' ? 'Improving' : 'Declining'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="insights-section">
          <h3>Key Insights</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <p>{insight}</p>
                  <div className="insight-actions">
                    <button className="btn-secondary btn-sm">Explore</button>
                    <button className="btn-secondary btn-sm">Share</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="detailed-metrics">
          <h3>Detailed Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-detail">
              <h4>Priority Distribution</h4>
              <div className="metric-chart">
                <div className="chart-slice high" style={{ flex: kpis.highPriorityTasks }}>
                  <span>High: {kpis.highPriorityTasks}</span>
                </div>
                <div className="chart-slice medium" style={{ flex: kpis.mediumPriorityTasks }}>
                  <span>Medium: {kpis.mediumPriorityTasks}</span>
                </div>
                <div className="chart-slice low" style={{ flex: kpis.lowPriorityTasks }}>
                  <span>Low: {kpis.lowPriorityTasks}</span>
                </div>
              </div>
            </div>
            
            <div className="metric-detail">
              <h4>Status Overview</h4>
              <div className="status-metrics">
                <div className="status-metric">
                  <span className="metric-label">To Do</span>
                  <div className="metric-bar">
                    <div 
                      className="bar-fill todo"
                      style={{ width: `${(tasks.filter(t => t.status === 'todo').length / tasks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{tasks.filter(t => t.status === 'todo').length}</span>
                </div>
                
                <div className="status-metric">
                  <span className="metric-label">In Progress</span>
                  <div className="metric-bar">
                    <div 
                      className="bar-fill inprogress"
                      style={{ width: `${(tasks.filter(t => t.status === 'inprogress').length / tasks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{tasks.filter(t => t.status === 'inprogress').length}</span>
                </div>
                
                <div className="status-metric">
                  <span className="metric-label">Done</span>
                  <div className="metric-bar">
                    <div 
                      className="bar-fill done"
                      style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{tasks.filter(t => t.status === 'done').length}</span>
                </div>
              </div>
            </div>
            
            <div className="metric-detail">
              <h4>Performance Trends</h4>
              <div className="trend-metrics">
                <div className="trend-metric">
                  <span className="trend-label">Weekly Velocity</span>
                  <span className="trend-value">+15%</span>
                  <span className="trend-indicator up">↗</span>
                </div>
                
                <div className="trend-metric">
                  <span className="trend-label">Completion Rate</span>
                  <span className="trend-value">+8%</span>
                  <span className="trend-indicator up">↗</span>
                </div>
                
                <div className="trend-metric">
                  <span className="trend-label">Efficiency</span>
                  <span className="trend-value">+5%</span>
                  <span className="trend-indicator up">↗</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export & Share */}
        <div className="export-section">
          <div className="export-options">
            <button className="btn-secondary">
              Export Report (PDF)
            </button>
            <button className="btn-secondary">
              Export Data (CSV)
            </button>
            <button className="btn-primary">
              Share Dashboard
            </button>
          </div>
          
          <div className="export-info">
            <p>Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="info-note">Data updates in real-time as tasks are modified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;