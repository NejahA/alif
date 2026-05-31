import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = (task) => {
    setTasks([task, ...tasks]);
    setShowForm(false);
  };

  const handleUpdateTask = (task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    setShowForm(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleRunTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}/run`, { method: 'POST' });
      fetchTasks();
    } catch (error) {
      console.error('Error running task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FlowwState</h1>
                <p className="text-xs text-purple-200">Task Scheduler</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-2">
            <TaskList 
              tasks={tasks} 
              onSelectTask={setSelectedTask}
              onDeleteTask={handleDeleteTask}
              onRunTask={handleRunTask}
            />
          </div>

          {/* Task Details */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 sticky top-24">
              <h3 className="font-semibold text-white mb-4">Task Details</h3>
              {selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-purple-200">Name</label>
                    <p className="text-white font-medium">{selectedTask.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-purple-200">Command</label>
                    <p className="text-slate-300 text-sm font-mono break-all">{selectedTask.command}</p>
                  </div>
                  <div>
                    <label className="text-xs text-purple-200">Schedule</label>
                    <p className="text-white">{selectedTask.schedule}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedTask.enabled ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${selectedTask.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedTask.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {selectedTask.lastRun && (
                    <div>
                      <label className="text-xs text-purple-200">Last Run</label>
                      <p className="text-slate-300 text-sm">{new Date(selectedTask.lastRun).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-purple-200">Run Count</label>
                    <p className="text-white font-bold">{selectedTask.runCount}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Select a task to view details</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Task</h2>
            <TaskForm 
              onClose={() => setShowForm(false)} 
              onSubmit={handleAddTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}
