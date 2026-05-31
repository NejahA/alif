import { useState, useEffect } from 'react';
import type { Task } from '../types';

interface SmartAssistantProps {
  tasks: Task[];
  onTaskSuggestion: (suggestion: Partial<Task>) => void;
  onWorkflowOptimization: (optimization: string) => void;
}

const SmartAssistant = ({ tasks, onTaskSuggestion, onWorkflowOptimization }: SmartAssistantProps) => {
  const [assistantMode, setAssistantMode] = useState<'analyze' | 'suggest' | 'optimize'>('analyze');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your Smart Assistant. I can help analyze your tasks, suggest improvements, and optimize your workflow. How can I help you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  
  useEffect(() => {
    // Simulate initial analysis
    if (!analysisResults) {
      analyzeTasks();
    }
  }, []);
  
  const analyzeTasks = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
      const todoTasks = tasks.filter(t => t.status === 'todo').length;
      
      const highPriorityTasks = tasks.filter(t => t.priority === 'high');
      const overdueTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        return t.dueDate < new Date() && t.status !== 'done';
      });
      
      const avgCompletionTime = tasks.length > 0 
        ? tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0) / tasks.length
        : 0;
      
      setAnalysisResults({
        summary: {
          totalTasks: tasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
          completionRate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
        },
        insights: [
          {
            id: 'insight-1',
            type: 'warning',
            title: 'High Priority Tasks',
            description: `${highPriorityTasks.length} high priority tasks need attention`,
            suggestion: 'Consider focusing on these tasks first'
          },
          {
            id: 'insight-2',
            type: overdueTasks.length > 0 ? 'danger' : 'success',
            title: 'Overdue Tasks',
            description: `${overdueTasks.length} tasks are overdue`,
            suggestion: overdueTasks.length > 0 ? 'Address overdue tasks immediately' : 'Great! No overdue tasks'
          },
          {
            id: 'insight-3',
            type: avgCompletionTime > 8 ? 'warning' : 'success',
            title: 'Task Duration',
            description: `Average task completion: ${avgCompletionTime.toFixed(1)} hours`,
            suggestion: avgCompletionTime > 8 ? 'Consider breaking down complex tasks' : 'Task durations are optimal'
          }
        ],
        recommendations: [
          {
            id: 'rec-1',
            priority: 'high',
            title: 'Automate Routine Tasks',
            description: 'Identify repetitive tasks that can be automated',
            action: 'Review task patterns'
          },
          {
            id: 'rec-2',
            priority: 'medium',
            title: 'Improve Task Estimates',
            description: 'Add time estimates to tasks for better planning',
            action: 'Add estimates to 5+ tasks'
          },
          {
            id: 'rec-3',
            priority: 'low',
            title: 'Team Collaboration',
            description: 'Increase task assignments to team members',
            action: 'Assign 3+ tasks to team'
          }
        ]
      });
      
      setIsAnalyzing(false);
      
      // Add analysis message to chat
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've analyzed your ${tasks.length} tasks. Found ${highPriorityTasks.length} high priority tasks and ${overdueTasks.length} overdue tasks.`
      }]);
    }, 1500);
  };
  
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Generate task suggestions based on analysis
    if (analysisResults) {
      const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
      
      if (highPriorityCount > 3) {
        suggestions.push({
          title: 'Break Down Complex Tasks',
          description: 'Consider splitting large high-priority tasks into smaller subtasks',
          confidence: 'high'
        });
      }
      
      const unassignedTasks = tasks.filter(t => !t.assigneeId);
      if (unassignedTasks.length > 5) {
        suggestions.push({
          title: 'Assign Tasks',
          description: `${unassignedTasks.length} tasks are unassigned. Consider assigning them to team members.`,
          confidence: 'medium'
        });
      }
      
      const tasksWithoutEstimates = tasks.filter(t => !t.estimatedHours);
      if (tasksWithoutEstimates.length > 0) {
        suggestions.push({
          title: 'Add Time Estimates',
          description: `${tasksWithoutEstimates.length} tasks lack time estimates. Adding estimates improves planning.`,
          confidence: 'medium'
        });
      }
    }
    
    return suggestions;
  };
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newMessages = [...chatMessages, {
      id: Date.now().toString(),
      role: 'user',
      content: userInput
    }];
    
    setChatMessages(newMessages);
    setUserInput('');
    
    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        "I understand you're asking about task management. Based on my analysis, I recommend focusing on high-priority tasks first.",
        "That's a great question! I suggest breaking down complex tasks into smaller, manageable subtasks.",
        "I can help with that. Would you like me to generate specific task suggestions or optimize your workflow?",
        "Based on your current task distribution, I recommend better workload balancing across your team.",
        "I notice some tasks lack time estimates. Adding estimates would improve scheduling accuracy."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse
      }]);
    }, 1000);
  };
  
  const handleSuggestionAccept = (suggestion: any) => {
    // Create a new task based on suggestion
    const newTask: Partial<Task> = {
      title: `Follow-up: ${suggestion.title}`,
      description: suggestion.description,
      priority: 'medium',
      status: 'todo'
    };
    
    onTaskSuggestion(newTask);
    alert(`Task suggestion accepted! A new task has been created.`);
  };
  
  const handleOptimizationApply = (optimization: string) => {
    onWorkflowOptimization(optimization);
    alert(`Optimization applied: ${optimization}`);
  };
  
  const suggestions = generateSuggestions();
  
  return (
    <div className="smart-assistant">
      <div className="assistant-header">
        <h3 className="assistant-title">Smart Assistant</h3>
        <div className="assistant-modes">
          <button 
            className={`mode-btn ${assistantMode === 'analyze' ? 'active' : ''}`}
            onClick={() => setAssistantMode('analyze')}
          >
            <span className="mode-icon">📊</span>
            Analyze
          </button>
          <button 
            className={`mode-btn ${assistantMode === 'suggest' ? 'active' : ''}`}
            onClick={() => setAssistantMode('suggest')}
          >
            <span className="mode-icon">💡</span>
            Suggest
          </button>
          <button 
            className={`mode-btn ${assistantMode === 'optimize' ? 'active' : ''}`}
            onClick={() => setAssistantMode('optimize')}
          >
            <span className="mode-icon">⚡</span>
            Optimize
          </button>
        </div>
      </div>
      
      <div className="assistant-content">
        {assistantMode === 'analyze' && (
          <div className="analysis-section">
            <div className="section-header">
              <h4 className="section-title">Task Analysis</h4>
              <button 
                className="btn-secondary btn-sm" 
                onClick={analyzeTasks}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>
            </div>
            
            {isAnalyzing ? (
              <div className="analyzing-state">
                <div className="loading-spinner"></div>
                <div className="loading-text">Analyzing your tasks...</div>
              </div>
            ) : analysisResults ? (
              <>
                <div className="analysis-summary">
                  <div className="summary-card">
                    <div className="summary-value">{analysisResults.summary.totalTasks}</div>
                    <div className="summary-label">Total Tasks</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{analysisResults.summary.completed}</div>
                    <div className="summary-label">Completed</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{analysisResults.summary.inProgress}</div>
                    <div className="summary-label">In Progress</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{analysisResults.summary.completionRate.toFixed(1)}%</div>
                    <div className="summary-label">Completion Rate</div>
                  </div>
                </div>
                
                <div className="analysis-insights">
                  <h5 className="insights-title">Key Insights</h5>
                  <div className="insights-list">
                    {analysisResults.insights.map((insight: any) => (
                      <div key={insight.id} className={`insight-item ${insight.type}`}>
                        <div className="insight-header">
                          <div className="insight-title">{insight.title}</div>
                          <div className={`insight-type ${insight.type}`}>
                            {insight.type === 'danger' ? '⚠️ Critical' : 
                             insight.type === 'warning' ? '⚠️ Warning' : '✅ Good'}
                          </div>
                        </div>
                        <div className="insight-description">{insight.description}</div>
                        <div className="insight-suggestion">{insight.suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="analysis-recommendations">
                  <h5 className="recommendations-title">Recommendations</h5>
                  <div className="recommendations-list">
                    {analysisResults.recommendations.map((rec: any) => (
                      <div key={rec.id} className={`recommendation ${rec.priority}`}>
                        <div className="recommendation-header">
                          <div className="recommendation-title">{rec.title}</div>
                          <div className={`priority-badge priority-${rec.priority}`}>
                            {rec.priority}
                          </div>
                        </div>
                        <div className="recommendation-description">{rec.description}</div>
                        <div className="recommendation-actions">
                          <button className="btn-secondary btn-sm">{rec.action}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-analysis">
                <div className="no-analysis-icon">🤖</div>
                <div className="no-analysis-text">Click "Re-analyze" to analyze your tasks</div>
              </div>
            )}
          </div>
        )}
        
        {assistantMode === 'suggest' && (
          <div className="suggestions-section">
            <div className="section-header">
              <h4 className="section-title">Smart Suggestions</h4>
              <div className="suggestion-count">{suggestions.length} suggestions</div>
            </div>
            
            {suggestions.length > 0 ? (
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-card">
                    <div className="suggestion-header">
                      <div className="suggestion-title">{suggestion.title}</div>
                      <div className={`confidence-badge confidence-${suggestion.confidence}`}>
                        {suggestion.confidence} confidence
                      </div>
                    </div>
                    <div className="suggestion-description">{suggestion.description}</div>
                    <div className="suggestion-actions">
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleSuggestionAccept(suggestion)}
                      >
                        Accept Suggestion
                      </button>
                      <button className="btn-secondary btn-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-suggestions">
                <div className="no-suggestions-icon">💡</div>
                <div className="no-suggestions-text">No suggestions available. Try analyzing tasks first.</div>
              </div>
            )}
            
            <div className="suggestion-ai">
              <h5 className="ai-title">AI-Powered Suggestions</h5>
              <div className="ai-description">
                Our AI analyzes your task patterns, team workload, and completion rates to provide personalized suggestions for improvement.
              </div>
              <div className="ai-features">
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <span className="feature-text">Priority-based recommendations</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📈</span>
                  <span className="feature-text">Performance optimization</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🤝</span>
                  <span className="feature-text">Team collaboration insights</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {assistantMode === 'optimize' && (
          <div className="optimization-section">
            <div className="section-header">
              <h4 className="section-title">Workflow Optimization</h4>
              <button 
                className="btn-primary btn-sm"
                onClick={() => handleOptimizationApply('Standard workflow optimization')}
              >
                Apply Optimization
              </button>
            </div>
            
            <div className="optimization-options">
              <div className="optimization-card">
                <div className="optimization-icon">⚡</div>
                <div className="optimization-content">
                  <div className="optimization-title">Automated Task Routing</div>
                  <div className="optimization-description">
                    Automatically route tasks to the most appropriate team member based on skills and workload
                  </div>
                  <div className="optimization-benefits">
                    <span className="benefit">+25% efficiency</span>
                    <span className="benefit">-15% completion time</span>
                  </div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => handleOptimizationApply('Automated Task Routing')}
                >
                  Enable
                </button>
              </div>
              
              <div className="optimization-card">
                <div className="optimization-icon">🤖</div>
                <div className="optimization-content">
                  <div className="optimization-title">AI-Powered Scheduling</div>
                  <div className="optimization-description">
                    Use AI to predict task durations and optimize schedules for maximum productivity
                  </div>
                  <div className="optimization-benefits">
                    <span className="benefit">Better estimates</span>
                    <span className="benefit">Reduced delays</span>
                  </div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => handleOptimizationApply('AI-Powered Scheduling')}
                >
                  Enable
                </button>
              </div>
              
              <div className="optimization-card">
                <div className="optimization-icon">📊</div>
                <div className="optimization-content">
                  <div className="optimization-title">Predictive Analytics</div>
                  <div className="optimization-description">
                    Get predictions about project completion dates and potential bottlenecks
                  </div>
                  <div className="optimization-benefits">
                    <span className="benefit">Early warnings</span>
                    <span className="benefit">Better planning</span>
                  </div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => handleOptimizationApply('Predictive Analytics')}
                >
                  Enable
                </button>
              </div>
            </div>
            
            <div className="optimization-chat">
              <h5 className="chat-title">Chat with Assistant</h5>
              <div className="chat-messages">
                {chatMessages.map(message => (
                  <div key={message.id} className={`chat-message ${message.role}`}>
                    <div className="message-role">{message.role === 'assistant' ? '🤖 Assistant' : '👤 You'}</div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask me anything about optimization..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAssistant;