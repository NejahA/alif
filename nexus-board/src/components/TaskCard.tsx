import type { Task, Status } from '../types';

interface TaskCardProps {
  task: Task;
  onMove: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

const TaskCard = ({ task, onMove, onDelete }: TaskCardProps) => {
  const getNextStatus = (current: Status): Status | null => {
    if (current === 'todo') return 'inprogress';
    if (current === 'inprogress') return 'done';
    return null;
  };

  const getPrevStatus = (current: Status): Status | null => {
    if (current === 'done') return 'inprogress';
    if (current === 'inprogress') return 'todo';
    return null;
  };

  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  return (
    <div className="task-card">
      <div style={{ marginBottom: '12px' }}>
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>
      <h3 className="task-title">{task.title}</h3>
      <p className="task-desc">{task.description}</p>
      
      <div className="task-footer">
        <div className="task-actions">
          <button 
            className="btn-icon" 
            onClick={() => prevStatus && onMove(task.id, prevStatus)}
            disabled={!prevStatus}
            style={{ opacity: !prevStatus ? 0.3 : 1, cursor: !prevStatus ? 'not-allowed' : 'pointer' }}
            title="Move back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button 
            className="btn-icon" 
            onClick={() => nextStatus && onMove(task.id, nextStatus)}
            disabled={!nextStatus}
            style={{ opacity: !nextStatus ? 0.3 : 1, cursor: !nextStatus ? 'not-allowed' : 'pointer' }}
            title="Move forward"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <button 
          className="btn-icon" 
          style={{ color: 'var(--accent-danger)' }}
          onClick={() => onDelete(task.id)}
          title="Delete"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
