import { useState, useEffect } from 'react';
import type { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const CalendarView = ({ tasks, onTaskClick }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        tasks: getTasksForDate(date)
      });
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let day = 1; days.length < totalCells; day++) {
      const date = new Date(nextYear, nextMonth, day);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date)
      });
    }
    
    return (
      <div className="calendar-month">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.date.getDate() === new Date().getDate() && day.date.getMonth() === new Date().getMonth() ? 'today' : ''}`}
            >
              <div className="day-header">
                <span className="day-number">{day.date.getDate()}</span>
                {day.tasks.length > 0 && (
                  <span className="day-task-count">{day.tasks.length}</span>
                )}
              </div>
              <div className="day-tasks">
                {day.tasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className={`day-task priority-${task.priority}`}
                    onClick={() => onTaskClick(task.id)}
                  >
                    <span className="task-title">{task.title}</span>
                    <span className={`task-status ${task.status}`}>{task.status}</span>
                  </div>
                ))}
                {day.tasks.length > 3 && (
                  <div className="day-more-tasks">
                    +{day.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date,
        tasks: getTasksForDate(date)
      });
    }
    
    return (
      <div className="calendar-week">
        <div className="week-header">
          {weekDays.map(day => (
            <div key={day.date.toISOString()} className="week-day-header">
              <div className="week-day-name">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`week-day-date ${day.date.getDate() === new Date().getDate() ? 'today' : ''}`}>
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="week-content">
          {weekDays.map(day => (
            <div key={day.date.toISOString()} className="week-day">
              <div className="week-day-tasks">
                {day.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`week-task priority-${task.priority}`}
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className="task-time">
                      {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day'}
                    </div>
                    <div className="task-title">{task.title}</div>
                    <div className={`task-status ${task.status}`}>{task.status}</div>
                  </div>
                ))}
                {day.tasks.length === 0 && (
                  <div className="no-tasks">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    
    return (
      <div className="calendar-day-view">
        <div className="day-view-header">
          <h3>{formatDate(currentDate)}</h3>
          <div className="day-stats">
            <span className="stat-badge">{dayTasks.length} tasks</span>
            <span className="stat-badge">{dayTasks.filter(t => t.status === 'done').length} completed</span>
            <span className="stat-badge">{dayTasks.filter(t => t.priority === 'high').length} high priority</span>
          </div>
        </div>
        <div className="day-view-tasks">
          {dayTasks.length === 0 ? (
            <div className="no-tasks-day">
              <p>No tasks scheduled for today</p>
              <button className="btn-secondary">Create Task</button>
            </div>
          ) : (
            <div className="timeline">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourTasks = dayTasks.filter(task => {
                  if (!task.dueDate) return false;
                  const taskHour = new Date(task.dueDate).getHours();
                  return taskHour === hour;
                });
                
                return (
                  <div key={hour} className="timeline-hour">
                    <div className="hour-label">
                      {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    <div className="hour-tasks">
                      {hourTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`timeline-task priority-${task.priority}`}
                          onClick={() => onTaskClick(task.id)}
                        >
                          <div className="task-title">{task.title}</div>
                          <div className="task-time">
                            {new Date(task.dueDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="calendar-view">
      <div className="calendar-controls">
        <div className="calendar-nav">
          <button 
            className="btn-icon"
            onClick={() => navigateDate('prev')}
            aria-label="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <div className="calendar-title">
            {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `Week of ${formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay()))}`}
            {viewMode === 'day' && formatDate(currentDate)}
          </div>
          
          <button 
            className="btn-icon"
            onClick={() => navigateDate('next')}
            aria-label="Next"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="calendar-views">
          <button 
            className={`view-toggle ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={`view-toggle ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`view-toggle ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
        
        <button 
          className="btn-secondary"
          onClick={goToToday}
        >
          Today
        </button>
      </div>
      
      <div className="calendar-content">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
      
      <div className="calendar-stats">
        <div className="calendar-stat">
          <span className="stat-value">{tasks.filter(t => t.dueDate).length}</span>
          <span className="stat-label">Tasks with due dates</span>
        </div>
        <div className="calendar-stat">
          <span className="stat-value">{tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}</span>
          <span className="stat-label">Overdue tasks</span>
        </div>
        <div className="calendar-stat">
          <span className="stat-value">{tasks.filter(t => t.dueDate && new Date(t.dueDate).getDate() === new Date().getDate()).length}</span>
          <span className="stat-label">Due today</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;