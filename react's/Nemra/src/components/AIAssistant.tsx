import { useState } from "react";
import { suggestPriority, suggestTags, suggestDueDate, breakdownTask } from "../utils/taskAI";

type Props = {
  onApplySuggestions: (data: {
    priority?: "low" | "medium" | "high";
    tags?: string[];
    dueDate?: string;
    subtasks?: string[];
  }) => void;
  taskText: string;
};

export default function AIAssistant({ onApplySuggestions, taskText }: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  if (!taskText.trim()) return null;
  
  const priority = suggestPriority(taskText);
  const tags = suggestTags(taskText);
  const dueDate = suggestDueDate(taskText);
  const subtasks = breakdownTask(taskText);
  
  const hasSuggestions = tags.length > 0 || dueDate || subtasks.length > 0;
  
  if (!hasSuggestions) return null;
  
  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h4 className="font-bold text-cyan-900">AI Suggestions</h4>
        </div>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
        >
          {showSuggestions ? "Hide" : "Show"}
        </button>
      </div>
      
      {showSuggestions && (
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Suggested Priority:</div>
            <button
              onClick={() => onApplySuggestions({ priority })}
              className="px-3 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
            >
              {priority.toUpperCase()}
            </button>
          </div>
          
          {tags.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Suggested Tags:</div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => onApplySuggestions({ tags: [tag] })}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {dueDate && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Suggested Due Date:</div>
              <button
                onClick={() => onApplySuggestions({ dueDate })}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {dueDate}
              </button>
            </div>
          )}
          
          {subtasks.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Suggested Breakdown:</div>
              <button
                onClick={() => onApplySuggestions({ subtasks })}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Add {subtasks.length} Subtasks
              </button>
            </div>
          )}
          
          <button
            onClick={() => onApplySuggestions({ priority, tags, dueDate, subtasks })}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 font-medium"
          >
            Apply All Suggestions
          </button>
        </div>
      )}
    </div>
  );
}