import { Task } from "../types";
import { suggestNextTask, estimateTimeRequired } from "../utils/taskAI";

type Props = {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
};

export default function SmartSuggestions({ tasks, onSelectTask }: Props) {
  const nextTask = suggestNextTask(tasks);
  
  if (!nextTask) return null;
  
  const estimatedTime = estimateTimeRequired(nextTask);
  
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎯</span>
        <h3 className="text-xl font-bold">Suggested Next Task</h3>
      </div>
      
      <div className="bg-white/20 rounded-lg p-4 mb-4">
        <div className="font-semibold text-lg mb-2">{nextTask.text}</div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-white/30 px-3 py-1 rounded-full">
            Priority: {nextTask.priority.toUpperCase()}
          </span>
          {nextTask.dueDate && (
            <span className="bg-white/30 px-3 py-1 rounded-full">
              Due: {nextTask.dueDate}
            </span>
          )}
          <span className="bg-white/30 px-3 py-1 rounded-full">
            Est. {estimatedTime} min
          </span>
        </div>
      </div>
      
      <button
        onClick={() => onSelectTask(nextTask.id)}
        className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-all font-semibold"
      >
        Start This Task
      </button>
    </div>
  );
}