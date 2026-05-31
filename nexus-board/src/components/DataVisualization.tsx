import { useState } from 'react';
import type { Task } from '../types';

interface DataVisualizationProps {
  tasks: Task[];
}

const DataVisualization = ({ tasks }: DataVisualizationProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  
  // Calculate statistics
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;
  
  const totalHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
  const avgHoursPerTask = tasks.length > 0 ? totalHours / tasks.length : 0;
  
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  return (
    <div className="data-visualization">
      <div className="viz-header">
        <h3 className="viz-title">Data Visualization</h3>
        <div className="chart-type-selector">
          <button 
            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
          <button 
            className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
            onClick={() => setChartType('pie')}
          >
            Pie
          </button>
          <button 
            className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            Line
          </button>
        </div>
      </div>
      
      <div className="viz-content">
        <div className="chart-container">
          <div className="chart-placeholder">
            {chartType === 'bar' && (
              <div className="bar-chart">
                <div className="chart-title">Task Status Distribution</div>
                <div className="bars">
                  <div className="bar-group">
                    <div className="bar-label">To Do</div>
                    <div className="bar" style={{ height: `${(todoTasks / tasks.length) * 100}%` }}>
                      <div className="bar-value">{todoTasks}</div>
                    </div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label">In Progress</div>
                    <div className="bar" style={{ height: `${(inProgressTasks / tasks.length) * 100}%` }}>
                      <div className="bar-value">{inProgressTasks}</div>
                    </div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label">Done</div>
                    <div className="bar" style={{ height: `${(completedTasks / tasks.length) * 100}%` }}>
                      <div className="bar-value">{completedTasks}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {chartType === 'pie' && (
              <div className="pie-chart">
                <div className="chart-title">Priority Distribution</div>
                <div className="pie-container">
                  <div className="pie-slice high" style={{ transform: `rotate(${(highPriorityTasks / tasks.length) * 360}deg)` }}>
                    <div className="slice-label">High</div>
                  </div>
                  <div className="pie-slice medium" style={{ transform: `rotate(${(mediumPriorityTasks / tasks.length) * 360}deg)` }}>
                    <div className="slice-label">Medium</div>
                  </div>
                  <div className="pie-slice low" style={{ transform: `rotate(${(lowPriorityTasks / tasks.length) * 360}deg)` }}>
                    <div className="slice-label">Low</div>
                  </div>
                </div>
              </div>
            )}
            
            {chartType === 'line' && (
              <div className="line-chart">
                <div className="chart-title">Completion Trend</div>
                <div className="line-graph">
                  <div className="grid">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <div key={value} className="grid-line">
                        <span className="grid-label">{value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="line" style={{ height: `${completionRate}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="viz-stats">
          <div className="stat-card">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completionRate.toFixed(1)}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{avgHoursPerTask.toFixed(1)}</div>
            <div className="stat-label">Avg Hours/Task</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalHours}</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;