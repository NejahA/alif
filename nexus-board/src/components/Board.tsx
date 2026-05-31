import type { Task, Status } from '../types';
import Column from './Column';

interface BoardProps {
  tasks: Task[];
  onMoveTask: (id: string, status: Status) => void;
  onDeleteTask: (id: string) => void;
}

const Board = ({ tasks, onMoveTask, onDeleteTask }: BoardProps) => {
  const columns: { title: string; status: Status }[] = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'inprogress' },
    { title: 'Done', status: 'done' },
  ];

  return (
    <div className="board-container">
      {columns.map(col => (
        <Column 
          key={col.status} 
          title={col.title} 
          status={col.status} 
          tasks={tasks.filter(t => t.status === col.status)}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default Board;
