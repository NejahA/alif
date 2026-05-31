import React from 'react';
import './TaskCount.css';

function TaskCount({ tasks }) {
  const total = tasks.length;
  const incomplete = tasks.filter(task => !task.completed).length;
  const completed = tasks.filter(task => task.completed).length;

  return (
    <div className="task-count">
      <div className="count-item">
        <span className="count-label">Total:</span>
        <span className="count-value">{total}</span>
      </div>
      <div className="count-item">
        <span className="count-label">Incomplete:</span>
        <span className="count-value">{incomplete}</span>
      </div>
      <div className="count-item">
        <span className="count-label">Completed:</span>
        <span className="count-value">{completed}</span>
      </div>
    </div>
  );
}

export default TaskCount;
