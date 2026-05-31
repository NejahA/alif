"use client";

import { Task } from "../types";

type Props = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdateCategory: (id: string, category: string) => void;
};

const categories = ["todo", "in-progress", "done"];

export default function KanbanView({ tasks, onToggle, onDelete, onEdit, onUpdateCategory }: Props) {
  const getTasksByCategory = (category: string) => {
    if (category === "done") return tasks.filter(t => t.completed);
    if (category === "todo") return tasks.filter(t => !t.completed && (!t.category || t.category === "todo"));
    return tasks.filter(t => !t.completed && t.category === category);
  };

  const categoryColors = {
    "todo": "from-gray-100 to-gray-200",
    "in-progress": "from-blue-100 to-blue-200",
    "done": "from-green-100 to-green-200",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {categories.map(category => (
        <div key={category} className={`bg-gradient-to-b ${categoryColors[category as keyof typeof categoryColors]} rounded-xl p-4`}>
          <h3 className="font-bold text-lg mb-4 capitalize flex items-center justify-between">
            {category.replace("-", " ")}
            <span className="text-sm bg-white rounded-full px-3 py-1">
              {getTasksByCategory(category).length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {getTasksByCategory(category).map(task => (
              <div
                key={task.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onEdit(task)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggle(task.id);
                    }}
                    className="mt-1"
                  />
                  <span className={task.completed ? "line-through text-gray-400" : ""}>
                    {task.text}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 text-xs">
                  {task.priority === "high" && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">High</span>
                  )}
                  {task.dueDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {!task.completed && category !== "in-progress" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateCategory(task.id, "in-progress");
                    }}
                    className="mt-2 text-xs text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-all"
                  >
                    Move to In Progress
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
