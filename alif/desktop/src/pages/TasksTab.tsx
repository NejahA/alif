import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2 
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate: string;
}

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('alif_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: '1', title: 'Prepare Alpalin product catalog release', category: 'Work', priority: 'high', completed: false, dueDate: 'Today' },
      { id: '2', title: 'Tune Banjoui rhythm BPM timing', category: 'Game Dev', priority: 'medium', completed: true, dueDate: 'Yesterday' },
      { id: '3', title: 'Archive Mahdia cultural timeline artifacts', category: 'Research', priority: 'low', completed: false, dueDate: 'Tomorrow' },
      { id: '4', title: 'Compile native Tauri desktop release', category: 'Build', priority: 'high', completed: true, dueDate: 'Today' },
    ];
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('alif_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      dueDate: 'Today'
    };

    setTasks([task, ...tasks]);
    setNewTaskTitle('');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="hero-banner">
        <h2>✅ Task & Workflow Organizer</h2>
        <p>Manage daily sprint goals, prioritize assignments, and track active deliverables.</p>
      </div>

      {/* Task Creation Bar */}
      <form onSubmit={addTask} className="interactive-panel" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          className="greet-input"
          style={{ flex: 1, minWidth: '220px' }}
          placeholder="What do you need to get done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />

        <select
          value={newTaskCategory}
          onChange={(e) => setNewTaskCategory(e.target.value)}
          style={{
            background: 'rgba(11, 15, 25, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fff',
            outline: 'none',
            fontSize: '13px'
          }}
        >
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Game Dev">Game Dev</option>
          <option value="Research">Research</option>
          <option value="Build">Build</option>
        </select>

        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
          style={{
            background: 'rgba(11, 15, 25, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fff',
            outline: 'none',
            fontSize: '13px'
          }}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          Add Task
        </button>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'pending', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                border: filter === tab ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                background: filter === tab ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                color: filter === tab ? '#38bdf8' : '#94a3b8'
              }}
            >
              {tab} ({tab === 'all' ? tasks.length : tab === 'pending' ? tasks.filter(t => !t.completed).length : tasks.filter(t => t.completed).length})
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            No tasks in this view.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                opacity: task.completed ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => toggleTask(task.id)}
                  style={{ background: 'none', border: 'none', color: task.completed ? '#34d399' : '#64748b', cursor: 'pointer' }}
                >
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#f1f5f9',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                      {task.category}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#fbbf24' : '#94a3b8'
                    }}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
