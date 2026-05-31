import { useState } from 'react';
import type { Task } from '../types';

interface AdvancedSearchProps {
  tasks: Task[];
  onSearchResults: (results: Task[]) => void;
}

const AdvancedSearch = ({ tasks, onSearchResults }: AdvancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    labels: [] as string[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    assignee: 'all' as 'all' | 'assigned' | 'unassigned',
    hasComments: 'all' as 'all' | 'with' | 'without',
    estimatedHours: { min: '', max: '' }
  });
  
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'high priority tasks',
    'overdue this week',
    'tasks with no assignee',
    'design label tasks'
  ]);
  
  const [savedSearches, setSavedSearches] = useState([
    { id: '1', name: 'My Open Tasks', query: 'status:todo assignee:me' },
    { id: '2', name: 'High Priority This Week', query: 'priority:high date:week' },
    { id: '3', name: 'Tasks Needing Review', query: 'status:inprogress labels:review' },
    { id: '4', name: 'Overdue Tasks', query: 'overdue:true' },
  ]);
  
  const performSearch = () => {
    let results = [...tasks];
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filters
    if (filters.status.length > 0) {
      results = results.filter(task => filters.status.includes(task.status));
    }
    
    // Apply priority filters
    if (filters.priority.length > 0) {
      results = results.filter(task => filters.priority.includes(task.priority));
    }
    
    // Apply label filters
    if (filters.labels.length > 0) {
      results = results.filter(task => 
        task.labels.some(label => filters.labels.includes(label))
      );
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(cutoff.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(cutoff.getMonth() - 1);
          break;
      }
      
      results = results.filter(task => task.createdAt >= cutoff);
    }
    
    // Apply assignee filter
    if (filters.assignee === 'assigned') {
      results = results.filter(task => task.assigneeId);
    } else if (filters.assignee === 'unassigned') {
      results = results.filter(task => !task.assigneeId);
    }
    
    // Apply estimated hours filter
    if (filters.estimatedHours.min) {
      const min = parseFloat(filters.estimatedHours.min);
      if (!isNaN(min)) {
        results = results.filter(task => (task.estimatedHours || 0) >= min);
      }
    }
    
    if (filters.estimatedHours.max) {
      const max = parseFloat(filters.estimatedHours.max);
      if (!isNaN(max)) {
        results = results.filter(task => (task.estimatedHours || 0) <= max);
      }
    }
    
    onSearchResults(results);
    
    // Add to search history if not already there
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }
    
    return results;
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = performSearch();
    alert(`Found ${results.length} tasks matching your search criteria.`);
  };
  
  const handleSaveSearch = () => {
    if (!searchQuery) {
      alert('Please enter a search query to save.');
      return;
    }
    
    const newSearch = {
      id: Date.now().toString(),
      name: `Search: ${searchQuery.substring(0, 20)}...`,
      query: searchQuery
    };
    
    setSavedSearches(prev => [newSearch, ...prev]);
    alert('Search saved! You can access it from "Saved Searches".');
  };
  
  const handleLoadSavedSearch = (savedSearch: any) => {
    setSearchQuery(savedSearch.query);
    // In a real app, you would parse the query and apply filters
    alert(`Loaded saved search: ${savedSearch.name}`);
  };
  
  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      labels: [],
      dateRange: 'all',
      assignee: 'all',
      hasComments: 'all',
      estimatedHours: { min: '', max: '' }
    });
    setSearchQuery('');
    onSearchResults(tasks);
    alert('All filters cleared!');
  };
  
  const toggleFilter = (filterType: keyof typeof filters, value: string) => {
    if (filterType === 'status' || filterType === 'priority' || filterType === 'labels') {
      const current = filters[filterType] as string[];
      const newFilters = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      setFilters(prev => ({ ...prev, [filterType]: newFilters }));
    } else {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    }
  };
  
  return (
    <div className="advanced-search">
      <div className="search-header">
        <h3 className="search-title">Advanced Search</h3>
        <div className="search-stats">
          <span className="stat-badge total">{tasks.length} total tasks</span>
          <span className="stat-badge filters">
            {Object.values(filters).filter(f => 
              Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== ''
            ).length} active filters
          </span>
        </div>
      </div>
      
      <div className="search-main">
        <div className="search-sidebar">
          <div className="sidebar-section">
            <h4 className="section-title">Saved Searches</h4>
            <div className="saved-searches">
              {savedSearches.map(search => (
                <button
                  key={search.id}
                  className="saved-search"
                  onClick={() => handleLoadSavedSearch(search)}
                >
                  <div className="search-icon">🔍</div>
                  <div className="search-content">
                    <div className="search-name">{search.name}</div>
                    <div className="search-query">{search.query}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Search History</h4>
            <div className="search-history">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  className="history-item"
                  onClick={() => setSearchQuery(query)}
                >
                  <div className="history-icon">🕒</div>
                  <div className="history-query">{query}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Quick Actions</h4>
            <div className="quick-actions">
              <button className="btn-secondary" onClick={handleSaveSearch}>
                Save Current Search
              </button>
              <button className="btn-secondary" onClick={clearFilters}>
                Clear All Filters
              </button>
              <button className="btn-secondary" onClick={() => onSearchResults(tasks)}>
                Show All Tasks
              </button>
            </div>
          </div>
        </div>
        
        <div className="search-content">
          <div className="search-input-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input-large"
                  placeholder="Search tasks by title, description, or use advanced syntax..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button-large">
                  <span className="search-icon">🔍</span>
                  Search
                </button>
              </div>
              
              <div className="search-examples">
                <span className="examples-label">Try:</span>
                <button 
                  type="button"
                  className="example-chip"
                  onClick={() => setSearchQuery('priority:high status:todo')}
                >
                  priority:high status:todo
                </button>
                <button 
                  type="button"
                  className="example-chip"
                  onClick={() => setSearchQuery('overdue:true')}
                >
                  overdue:true
                </button>
                <button 
                  type="button"
                  className="example-chip"
                  onClick={() => setSearchQuery('labels:design,feature')}
                >
                  labels:design,feature
                </button>
              </div>
            </form>
          </div>
          
          <div className="filters-section">
            <h4 className="filters-title">Filters</h4>
            
            <div className="filters-grid">
              <div className="filter-group">
                <h5 className="filter-group-title">Status</h5>
                <div className="filter-options">
                  {['todo', 'inprogress', 'done'].map(status => (
                    <button
                      key={status}
                      className={`filter-chip ${filters.status.includes(status) ? 'active' : ''}`}
                      onClick={() => toggleFilter('status', status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <h5 className="filter-group-title">Priority</h5>
                <div className="filter-options">
                  {['high', 'medium', 'low'].map(priority => (
                    <button
                      key={priority}
                      className={`filter-chip ${filters.priority.includes(priority) ? 'active' : ''}`}
                      onClick={() => toggleFilter('priority', priority)}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <h5 className="filter-group-title">Labels</h5>
                <div className="filter-options">
                  {['bug', 'feature', 'enhancement', 'documentation', 'design'].map(label => (
                    <button
                      key={label}
                      className={`filter-chip label-${label} ${filters.labels.includes(label) ? 'active' : ''}`}
                      onClick={() => toggleFilter('labels', label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <h5 className="filter-group-title">Date Range</h5>
                <div className="filter-options">
                  {[
                    { value: 'all', label: 'All Time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' }
                  ].map(option => (
                    <button
                      key={option.value}
                      className={`filter-chip ${filters.dateRange === option.value ? 'active' : ''}`}
                      onClick={() => toggleFilter('dateRange', option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <h5 className="filter-group-title">Assignee</h5>
                <div className="filter-options">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'unassigned', label: 'Unassigned' }
                  ].map(option => (
                    <button
                      key={option.value}
                      className={`filter-chip ${filters.assignee === option.value ? 'active' : ''}`}
                      onClick={() => toggleFilter('assignee', option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <h5 className="filter-group-title">Estimated Hours</h5>
                <div className="filter-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    value={filters.estimatedHours.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      estimatedHours: { ...prev.estimatedHours, min: e.target.value }
                    }))}
                  />
                  <span className="input-separator">to</span>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max"
                    value={filters.estimatedHours.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      estimatedHours: { ...prev.estimatedHours, max: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="search-help">
            <div className="help-card">
              <div className="help-icon">💡</div>
              <div className="help-content">
                <h5 className="help-title">Search Syntax Tips</h5>
                <ul className="help-list">
                  <li><code>priority:high</code> - High priority tasks</li>
                  <li><code>status:todo</code> - Tasks to do</li>
                  <li><code>overdue:true</code> - Overdue tasks</li>
                  <li><code>labels:bug,feature</code> - Tasks with specific labels</li>
                  <li><code>assignee:me</code> - Tasks assigned to you</li>
                </ul>
              </div>
            </div>
            
            <div className="help-card">
              <div className="help-icon">⚡</div>
              <div className="help-content">
                <h5 className="help-title">Advanced Features</h5>
                <ul className="help-list">
                  <li>Combine multiple filters for precise results</li>
                  <li>Save frequently used searches for quick access</li>
                  <li>Use date ranges to find recent or upcoming tasks</li>
                  <li>Filter by estimated time for better planning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="search-actions">
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleSearch}>
            Apply Search
          </button>
          <button className="btn-secondary" onClick={clearFilters}>
            Reset Filters
          </button>
          <button className="btn-secondary" onClick={handleSaveSearch}>
            Save Search
          </button>
        </div>
        
        <div className="action-info">
          <div className="info-item">
            <span className="info-icon">📊</span>
            <span className="info-text">Search across all task fields and metadata</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔍</span>
            <span className="info-text">Use advanced syntax for precise filtering</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💾</span>
            <span className="info-text">Save searches for repeated use</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;