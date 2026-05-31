import { useState, useEffect } from 'react';
import type { Task } from '../types';

interface AIAssistantProps {
  tasks: Task[];
  onSuggestionAccept: (suggestion: Partial<Task>) => void;
}

const AIAssistant = ({ tasks, onSuggestionAccept }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    id: string;
    type: 'priority' | 'due_date' | 'label' | 'similar' | 'completion';
    title: string;
    description: string;
    taskId?: string;
    data: any;
    confidence: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate AI suggestions based on task data
  const generateSuggestions = () => {
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newSuggestions = [];
      
      // Analyze task priorities
      const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
      const totalTasks = tasks.length;
      
      if (highPriorityCount > totalTasks * 0.5) {
        newSuggestions.push({
          id: 'suggestion-1',
          type: 'priority',
          title: 'High Priority Overload',
          description: `You have ${highPriorityCount} high priority tasks (${Math.round((highPriorityCount / totalTasks) * 100)}% of all tasks). Consider delegating or rescheduling some.`,
          data: { priority: 'medium' },
          confidence: 0.85
        });
      }
      
      // Check for overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
      );
      
      if (overdueTasks.length > 0) {
        newSuggestions.push({
          id: 'suggestion-2',
          type: 'due_date',
          title: 'Overdue Tasks',
          description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider updating due dates or prioritizing them.`,
          data: { taskIds: overdueTasks.map(t => t.id) },
          confidence: 0.95
        });
      }
      
      // Suggest similar tasks grouping
      const similarTasks = tasks.reduce((groups: Record<string, Task[]>, task) => {
        const key = task.title.toLowerCase().split(' ').slice(0, 2).join(' ');
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
        return groups;
      }, {});
      
      Object.entries(similarTasks).forEach(([key, taskGroup]) => {
        if (taskGroup.length >= 2) {
          newSuggestions.push({
            id: `suggestion-${key}`,
            type: 'similar',
            title: 'Similar Tasks Found',
            description: `Found ${taskGroup.length} tasks related to "${key}". Consider grouping them together.`,
            data: { taskIds: taskGroup.map(t => t.id), groupName: key },
            confidence: 0.75
          });
        }
      });
      
      // Completion rate analysis
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      if (completionRate < 30 && totalTasks > 5) {
        newSuggestions.push({
          id: 'suggestion-completion',
          type: 'completion',
          title: 'Low Completion Rate',
          description: `Your completion rate is ${completionRate.toFixed(1)}%. Consider breaking down larger tasks or setting clearer deadlines.`,
          data: { completionRate },
          confidence: 0.8
        });
      }
      
      // Label suggestions
      const tasksWithoutLabels = tasks.filter(t => t.labels.length === 0);
      if (tasksWithoutLabels.length > 0) {
        newSuggestions.push({
          id: 'suggestion-labels',
          type: 'label',
          title: 'Tasks Without Labels',
          description: `${tasksWithoutLabels.length} task${tasksWithoutLabels.length > 1 ? 's' : ''} don't have labels. Adding labels can help with organization.`,
          data: { taskIds: tasksWithoutLabels.map(t => t.id) },
          confidence: 0.7
        });
      }
      
      setSuggestions(newSuggestions);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      generateSuggestions();
    }
  }, [isOpen, tasks.length]);

  const handleAcceptSuggestion = (suggestion: any) => {
    switch (suggestion.type) {
      case 'priority':
        // In a real app, this would update multiple tasks
        alert(`Would update ${suggestion.data.taskIds?.length || 'some'} tasks to ${suggestion.data.priority} priority`);
        break;
      case 'due_date':
        alert(`Would update due dates for ${suggestion.data.taskIds.length} overdue tasks`);
        break;
      case 'label':
        alert(`Would add labels to ${suggestion.data.taskIds.length} tasks`);
        break;
      case 'similar':
        alert(`Would group ${suggestion.data.taskIds.length} similar tasks under "${suggestion.data.groupName}"`);
        break;
      case 'completion':
        // Create a new task for improving completion rate
        onSuggestionAccept({
          title: 'Improve Task Completion',
          description: `Current completion rate is ${suggestion.data.completionRate.toFixed(1)}%. Focus on completing existing tasks before adding new ones.`,
          priority: 'medium',
          status: 'todo'
        });
        break;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'priority':
        return '⚡';
      case 'due_date':
        return '📅';
      case 'label':
        return '🏷️';
      case 'similar':
        return '🔗';
      case 'completion':
        return '📊';
      default:
        return '💡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'high';
    if (confidence > 0.6) return 'medium';
    return 'low';
  };

  return (
    <>
      <button 
        className="btn-icon ai-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI Assistant"
        title="AI Assistant"
      >
        <span className="ai-icon">🤖</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content ai-assistant-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="ai-title-icon">🤖</span>
                AI Assistant
              </h2>
              <button className="btn-icon" onClick={() => setIsOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="ai-assistant-content">
              <div className="ai-welcome">
                <h3>Smart Suggestions</h3>
                <p>Based on your {tasks.length} tasks, I've analyzed your workflow and found some opportunities for improvement.</p>
              </div>

              {isLoading ? (
                <div className="ai-loading">
                  <div className="loading-spinner"></div>
                  <p>Analyzing your tasks...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="ai-no-suggestions">
                  <p>Everything looks great! No suggestions at this time.</p>
                  <button 
                    className="btn-secondary"
                    onClick={generateSuggestions}
                  >
                    Re-analyze
                  </button>
                </div>
              ) : (
                <div className="ai-suggestions">
                  {suggestions.map(suggestion => (
                    <div 
                      key={suggestion.id} 
                      className={`ai-suggestion confidence-${getConfidenceColor(suggestion.confidence)}`}
                    >
                      <div className="suggestion-header">
                        <span className="suggestion-icon">
                          {getSuggestionIcon(suggestion.type)}
                        </span>
                        <div className="suggestion-title">
                          <h4>{suggestion.title}</h4>
                          <span className="confidence-badge">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      <p className="suggestion-description">{suggestion.description}</p>
                      
                      <div className="suggestion-actions">
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => handleAcceptSuggestion(suggestion)}
                        >
                          Apply Suggestion
                        </button>
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="ai-features">
                <h4>AI Features</h4>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <div className="feature-info">
                      <h5>Workload Analysis</h5>
                      <p>Identifies bottlenecks and suggests optimizations</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <div className="feature-info">
                      <h5>Priority Optimization</h5>
                      <p>Suggests better task prioritization based on deadlines</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔍</span>
                    <div className="feature-info">
                      <h5>Pattern Recognition</h5>
                      <p>Finds patterns in your workflow for efficiency gains</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={generateSuggestions}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Re-analyze Tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;