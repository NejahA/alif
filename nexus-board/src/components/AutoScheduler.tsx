import { useState } from 'react';
import type { Task } from '../types';

interface AutoSchedulerProps {
  tasks: Task[];
  onScheduleTasks: (scheduledTasks: Task[]) => void;
}

const AutoScheduler = ({ tasks, onScheduleTasks }: AutoSchedulerProps) => {
  const [schedulingMode, setSchedulingMode] = useState<'auto' | 'manual' | 'optimized'>('auto');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [teamCapacity, setTeamCapacity] = useState(40); // hours per week
  const [includeDependencies, setIncludeDependencies] = useState(true);
  
  const unscheduledTasks = tasks.filter(task => !task.dueDate);
  const scheduledTasks = tasks.filter(task => task.dueDate);
  
  const calculateSchedule = () => {
    // Simple scheduling algorithm
    const tasksToSchedule = [...unscheduledTasks];
    const hoursPerDay = teamCapacity / 5; // Assuming 5-day work week
    
    // Sort by priority (high first) then estimated hours
    tasksToSchedule.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return (b.estimatedHours || 0) - (a.estimatedHours || 0);
    });
    
    const scheduled: Task[] = [];
    let currentDate = new Date();
    let availableHoursToday = hoursPerDay;
    
    tasksToSchedule.forEach(task => {
      const taskHours = task.estimatedHours || 4; // Default 4 hours
      
      if (taskHours <= availableHoursToday) {
        // Schedule for today
        scheduled.push({
          ...task,
          dueDate: new Date(currentDate)
        });
        availableHoursToday -= taskHours;
      } else {
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        availableHoursToday = hoursPerDay - taskHours;
        scheduled.push({
          ...task,
          dueDate: new Date(currentDate)
        });
      }
    });
    
    onScheduleTasks(scheduled);
    alert(`Scheduled ${scheduled.length} tasks automatically!`);
  };
  
  const optimizeSchedule = () => {
    // More advanced optimization
    const optimizedTasks = [...tasks].map(task => {
      if (!task.dueDate) {
        // Add due date based on priority
        const daysToAdd = task.priority === 'high' ? 1 : task.priority === 'medium' ? 3 : 7;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysToAdd);
        return { ...task, dueDate };
      }
      return task;
    });
    
    onScheduleTasks(optimizedTasks);
    alert('Schedule optimized! High priority tasks scheduled sooner.');
  };
  
  const clearSchedule = () => {
    const clearedTasks = tasks.map(task => ({
      ...task,
      dueDate: undefined
    }));
    onScheduleTasks(clearedTasks);
    alert('Schedule cleared! All due dates removed.');
  };
  
  return (
    <div className="auto-scheduler">
      <div className="scheduler-header">
        <h3 className="scheduler-title">Auto Scheduler</h3>
        <div className="scheduler-stats">
          <span className="stat-badge unscheduled">{unscheduledTasks.length} unscheduled</span>
          <span className="stat-badge scheduled">{scheduledTasks.length} scheduled</span>
        </div>
      </div>
      
      <div className="scheduler-config">
        <div className="config-section">
          <h4 className="config-title">Scheduling Mode</h4>
          <div className="mode-selector">
            <button 
              className={`mode-option ${schedulingMode === 'auto' ? 'active' : ''}`}
              onClick={() => setSchedulingMode('auto')}
            >
              <div className="option-icon">🤖</div>
              <div className="option-content">
                <div className="option-name">Auto Schedule</div>
                <div className="option-description">Automatically schedule all tasks</div>
              </div>
            </button>
            <button 
              className={`mode-option ${schedulingMode === 'manual' ? 'active' : ''}`}
              onClick={() => setSchedulingMode('manual')}
            >
              <div className="option-icon">👨‍💻</div>
              <div className="option-content">
                <div className="option-name">Manual Review</div>
                <div className="option-description">Review and adjust schedule</div>
              </div>
            </button>
            <button 
              className={`mode-option ${schedulingMode === 'optimized' ? 'active' : ''}`}
              onClick={() => setSchedulingMode('optimized')}
            >
              <div className="option-icon">⚡</div>
              <div className="option-content">
                <div className="option-name">Optimized</div>
                <div className="option-description">AI-optimized scheduling</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="config-section">
          <h4 className="config-title">Parameters</h4>
          <div className="parameter-grid">
            <div className="parameter">
              <label className="parameter-label">Timeframe</label>
              <div className="parameter-options">
                <button 
                  className={`timeframe-btn ${timeframe === 'day' ? 'active' : ''}`}
                  onClick={() => setTimeframe('day')}
                >
                  Day
                </button>
                <button 
                  className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeframe('week')}
                >
                  Week
                </button>
                <button 
                  className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeframe('month')}
                >
                  Month
                </button>
              </div>
            </div>
            
            <div className="parameter">
              <label className="parameter-label">Team Capacity</label>
              <div className="capacity-control">
                <input 
                  type="range" 
                  min="10" 
                  max="80" 
                  value={teamCapacity}
                  onChange={(e) => setTeamCapacity(parseInt(e.target.value))}
                  className="capacity-slider"
                />
                <span className="capacity-value">{teamCapacity} hours/week</span>
              </div>
            </div>
            
            <div className="parameter">
              <label className="parameter-label">Options</label>
              <div className="option-checkboxes">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={includeDependencies}
                    onChange={(e) => setIncludeDependencies(e.target.checked)}
                  />
                  <span className="checkbox-text">Include Task Dependencies</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="config-section">
          <h4 className="config-title">Schedule Preview</h4>
          <div className="schedule-preview">
            <div className="timeline">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                <div key={day} className="timeline-day">
                  <div className="day-label">{day}</div>
                  <div className="day-capacity">
                    <div className="capacity-bar" style={{ height: '100%' }}>
                      <div className="capacity-used" style={{ height: `${Math.random() * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="preview-stats">
              <div className="preview-stat">
                <div className="stat-value">{unscheduledTasks.length}</div>
                <div className="stat-label">To Schedule</div>
              </div>
              <div className="preview-stat">
                <div className="stat-value">{Math.ceil(unscheduledTasks.length * 0.3)}</div>
                <div className="stat-label">Estimated Days</div>
              </div>
              <div className="preview-stat">
                <div className="stat-value">{teamCapacity}</div>
                <div className="stat-label">Weekly Capacity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="scheduler-actions">
        <div className="action-buttons">
          <button className="btn-primary" onClick={calculateSchedule}>
            Generate Schedule
          </button>
          <button className="btn-secondary" onClick={optimizeSchedule}>
            Optimize Schedule
          </button>
          <button className="btn-secondary" onClick={clearSchedule}>
            Clear Schedule
          </button>
        </div>
        
        <div className="schedule-tips">
          <div className="tip">
            <span className="tip-icon">💡</span>
            <span className="tip-text">High priority tasks are scheduled first</span>
          </div>
          <div className="tip">
            <span className="tip-icon">⏱️</span>
            <span className="tip-text">Tasks with estimates are prioritized</span>
          </div>
          <div className="tip">
            <span className="tip-icon">📅</span>
            <span className="tip-text">Schedule adjusts based on team capacity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoScheduler;