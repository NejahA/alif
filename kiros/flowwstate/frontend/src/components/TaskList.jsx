import React from 'react';

export default function TaskList({ tasks, onSelectTask, onDeleteTask, onRunTask }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-white/5 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-purple-200 text-sm">No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <h3 className="font-semibold text-white mb-4">Tasks ({tasks.length})</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-lg p-4 transition-all duration-200 cursor-pointer ${task.id === task.id ? 'ring-2 ring-purple-500/50' : ''}`}
            onClick={() => onSelectTask(task)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm truncate">{task.name}</h4>
                  <div className={`w-2 h-2 rounded-full ${task.enabled ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                </div>
                <p className="text-slate-400 text-xs font-mono truncate">{task.command}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-purple-300 text-xs">{task.schedule}</span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-400 text-xs">{task.runCount} runs</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRunTask(task.id);
                  }}
                  className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                  title="Run task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
