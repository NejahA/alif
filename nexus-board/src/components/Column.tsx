import type { Task, Status } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  title: string;
  status: Status;
  tasks: Task[];
  onMoveTask: (id: string, status: Status) => void;
  onDeleteTask: (id: string) => void;
}

const Column = ({ title, status, tasks, onMoveTask, onDeleteTask }: ColumnProps) => {
  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">
          {title}
          <span className="column-count">{tasks.length}</span>
        </div>
      </div>
      <div className="task-list">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onMove={onMoveTask} 
            onDelete={onDeleteTask} 
          />
        ))}
        {tasks.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px', fontSize: '0.9rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
