import { useState } from 'react';

interface WorkflowBuilderProps {
  onWorkflowCreate: (workflow: any) => void;
  onWorkflowTest: (workflowId: string) => void;
}

const WorkflowBuilder = ({ onWorkflowCreate, onWorkflowTest }: WorkflowBuilderProps) => {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'history'>('builder');
  
  const triggers = [
    { id: 'task_created', name: 'Task Created', icon: '➕', description: 'When a new task is created' },
    { id: 'task_updated', name: 'Task Updated', icon: '✏️', description: 'When a task is modified' },
    { id: 'task_completed', name: 'Task Completed', icon: '✅', description: 'When a task is marked as done' },
    { id: 'due_date_approaching', name: 'Due Date Approaching', icon: '⏰', description: 'When a task due date is near' },
    { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When a comment is added to a task' },
    { id: 'status_changed', name: 'Status Changed', icon: '🔄', description: 'When task status changes' },
  ];
  
  const actions = [
    { id: 'send_notification', name: 'Send Notification', icon: '🔔', description: 'Send a notification to team members' },
    { id: 'assign_task', name: 'Assign Task', icon: '👤', description: 'Automatically assign the task' },
    { id: 'change_status', name: 'Change Status', icon: '🔄', description: 'Change task status automatically' },
    { id: 'add_label', name: 'Add Label', icon: '🏷️', description: 'Add a label to the task' },
    { id: 'set_due_date', name: 'Set Due Date', icon: '📅', description: 'Set or update due date' },
    { id: 'create_subtask', name: 'Create Subtask', icon: '📋', description: 'Create a follow-up subtask' },
    { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send an email notification' },
    { id: 'update_priority', name: 'Update Priority', icon: '🎯', description: 'Change task priority' },
    { id: 'log_activity', name: 'Log Activity', icon: '📝', description: 'Log this event in activity feed' },
    { id: 'trigger_webhook', name: 'Trigger Webhook', icon: '🔗', description: 'Call an external webhook' },
  ];
  
  const workflowTemplates = [
    {
      id: 'template-1',
      name: 'Review Workflow',
      description: 'Automatically assign tasks for review when marked complete',
      trigger: 'task_completed',
      actions: ['assign_task', 'send_notification'],
      usage: 'High'
    },
    {
      id: 'template-2',
      name: 'Escalation Workflow',
      description: 'Escalate overdue tasks to managers',
      trigger: 'due_date_approaching',
      actions: ['update_priority', 'send_notification', 'assign_task'],
      usage: 'Medium'
    },
    {
      id: 'template-3',
      name: 'Onboarding Workflow',
      description: 'Create checklist tasks for new team members',
      trigger: 'task_created',
      actions: ['create_subtask', 'add_label', 'set_due_date'],
      usage: 'High'
    },
    {
      id: 'template-4',
      name: 'Bug Triage',
      description: 'Automatically route bug reports to appropriate teams',
      trigger: 'task_created',
      actions: ['add_label', 'assign_task', 'send_notification'],
      usage: 'Medium'
    },
    {
      id: 'template-5',
      name: 'Weekly Reporting',
      description: 'Generate and send weekly progress reports',
      trigger: 'due_date_approaching',
      actions: ['send_email', 'log_activity'],
      usage: 'Low'
    },
  ];
  
  const addTrigger = (triggerId: string) => {
    setSelectedTrigger(triggerId);
    const trigger = triggers.find(t => t.id === triggerId);
    if (trigger) {
      setWorkflowSteps([{ type: 'trigger', ...trigger }]);
    }
  };
  
  const addAction = (actionId: string) => {
    if (!selectedActions.includes(actionId)) {
      setSelectedActions([...selectedActions, actionId]);
      const action = actions.find(a => a.id === actionId);
      if (action) {
        setWorkflowSteps(prev => [...prev, { type: 'action', ...action }]);
      }
    }
  };
  
  const removeStep = (index: number) => {
    const newSteps = [...workflowSteps];
    const removedStep = newSteps.splice(index, 1)[0];
    
    if (removedStep.type === 'trigger') {
      setSelectedTrigger('');
    } else {
      setSelectedActions(selectedActions.filter(id => id !== removedStep.id));
    }
    
    setWorkflowSteps(newSteps);
  };
  
  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...workflowSteps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    setWorkflowSteps(newSteps);
  };
  
  const saveWorkflow = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }
    
    if (!selectedTrigger) {
      alert('Please select a trigger for the workflow');
      return;
    }
    
    if (workflowSteps.length < 2) {
      alert('Please add at least one action to the workflow');
      return;
    }
    
    const workflow = {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      trigger: selectedTrigger,
      actions: selectedActions,
      steps: workflowSteps,
      createdAt: new Date(),
      enabled: true
    };
    
    onWorkflowCreate(workflow);
    alert(`Workflow "${workflowName}" saved successfully!`);
    
    // Reset form
    setWorkflowName('');
    setWorkflowDescription('');
    setSelectedTrigger('');
    setSelectedActions([]);
    setWorkflowSteps([]);
  };
  
  const loadTemplate = (template: any) => {
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setSelectedTrigger(template.trigger);
    setSelectedActions(template.actions);
    
    const trigger = triggers.find(t => t.id === template.trigger);
    const templateSteps = template.actions.map((actionId: string) => {
      const action = actions.find(a => a.id === actionId);
      return { type: 'action', ...action };
    });
    
    setWorkflowSteps([
      { type: 'trigger', ...trigger },
      ...templateSteps
    ]);
    
    alert(`Template "${template.name}" loaded!`);
  };
  
  const testWorkflow = () => {
    if (!selectedTrigger) {
      alert('Please build a workflow first');
      return;
    }
    
    onWorkflowTest(`test-${Date.now()}`);
    alert('Workflow test initiated! Check notifications for results.');
  };
  
  return (
    <div className="workflow-builder">
      <div className="builder-header">
        <h3 className="builder-title">Workflow Builder</h3>
        <div className="builder-tabs">
          <button 
            className={`builder-tab ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}
          >
            <span className="tab-icon">🏗️</span>
            Builder
          </button>
          <button 
            className={`builder-tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <span className="tab-icon">📋</span>
            Templates
          </button>
          <button 
            className={`builder-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">📊</span>
            History
          </button>
        </div>
      </div>
      
      <div className="builder-content">
        {activeTab === 'builder' && (
          <div className="builder-main">
            <div className="workflow-form">
              <div className="form-group">
                <label className="form-label">Workflow Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Review Approval Workflow"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what this workflow does..."
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="workflow-canvas">
              <div className="canvas-header">
                <h4 className="canvas-title">Workflow Steps</h4>
                <div className="canvas-stats">
                  <span className="stat-badge">{workflowSteps.length} steps</span>
                  <span className="stat-badge">{selectedActions.length} actions</span>
                </div>
              </div>
              
              <div className="steps-container">
                {workflowSteps.length === 0 ? (
                  <div className="empty-canvas">
                    <div className="empty-icon">🏗️</div>
                    <div className="empty-text">Drag triggers and actions here to build your workflow</div>
                    <div className="empty-hint">Start by selecting a trigger from the left panel</div>
                  </div>
                ) : (
                  <div className="steps-list">
                    {workflowSteps.map((step, index) => (
                      <div key={index} className="workflow-step">
                        <div className="step-header">
                          <div className="step-type">{step.type === 'trigger' ? 'Trigger' : 'Action'}</div>
                          <div className="step-actions">
                            {index > 0 && (
                              <button 
                                className="step-action"
                                onClick={() => moveStep(index, index - 1)}
                                title="Move up"
                              >
                                ↑
                              </button>
                            )}
                            {index < workflowSteps.length - 1 && (
                              <button 
                                className="step-action"
                                onClick={() => moveStep(index, index + 1)}
                                title="Move down"
                              >
                                ↓
                              </button>
                            )}
                            <button 
                              className="step-action remove"
                              onClick={() => removeStep(index)}
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        
                        <div className="step-content">
                          <div className="step-icon">{step.icon}</div>
                          <div className="step-details">
                            <div className="step-name">{step.name}</div>
                            <div className="step-description">{step.description}</div>
                          </div>
                        </div>
                        
                        {index < workflowSteps.length - 1 && (
                          <div className="step-connector">
                            <div className="connector-line"></div>
                            <div className="connector-arrow">↓</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="workflow-actions">
              <div className="action-buttons">
                <button className="btn-primary" onClick={saveWorkflow}>
                  Save Workflow
                </button>
                <button className="btn-secondary" onClick={testWorkflow}>
                  Test Workflow
                </button>
                <button className="btn-secondary" onClick={() => {
                  setWorkflowName('');
                  setWorkflowDescription('');
                  setSelectedTrigger('');
                  setSelectedActions([]);
                  setWorkflowSteps([]);
                }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div className="templates-section">
            <div className="section-header">
              <h4 className="section-title">Workflow Templates</h4>
              <div className="section-filters">
                <button className="btn-secondary btn-sm">All</button>
                <button className="btn-secondary btn-sm">Popular</button>
                <button className="btn-secondary btn-sm">Recent</button>
              </div>
            </div>
            
            <div className="templates-grid">
              {workflowTemplates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <div className="template-name">{template.name}</div>
                    <div className={`template-usage ${template.usage.toLowerCase()}`}>
                      {template.usage} usage
                    </div>
                  </div>
                  
                  <div className="template-description">{template.description}</div>
                  
                  <div className="template-trigger">
                    <span className="trigger-label">Trigger:</span>
                    <span className="trigger-value">
                      {triggers.find(t => t.id === template.trigger)?.name}
                    </span>
                  </div>
                  
                  <div className="template-actions">
                    <span className="actions-label">Actions:</span>
                    <div className="actions-list">
                      {template.actions.map(actionId => (
                        <span key={actionId} className="action-tag">
                          {actions.find(a => a.id === actionId)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="template-footer">
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => loadTemplate(template)}
                    >
                      Use Template
                    </button>
                    <button className="btn-secondary btn-sm">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="templates-info">
              <div className="info-card">
                <h5 className="info-title">About Templates</h5>
                <p className="info-text">
                  Workflow templates are pre-built automation rules that you can customize
                  for your specific needs. They provide a great starting point for common
                  automation scenarios.
                </p>
                <div className="info-tips">
                  <div className="tip">
                    <span className="tip-icon">💡</span>
                    <span className="tip-text">Customize templates to match your workflow</span>
                  </div>
                  <div className="tip">
                    <span className="tip-icon">⚡</span>
                    <span className="tip-text">Test workflows before enabling them</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="history-section">
            <div className="section-header">
              <h4 className="section-title">Workflow History</h4>
              <div className="section-actions">
                <button className="btn-secondary btn-sm">Export Logs</button>
                <button className="btn-secondary btn-sm">Filter</button>
              </div>
            </div>
            
            <div className="history-table">
              <div className="table-header">
                <div className="header-cell workflow">Workflow</div>
                <div className="header-cell trigger">Trigger</div>
                <div className="header-cell result">Result</div>
                <div className="header-cell time">Time</div>
                <div className="header-cell details">Details</div>
              </div>
              
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="table-row">
                  <div className="row-cell workflow">
                    <div className="workflow-name">Review Workflow #{i}</div>
                    <div className="workflow-type">Template</div>
                  </div>
                  <div className="row-cell trigger">
                    <div className="trigger-name">Task Completed</div>
                    <div className="trigger-task">Task: Design System Update</div>
                  </div>
                  <div className="row-cell result">
                    <span className="result-badge success">Success</span>
                  </div>
                  <div className="row-cell time">
                    <div className="time-ago">2 hours ago</div>
                    <div className="time-exact">14:30</div>
                  </div>
                  <div className="row-cell details">
                    <button className="btn-secondary btn-sm">View Log</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="history-stats">
              <div className="stat-card">
                <div className="stat-value">24</div>
                <div className="stat-label">Executions Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">98%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">5</div>
                <div className="stat-label">Active Workflows</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Total Workflows</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="builder-sidebar">
        <div className="sidebar-section">
          <h4 className="section-title">Triggers</h4>
          <div className="triggers-list">
            {triggers.map(trigger => (
              <button
                key={trigger.id}
                className={`trigger-item ${selectedTrigger === trigger.id ? 'selected' : ''}`}
                onClick={() => addTrigger(trigger.id)}
                disabled={selectedTrigger !== '' && selectedTrigger !== trigger.id}
              >
                <div className="trigger-icon">{trigger.icon}</div>
                <div className="trigger-content">
                  <div className="trigger-name">{trigger.name}</div>
                  <div className="trigger-description">{trigger.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="sidebar-section">
          <h4 className="section-title">Actions</h4>
          <div className="actions-list">
            {actions.map(action => (
              <button
                key={action.id}
                className={`action-item ${selectedActions.includes(action.id) ? 'selected' : ''}`}
                onClick={() => addAction(action.id)}
                disabled={selectedTrigger === ''}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <div className="action-name">{action.name}</div>
                  <div className="action-description">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="sidebar-section">
          <h4 className="section-title">Workflow Tips</h4>
          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <div className="tip-text">Start with a clear trigger event</div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">⚡</div>
              <div className="tip-text">Keep workflows simple and focused</div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🔧</div>
              <div className="tip-text">Test workflows before enabling them</div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📊</div>
              <div className="tip-text">Monitor workflow execution history</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;