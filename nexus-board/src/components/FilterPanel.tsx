import { useState } from 'react';
import type { Priority, Status, Label } from '../types';

interface FilterPanelProps {
  onFilterChange: (filters: {
    priority?: Priority;
    status?: Status;
    labels?: Label[];
    assignee?: string;
  }) => void;
}

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);

  const priorities: (Priority | 'all')[] = ['all', 'low', 'medium', 'high'];
  const statuses: (Status | 'all')[] = ['all', 'todo', 'inprogress', 'done'];
  const allLabels: Label[] = ['bug', 'feature', 'enhancement', 'documentation', 'design'];

  const handlePriorityChange = (priority: Priority | 'all') => {
    setSelectedPriority(priority);
    onFilterChange({
      priority: priority === 'all' ? undefined : priority,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      labels: selectedLabels.length > 0 ? selectedLabels : undefined,
    });
  };

  const handleStatusChange = (status: Status | 'all') => {
    setSelectedStatus(status);
    onFilterChange({
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      status: status === 'all' ? undefined : status,
      labels: selectedLabels.length > 0 ? selectedLabels : undefined,
    });
  };

  const handleLabelToggle = (label: Label) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    
    setSelectedLabels(newLabels);
    onFilterChange({
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      labels: newLabels.length > 0 ? newLabels : undefined,
    });
  };

  const clearFilters = () => {
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedLabels([]);
    onFilterChange({});
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3 className="filter-title">Filters</h3>
        <button className="btn-secondary btn-sm" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <h4 className="filter-subtitle">Priority</h4>
        <div className="filter-options">
          {priorities.map(priority => (
            <button
              key={priority}
              className={`filter-chip ${selectedPriority === priority ? 'active' : ''}`}
              onClick={() => handlePriorityChange(priority)}
            >
              {priority === 'all' ? 'All' : priority}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-subtitle">Status</h4>
        <div className="filter-options">
          {statuses.map(status => (
            <button
              key={status}
              className={`filter-chip ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => handleStatusChange(status)}
            >
              {status === 'all' ? 'All' : status === 'inprogress' ? 'In Progress' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-subtitle">Labels</h4>
        <div className="filter-options">
          {allLabels.map(label => (
            <button
              key={label}
              className={`filter-chip label-${label} ${selectedLabels.includes(label) ? 'active' : ''}`}
              onClick={() => handleLabelToggle(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;