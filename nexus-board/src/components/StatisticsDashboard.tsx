import type { Task } from '../types';

interface StatisticsDashboardProps {
  tasks: Task[];
}

const StatisticsDashboard = ({ tasks }: StatisticsDashboardProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate average time in each status (simplified)
  const now = new Date();
  const avgAgeInProgress = tasks
    .filter(t => t.status === 'inprogress' && t.createdAt)
    .reduce((sum, t) => {
      const age = now.getTime() - new Date(t.createdAt).getTime();
      return sum + (age / (1000 * 60 * 60 * 24)); // Convert to days
    }, 0) / (inProgressTasks || 1);

  return (
    <div className="stats-dashboard">
      <h2 className="stats-title">Project Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-trend">All tasks in the system</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
          <div className="stat-trend">{completedTasks} of {totalTasks} tasks done</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
          <div className="stat-trend">Active tasks being worked on</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{todoTasks}</div>
          <div className="stat-label">To Do</div>
          <div className="stat-trend">Tasks waiting to start</div>
        </div>
      </div>
      
      <div className="stats-details">
        <div className="priority-stats">
          <h3 className="stats-subtitle">Priority Distribution</h3>
          <div className="priority-bars">
            <div className="priority-bar high" style={{ width: `${(highPriorityTasks / totalTasks) * 100 || 0}%` }}>
              <span>High: {highPriorityTasks}</span>
            </div>
            <div className="priority-bar medium" style={{ width: `${(mediumPriorityTasks / totalTasks) * 100 || 0}%` }}>
              <span>Medium: {mediumPriorityTasks}</span>
            </div>
            <div className="priority-bar low" style={{ width: `${(lowPriorityTasks / totalTasks) * 100 || 0}%` }}>
              <span>Low: {lowPriorityTasks}</span>
            </div>
          </div>
        </div>
        
        <div className="status-stats">
          <h3 className="stats-subtitle">Status Overview</h3>
          <div className="status-chart">
            <div className="status-segment todo" style={{ flex: todoTasks }}>
              <div className="status-label">To Do: {todoTasks}</div>
            </div>
            <div className="status-segment inprogress" style={{ flex: inProgressTasks }}>
              <div className="status-label">In Progress: {inProgressTasks}</div>
            </div>
            <div className="status-segment done" style={{ flex: completedTasks }}>
              <div className="status-label">Done: {completedTasks}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="stats-metrics">
        <div className="metric">
          <div className="metric-value">{avgAgeInProgress.toFixed(1)}</div>
          <div className="metric-label">Avg Days in Progress</div>
        </div>
        <div className="metric">
          <div className="metric-value">{highPriorityTasks}</div>
          <div className="metric-label">High Priority Tasks</div>
        </div>
        <div className="metric">
          <div className="metric-value">{completedTasks}</div>
          <div className="metric-label">Completed This Week</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;