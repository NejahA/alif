import { useState } from "react";
import { SearchFilter } from "../utils/taskSearch";

type Props = {
  onSearch: (filter: SearchFilter) => void;
  onClose: () => void;
  allTags: string[];
};

export default function AdvancedSearch({ onSearch, onClose, allTags }: Props) {
  const [filter, setFilter] = useState<SearchFilter>({});
  
  const handleSearch = () => {
    onSearch(filter);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Advanced Search</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Query</label>
            <input
              type="text"
              value={filter.query || ""}
              onChange={(e) => setFilter({ ...filter, query: e.target.value })}
              placeholder="Search in tasks, tags, and notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map(priority => (
                <label key={priority} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filter.priority?.includes(priority)}
                    onChange={(e) => {
                      const current = filter.priority || [];
                      setFilter({
                        ...filter,
                        priority: e.target.checked
                          ? [...current, priority]
                          : current.filter(p => p !== priority)
                      });
                    }}
                  />
                  <span className="capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <label key={tag} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <input
                    type="checkbox"
                    checked={filter.tags?.includes(tag)}
                    onChange={(e) => {
                      const current = filter.tags || [];
                      setFilter({
                        ...filter,
                        tags: e.target.checked
                          ? [...current, tag]
                          : current.filter(t => t !== tag)
                      });
                    }}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filter.completed === undefined ? "all" : filter.completed ? "completed" : "active"}
              onChange={(e) => {
                const value = e.target.value;
                setFilter({
                  ...filter,
                  completed: value === "all" ? undefined : value === "completed"
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.hasNotes}
                onChange={(e) => setFilter({ ...filter, hasNotes: e.target.checked || undefined })}
              />
              <span>Has Notes</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.hasDueDate}
                onChange={(e) => setFilter({ ...filter, hasDueDate: e.target.checked || undefined })}
              />
              <span>Has Due Date</span>
            </label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSearch}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setFilter({})}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}