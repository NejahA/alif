import { useState } from 'react';
import type { Task } from '../types';

interface ReportGeneratorProps {
  tasks: Task[];
}

const ReportGenerator = ({ tasks }: ReportGeneratorProps) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'export'>('summary');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  
  const generateReport = () => {
    let reportContent = '';
    
    if (reportType === 'summary') {
      reportContent = `# Task Management Report - Summary
Generated: ${new Date().toLocaleDateString()}

## Overview
- Total Tasks: ${tasks.length}
- Completed: ${tasks.filter(t => t.status === 'done').length}
- In Progress: ${tasks.filter(t => t.status === 'inprogress').length}
- To Do: ${tasks.filter(t => t.status === 'todo').length}

## Priority Distribution
- High Priority: ${tasks.filter(t => t.priority === 'high').length}
- Medium Priority: ${tasks.filter(t => t.priority === 'medium').length}
- Low Priority: ${tasks.filter(t => t.priority === 'low').length}

## Completion Rate
${((tasks.filter(t => t.status === 'done').length / tasks.length) * 100).toFixed(1)}% of tasks completed`;
    } else if (reportType === 'detailed') {
      reportContent = `# Task Management Report - Detailed
Generated: ${new Date().toLocaleDateString()}

## Task List
${tasks.map(task => `
### ${task.title}
- Status: ${task.status}
- Priority: ${task.priority}
- Labels: ${task.labels.join(', ')}
- Created: ${task.createdAt.toLocaleDateString()}
- Updated: ${task.updatedAt.toLocaleDateString()}
${task.description ? `- Description: ${task.description}` : ''}
`).join('\n')}`;
    } else {
      // Export format
      reportContent = JSON.stringify({
        reportType: 'export',
        generatedAt: new Date().toISOString(),
        totalTasks: tasks.length,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          labels: task.labels,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString()
        }))
      }, null, 2);
    }
    
    // Create download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextus-report-${reportType}-${new Date().toISOString().split('T')[0]}.${reportType === 'export' ? 'json' : 'md'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Report generated and downloaded as ${link.download}`);
  };
  
  return (
    <div className="report-generator">
      <div className="report-header">
        <h3 className="report-title">Report Generator</h3>
        <div className="report-actions">
          <button className="btn-primary" onClick={generateReport}>
            Generate Report
          </button>
        </div>
      </div>
      
      <div className="report-config">
        <div className="config-section">
          <h4 className="config-title">Report Type</h4>
          <div className="type-options">
            <button 
              className={`type-option ${reportType === 'summary' ? 'active' : ''}`}
              onClick={() => setReportType('summary')}
            >
              <div className="option-icon">📊</div>
              <div className="option-content">
                <div className="option-name">Summary</div>
                <div className="option-description">High-level overview with key metrics</div>
              </div>
            </button>
            <button 
              className={`type-option ${reportType === 'detailed' ? 'active' : ''}`}
              onClick={() => setReportType('detailed')}
            >
              <div className="option-icon">📋</div>
              <div className="option-content">
                <div className="option-name">Detailed</div>
                <div className="option-description">Complete task list with all details</div>
              </div>
            </button>
            <button 
              className={`type-option ${reportType === 'export' ? 'active' : ''}`}
              onClick={() => setReportType('export')}
            >
              <div className="option-icon">📁</div>
              <div className="option-content">
                <div className="option-name">Export</div>
                <div className="option-description">JSON format for data migration</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="config-section">
          <h4 className="config-title">Options</h4>
          <div className="option-checkboxes">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
              />
              <span className="checkbox-text">Include Charts</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
              />
              <span className="checkbox-text">Include Comments</span>
            </label>
          </div>
        </div>
        
        <div className="config-section">
          <h4 className="config-title">Preview</h4>
          <div className="report-preview">
            <div className="preview-content">
              {reportType === 'summary' && (
                <div className="summary-preview">
                  <h4>Summary Report Preview</h4>
                  <p>Total Tasks: {tasks.length}</p>
                  <p>Completed: {tasks.filter(t => t.status === 'done').length}</p>
                  <p>In Progress: {tasks.filter(t => t.status === 'inprogress').length}</p>
                  <p>To Do: {tasks.filter(t => t.status === 'todo').length}</p>
                </div>
              )}
              {reportType === 'detailed' && (
                <div className="detailed-preview">
                  <h4>Detailed Report Preview</h4>
                  <p>Includes {tasks.length} tasks with full details</p>
                  <p>Each task includes title, status, priority, labels, dates</p>
                </div>
              )}
              {reportType === 'export' && (
                <div className="export-preview">
                  <h4>Export Preview</h4>
                  <p>JSON format with {tasks.length} tasks</p>
                  <p>Ready for data migration or backup</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;