import { useState } from 'react';
import type { Task } from '../types';

interface ResourcePlannerProps {
  tasks: Task[];
  teamMembers: any[];
  onResourceAllocation: (allocations: any[]) => void;
}

const ResourcePlanner = ({ tasks, teamMembers, onResourceAllocation }: ResourcePlannerProps) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'chart'>('grid');
  const [allocations, setAllocations] = useState<any[]>([]);
  
  // Calculate resource utilization
  const calculateUtilization = () => {
    const memberUtilization: Record<string, { assignedHours: number, capacity: number }> = {};
    
    teamMembers.forEach(member => {
      memberUtilization[member.id] = {
        assignedHours: 0,
        capacity: 40 // Default 40 hours per week
      };
    });
    
    tasks.forEach(task => {
      if (task.assigneeId && memberUtilization[task.assigneeId]) {
        memberUtilization[task.assigneeId].assignedHours += task.estimatedHours || 4;
      }
    });
    
    return memberUtilization;
  };
  
  const utilization = calculateUtilization();
  
  const unassignedTasks = tasks.filter(task => !task.assigneeId);
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return task.dueDate < new Date() && task.status !== 'done';
  });
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && task.status !== 'done');
  
  const allocateResources = () => {
    // Simple allocation algorithm
    const newAllocations = [];
    const availableMembers = [...teamMembers];
    
    // Sort tasks by priority (high first)
    const tasksToAllocate = [...unassignedTasks].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    tasksToAllocate.forEach(task => {
      // Find member with lowest utilization
      const sortedMembers = availableMembers.sort((a, b) => {
        const utilA = utilization[a.id]?.assignedHours || 0;
        const utilB = utilization[b.id]?.assignedHours || 0;
        return utilA - utilB;
      });
      
      if (sortedMembers.length > 0) {
        const member = sortedMembers[0];
        newAllocations.push({
          taskId: task.id,
          taskTitle: task.title,
          memberId: member.id,
          memberName: member.name,
          hours: task.estimatedHours || 4,
          priority: task.priority
        });
        
        // Update utilization for next iteration
        if (utilization[member.id]) {
          utilization[member.id].assignedHours += task.estimatedHours || 4;
        }
      }
    });
    
    setAllocations(newAllocations);
    onResourceAllocation(newAllocations);
    alert(`Allocated ${newAllocations.length} tasks to team members!`);
  };
  
  const clearAllocations = () => {
    setAllocations([]);
    alert('Allocations cleared!');
  };
  
  const applyAllocations = () => {
    // In a real app, this would update tasks with assignees
    alert('Resource allocations applied to tasks!');
  };
  
  return (
    <div className="resource-planner">
      <div className="planner-header">
        <h3 className="planner-title">Resource Planner</h3>
        <div className="planner-stats">
          <span className="stat-badge team">{teamMembers.length} team members</span>
          <span className="stat-badge tasks">{tasks.length} total tasks</span>
          <span className="stat-badge unassigned">{unassignedTasks.length} unassigned</span>
        </div>
      </div>
      
      <div className="planner-controls">
        <div className="controls-left">
          <div className="timeframe-selector">
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
            <button 
              className={`timeframe-btn ${timeframe === 'quarter' ? 'active' : ''}`}
              onClick={() => setTimeframe('quarter')}
            >
              Quarter
            </button>
          </div>
          
          <div className="view-selector">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span className="view-icon">📋</span>
              Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <span className="view-icon">📅</span>
              Timeline
            </button>
            <button 
              className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
            >
              <span className="view-icon">📊</span>
              Chart
            </button>
          </div>
        </div>
        
        <div className="controls-right">
          <button className="btn-primary" onClick={allocateResources}>
            Auto-allocate
          </button>
          <button className="btn-secondary" onClick={applyAllocations}>
            Apply Allocations
          </button>
          <button className="btn-secondary" onClick={clearAllocations}>
            Clear
          </button>
        </div>
      </div>
      
      <div className="planner-overview">
        <div className="overview-card">
          <div className="overview-header">
            <h4 className="overview-title">Resource Overview</h4>
            <div className="overview-utilization">
              {Math.round((Object.values(utilization).reduce((sum, u) => sum + u.assignedHours, 0) / 
                (teamMembers.length * 40)) * 100)}% utilized
            </div>
          </div>
          
          <div className="utilization-bars">
            {teamMembers.map(member => {
              const util = utilization[member.id] || { assignedHours: 0, capacity: 40 };
              const percentage = Math.min(100, (util.assignedHours / util.capacity) * 100);
              
              return (
                <div key={member.id} className="utilization-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-details">
                      <div className="member-name">{member.name}</div>
                      <div className="member-role">{member.role || 'Team Member'}</div>
                    </div>
                  </div>
                  
                  <div className="utilization-details">
                    <div className="utilization-bar">
                      <div 
                        className="utilization-fill"
                        style={{ 
                          width: `${percentage}%`,
                          background: percentage > 90 ? 'var(--accent-danger)' : 
                                     percentage > 70 ? 'var(--accent-warning)' : 'var(--accent-primary)'
                        }}
                      ></div>
                    </div>
                    <div className="utilization-numbers">
                      <span className="assigned">{util.assignedHours.toFixed(1)}h</span>
                      <span className="capacity">/ {util.capacity}h</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-header">
            <h4 className="overview-title">Task Distribution</h4>
            <div className="overview-actions">
              <button className="btn-secondary btn-sm">Export</button>
            </div>
          </div>
          
          <div className="distribution-chart">
            <div className="chart-bars">
              {['high', 'medium', 'low'].map(priority => {
                const count = tasks.filter(t => t.priority === priority).length;
                const percentage = (count / tasks.length) * 100;
                
                return (
                  <div key={priority} className="chart-bar-group">
                    <div className="bar-label">{priority}</div>
                    <div className="bar-container">
                      <div 
                        className="distribution-bar"
                        style={{ 
                          height: `${percentage}%`,
                          background: priority === 'high' ? 'var(--accent-danger)' : 
                                     priority === 'medium' ? 'var(--accent-warning)' : 'var(--accent-success)'
                        }}
                      >
                        <div className="bar-value">{count}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="chart-stats">
              <div className="stat-item">
                <div className="stat-value">{unassignedTasks.length}</div>
                <div className="stat-label">Unassigned</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{overdueTasks.length}</div>
                <div className="stat-label">Overdue</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{highPriorityTasks.length}</div>
                <div className="stat-label">High Priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="planner-content">
        {viewMode === 'grid' && (
          <div className="resource-grid">
            <div className="grid-header">
              <h4 className="grid-title">Resource Allocation Grid</h4>
              <div className="grid-actions">
                <button className="btn-secondary btn-sm">Add Member</button>
                <button className="btn-secondary btn-sm">Adjust Capacity</button>
              </div>
            </div>
            
            <div className="allocation-table">
              <div className="table-header">
                <div className="header-cell member">Team Member</div>
                <div className="header-cell capacity">Capacity</div>
                <div className="header-cell assigned">Assigned</div>
                <div className="header-cell available">Available</div>
                <div className="header-cell tasks">Tasks</div>
                <div className="header-cell status">Status</div>
              </div>
              
              {teamMembers.map(member => {
                const util = utilization[member.id] || { assignedHours: 0, capacity: 40 };
                const availableHours = Math.max(0, util.capacity - util.assignedHours);
                const memberTasks = tasks.filter(t => t.assigneeId === member.id);
                const status = availableHours > 10 ? 'Underutilized' : 
                              availableHours > 0 ? 'Optimal' : 'Overloaded';
                
                return (
                  <div key={member.id} className="table-row">
                    <div className="row-cell member">
                      <div className="member-cell">
                        <div className="member-avatar-small">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-name">{member.name}</div>
                      </div>
                    </div>
                    <div className="row-cell capacity">{util.capacity}h</div>
                    <div className="row-cell assigned">{util.assignedHours.toFixed(1)}h</div>
                    <div className="row-cell available">{availableHours.toFixed(1)}h</div>
                    <div className="row-cell tasks">{memberTasks.length}</div>
                    <div className="row-cell status">
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {allocations.length > 0 && (
              <div className="allocation-preview">
                <h5 className="preview-title">Pending Allocations</h5>
                <div className="preview-list">
                  {allocations.map((allocation, index) => (
                    <div key={index} className="preview-item">
                      <div className="preview-task">{allocation.taskTitle}</div>
                      <div className="preview-arrow">→</div>
                      <div className="preview-member">{allocation.memberName}</div>
                      <div className="preview-hours">{allocation.hours}h</div>
                      <div className={`preview-priority priority-${allocation.priority}`}>
                        {allocation.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {viewMode === 'timeline' && (
          <div className="resource-timeline">
            <div className="timeline-header">
              <h4 className="timeline-title">Resource Timeline</h4>
              <div className="timeline-nav">
                <button className="btn-secondary btn-sm">← Previous</button>
                <div className="timeline-period">Week 15, 2024</div>
                <button className="btn-secondary btn-sm">Next →</button>
              </div>
            </div>
            
            <div className="timeline-grid">
              <div className="timeline-days">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                  <div key={day} className="timeline-day">
                    <div className="day-label">{day}</div>
                    <div className="day-slots">
                      {teamMembers.map(member => (
                        <div key={member.id} className="time-slot">
                          <div className="slot-label">{member.name.charAt(0)}</div>
                          <div className="slot-availability available"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="timeline-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <div className="legend-text">Available</div>
              </div>
              <div className="legend-item">
                <div className="legend-color assigned"></div>
                <div className="legend-text">Assigned</div>
              </div>
              <div className="legend-item">
                <div className="legend-color overloaded"></div>
                <div className="legend-text">Overloaded</div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'chart' && (
          <div className="resource-chart">
            <div className="chart-header">
              <h4 className="chart-title">Resource Utilization Chart</h4>
              <div className="chart-filters">
                <button className="btn-secondary btn-sm">By Department</button>
                <button className="btn-secondary btn-sm">By Skill</button>
                <button className="btn-secondary btn-sm">By Project</button>
              </div>
            </div>
            
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">📊</div>
                  <div className="placeholder-text">Resource utilization chart visualization</div>
                  <div className="placeholder-desc">
                    Shows team member utilization rates, availability, and workload distribution
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chart-insights">
              <div className="insight-card">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <div className="insight-title">Optimal Allocation</div>
                  <div className="insight-text">Resources are well-balanced across the team</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">⚠️</div>
                <div className="insight-content">
                  <div className="insight-title">Bottleneck Detected</div>
                  <div className="insight-text">2 team members are approaching capacity</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <div className="insight-title">Recommendation</div>
                  <div className="insight-text">Consider redistributing 3 high-priority tasks</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="planner-actions">
        <div className="action-buttons">
          <button className="btn-primary">
            Save Plan
          </button>
          <button className="btn-secondary">
            Export Report
          </button>
          <button className="btn-secondary">
            Share with Team
          </button>
        </div>
        
        <div className="action-tips">
          <div className="tip">
            <span className="tip-icon">💡</span>
            <span className="tip-text">Regularly review resource allocation to prevent burnout</span>
          </div>
          <div className="tip">
            <span className="tip-icon">📊</span>
            <span className="tip-text">Monitor utilization rates to optimize team performance</span>
          </div>
          <div className="tip">
            <span className="tip-icon">🤝</span>
            <span className="tip-text">Balance workload across team members for better collaboration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePlanner;