"use client";

import { Task } from "../types";
import { 
  getProductivityScore, 
  getTasksByTimeOfDay, 
  getAverageCompletionTime,
  getTasksByPriority,
  getUpcomingDeadlines,
  getOverdueTasks,
  getCompletionTrend,
  getMostProductiveDay,
  getTagStats
} from "../utils/taskAnalytics";

type Props = {
  tasks: Task[];
  onClose: () => void;
};

export default function AnalyticsDashboard({ tasks, onClose }: Props) {
  const productivityScore = getProductivityScore(tasks);
  const timeOfDay = getTasksByTimeOfDay(tasks);
  const avgCompletionTime = getAverageCompletionTime(tasks);
  const priorityBreakdown = getTasksByPriority(tasks);
  const upcoming = getUpcomingDeadlines(tasks);
  const overdue = getOverdueTasks(tasks);
  const trend = getCompletionTrend(tasks);
  const mostProductiveDay = getMostProductiveDay(tasks);
  const tagStats = getTagStats(tasks).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-5xl font-bold">{productivityScore}</div>
            <div className="text-purple-100">Productivity Score</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-5xl font-bold">{avgCompletionTime}h</div>
            <div className="text-blue-100">Avg Completion Time</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{mostProductiveDay}</div>
            <div className="text-green-100">Most Productive Day</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Time of Day Activity</h3>
            <div className="space-y-3">
              {Object.entries(timeOfDay).map(([time, count]) => (
                <div key={time}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize">{time}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(timeOfDay), 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>High Priority</span>
                  <span className="font-semibold text-red-600">{priorityBreakdown.high}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(priorityBreakdown.high / Math.max(tasks.length, 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Medium Priority</span>
                  <span className="font-semibold text-yellow-600">{priorityBreakdown.medium}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(priorityBreakdown.medium / Math.max(tasks.length, 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Low Priority</span>
                  <span className="font-semibold text-green-600">{priorityBreakdown.low}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(priorityBreakdown.low / Math.max(tasks.length, 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">7-Day Completion Trend</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {trend.map((count, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                    style={{ height: `${(count / Math.max(...trend, 1)) * 100}%`, minHeight: count > 0 ? '8px' : '0' }}
                  />
                  <span className="text-xs mt-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Top Tags</h3>
            <div className="space-y-2">
              {tagStats.map(({ tag, count, completed }) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {tag}
                  </span>
                  <span className="text-sm text-gray-600">
                    {completed}/{count} completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {overdue.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <h3 className="text-xl font-bold mb-4 text-red-700">⚠️ Overdue Tasks</h3>
              <div className="space-y-2">
                {overdue.slice(0, 5).map(task => (
                  <div key={task.id} className="text-sm">
                    <div className="font-medium">{task.text}</div>
                    <div className="text-red-600 text-xs">Due: {task.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-blue-700">📅 Upcoming (7 days)</h3>
              <div className="space-y-2">
                {upcoming.slice(0, 5).map(task => (
                  <div key={task.id} className="text-sm">
                    <div className="font-medium">{task.text}</div>
                    <div className="text-blue-600 text-xs">Due: {task.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
