import type { Task } from '../types';

interface ExportImportProps {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
}

const ExportImport = ({ tasks, onImport }: ExportImportProps) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextus-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Labels', 'Created At'];
    const csvRows = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.priority,
        task.status,
        task.labels.join(';'),
        task.createdAt ? new Date(task.createdAt).toISOString() : ''
      ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextus-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTasks = JSON.parse(content);
        
        if (Array.isArray(importedTasks)) {
          // Validate imported tasks
          const validTasks = importedTasks.filter(task => 
            task.id && task.title && task.status
          );
          
          if (validTasks.length > 0) {
            if (confirm(`Import ${validTasks.length} tasks? This will replace your current tasks.`)) {
              onImport(validTasks);
            }
          } else {
            alert('No valid tasks found in the imported file.');
          }
        } else {
          alert('Invalid file format. Expected an array of tasks.');
        }
      } catch (error) {
        alert('Error parsing JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleSampleData = () => {
    const sampleTasks: Task[] = [
      {
        id: 'sample-1',
        title: 'Sample Task 1',
        description: 'This is a sample task for demonstration.',
        priority: 'high',
        status: 'todo',
        labels: ['feature'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-2',
        title: 'Sample Task 2',
        description: 'Another sample task with medium priority.',
        priority: 'medium',
        status: 'inprogress',
        labels: ['enhancement'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-3',
        title: 'Sample Task 3',
        description: 'Low priority sample task that is already done.',
        priority: 'low',
        status: 'done',
        labels: ['documentation'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    if (confirm('Add sample tasks? This will add 3 sample tasks to your board.')) {
      onImport([...tasks, ...sampleTasks]);
    }
  };

  return (
    <div className="export-import">
      <h3 className="export-import-title">Data Management</h3>
      
      <div className="export-options">
        <div className="option-card">
          <h4 className="option-title">Export Tasks</h4>
          <p className="option-description">Download your tasks for backup or sharing</p>
          <div className="option-actions">
            <button className="btn-secondary" onClick={handleExport}>
              Export as JSON
            </button>
            <button className="btn-secondary" onClick={handleExportCSV}>
              Export as CSV
            </button>
          </div>
        </div>
        
        <div className="option-card">
          <h4 className="option-title">Import Tasks</h4>
          <p className="option-description">Upload tasks from a JSON file</p>
          <div className="option-actions">
            <label className="btn-secondary file-input-label">
              Choose File
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="file-input"
              />
            </label>
          </div>
        </div>
        
        <div className="option-card">
          <h4 className="option-title">Sample Data</h4>
          <p className="option-description">Add sample tasks to test the application</p>
          <div className="option-actions">
            <button className="btn-secondary" onClick={handleSampleData}>
              Add Sample Tasks
            </button>
          </div>
        </div>
      </div>
      
      <div className="data-info">
        <h4 className="info-title">Current Data</h4>
        <div className="info-stats">
          <div className="info-stat">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="info-stat">
            <span className="stat-value">{tasks.filter(t => t.status === 'done').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="info-stat">
            <span className="stat-value">{tasks.filter(t => t.priority === 'high').length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>
      
      <div className="backup-reminder">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M10 6V10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Last exported: Never</span>
        <button className="btn-secondary btn-sm" onClick={handleExport}>
          Backup Now
        </button>
      </div>
    </div>
  );
};

export default ExportImport;