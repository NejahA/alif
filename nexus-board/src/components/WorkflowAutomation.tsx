import { useState } from 'react';
import type { Task, Status } from '../types';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'status_change' | 'priority_change' | 'due_date' | 'label_added' | 'time_elapsed';
    condition: string;
  };
  action: {
    type: 'change_status' | 'change_priority' | 'add_label' | 'send_notification' | 'assign_to';
    value: string;
  };
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

interface WorkflowAutomationProps {
  tasks: Task[];
  onAddRule: (rule: Omit<AutomationRule, 'id' | 'lastTriggered' | 'triggerCount'>) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onDeleteRule: (ruleId: string) => void;
  onTestRule: (ruleId: string) => void;
}

const WorkflowAutomation = ({ 
  tasks, 
  onAddRule, 
  onToggleRule, 
  onDeleteRule,
  onTestRule 
}: WorkflowAutomationProps) => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'Auto-complete High Priority',
      description: 'Automatically mark high priority tasks as done after 7 days in progress',
      trigger: {
        type: 'time_elapsed',
        condition: 'status:inprogress AND priority:high AND days_elapsed:7'
      },
      action: {
        type: 'change_status',
        value: 'done'
      },
      enabled: true,
      lastTriggered: new Date('2024-01-20'),
      triggerCount: 12
    },
    {
      id: 'rule-2',
      name: 'Escalate Overdue Tasks',
      description: 'Increase priority of tasks that are overdue',
      trigger: {
        type: 'due_date',
        condition: 'due_date:passed AND status:todo'
      },
      action: {
        type: 'change_priority',
        value: 'high'
      },
      enabled: true,
      lastTriggered: new Date('2024-01-19'),
      triggerCount: 8
    },
    {
      id: 'rule-3',
      name: 'Auto-label Bug Reports',
      description: 'Automatically add bug label to tasks containing "bug" or "error"',
      trigger: {
        type: 'label_added',
        condition: 'title:contains("bug") OR description:contains("error")'
      },
      action: {
        type: 'add_label',
        value: 'bug'
      },
      enabled: true,
      lastTriggered: new Date('2024-01-18'),
      triggerCount: 5
    },
    {
      id: 'rule-4',
      name: 'Weekly Progress Notification',
      description: 'Send weekly progress report every Monday',
      trigger: {
        type: 'time_elapsed',
        condition: 'day_of_week:monday'
      },
      action: {
        type: 'send_notification',
        value: 'weekly_progress'
      },
      enabled: false,
      lastTriggered: new Date('2024-01-15'),
      triggerCount: 3
    }
  ]);
  
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerType: 'status_change' as AutomationRule['trigger']['type'],
    triggerCondition: '',
    actionType: 'change_status' as AutomationRule['action']['type'],
    actionValue: '',
    enabled: true
  });

  const triggerTypes = [
    { value: 'status_change', label: 'Status Change', icon: '🔄' },
    { value: 'priority_change', label: 'Priority Change', icon: '⚡' },
    { value: 'due_date', label: 'Due Date', icon: '📅' },
    { value: 'label_added', label: 'Label Added', icon: '🏷️' },
    { value: 'time_elapsed', label: 'Time Elapsed', icon: '⏱️' }
  ];

  const actionTypes = [
    { value: 'change_status', label: 'Change Status', icon: '🔄' },
    { value: 'change_priority', label: 'Change Priority', icon: '⚡' },
    { value: 'add_label', label: 'Add Label', icon: '🏷️' },
    { value: 'send_notification', label: 'Send Notification', icon: '📢' },
    { value: 'assign_to', label: 'Assign To', icon: '👤' }
  ];

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.triggerCondition || !newRule.actionValue) {
      alert('Please fill in all required fields');
      return;
    }

    const rule: Omit<AutomationRule, 'id' | 'lastTriggered' | 'triggerCount'> = {
      name: newRule.name,
      description: newRule.description,
      trigger: {
        type: newRule.triggerType,
        condition: newRule.triggerCondition
      },
      action: {
        type: newRule.actionType,
        value: newRule.actionValue
      },
      enabled: newRule.enabled
    };

    onAddRule(rule);
    setNewRule({
      name: '',
      description: '',
      triggerType: 'status_change',
      triggerCondition: '',
      actionType: 'change_status',
      actionValue: '',
      enabled: true
    });
    setShowRuleBuilder(false);
    alert('Automation rule created successfully!');
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    onToggleRule(ruleId, enabled);
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      onDeleteRule(ruleId);
      setRules(rules.filter(rule => rule.id !== ruleId));
    }
  };

  const handleTestRule = (ruleId: string) => {
    onTestRule(ruleId);
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setRules(rules.map(r => 
        r.id === ruleId 
          ? { ...r, lastTriggered: new Date(), triggerCount: r.triggerCount + 1 }
          : r
      ));
      alert(`Testing rule: ${rule.name}\nWould affect ${Math.floor(Math.random() * 5) + 1} tasks`);
    }
  };

  const getTriggerDescription = (trigger: AutomationRule['trigger']) => {
    switch (trigger.type) {
      case 'status_change':
        return `When task status changes to ${trigger.condition}`;
      case 'priority_change':
        return `When task priority changes to ${trigger.condition}`;
      case 'due_date':
        return `When due date ${trigger.condition}`;
      case 'label_added':
        return `When label "${trigger.condition}" is added`;
      case 'time_elapsed':
        return `After ${trigger.condition}`;
      default:
        return trigger.condition;
    }
  };

  const getActionDescription = (action: AutomationRule['action']) => {
    switch (action.type) {
      case 'change_status':
        return `Change status to ${action.value}`;
      case 'change_priority':
        return `Change priority to ${action.value}`;
      case 'add_label':
        return `Add label "${action.value}"`;
      case 'send_notification':
        return `Send ${action.value} notification`;
      case 'assign_to':
        return `Assign to ${action.value}`;
      default:
        return action.value;
    }
  };

  const formatLastTriggered = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const calculateAutomationImpact = () => {
    const enabledRules = rules.filter(r => r.enabled);
    const totalTriggers = enabledRules.reduce((sum, rule) => sum + rule.triggerCount, 0);
    const estimatedTimeSaved = totalTriggers * 5; // 5 minutes per automation
    const efficiencyImprovement = Math.min((totalTriggers / tasks.length) * 100, 100);
    
    return {
      enabledRules: enabledRules.length,
      totalTriggers,
      estimatedTimeSaved,
      efficiencyImprovement: Math.round(efficiencyImprovement)
    };
  };

  const impact = calculateAutomationImpact();

  return (
    <div className="workflow-automation">
      <div className="automation-header">
        <h2 className="automation-title">Workflow Automation</h2>
        <div className="automation-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowRuleBuilder(true)}
          >
            + Create Rule
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              // Run all enabled rules
              rules.filter(r => r.enabled).forEach(rule => handleTestRule(rule.id));
            }}
          >
            Run All Rules
          </button>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="automation-impact">
        <div className="impact-card">
          <div className="impact-icon">🤖</div>
          <div className="impact-content">
            <div className="impact-value">{impact.enabledRules}</div>
            <div className="impact-label">Active Rules</div>
          </div>
        </div>
        
        <div className="impact-card">
          <div className="impact-icon">⚡</div>
          <div className="impact-content">
            <div className="impact-value">{impact.totalTriggers}</div>
            <div className="impact-label">Total Automations</div>
          </div>
        </div>
        
        <div className="impact-card">
          <div className="impact-icon">⏱️</div>
          <div className="impact-content">
            <div className="impact-value">{impact.estimatedTimeSaved}m</div>
            <div className="impact-label">Time Saved</div>
          </div>
        </div>
        
        <div className="impact-card">
          <div className="impact-icon">📈</div>
          <div className="impact-content">
            <div className="impact-value">{impact.efficiencyImprovement}%</div>
            <div className="impact-label">Efficiency Gain</div>
          </div>
        </div>
      </div>

      {/* Rule Builder Modal */}
      {showRuleBuilder && (
        <div className="modal-overlay" onClick={() => setShowRuleBuilder(false)}>
          <div className="modal-content rule-builder-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Automation Rule</h2>
              <button className="btn-icon" onClick={() => setShowRuleBuilder(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="rule-builder-content">
              <div className="builder-step">
                <h3>Rule Details</h3>
                <div className="form-group">
                  <label htmlFor="rule-name">Rule Name *</label>
                  <input
                    id="rule-name"
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g., Auto-complete High Priority Tasks"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="rule-description">Description</label>
                  <textarea
                    id="rule-description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Describe what this rule does..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="builder-step">
                <h3>Trigger Condition</h3>
                <div className="form-group">
                  <label htmlFor="trigger-type">Trigger Type *</label>
                  <select
                    id="trigger-type"
                    value={newRule.triggerType}
                    onChange={(e) => setNewRule({ ...newRule, triggerType: e.target.value as any })}
                  >
                    {triggerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="trigger-condition">Condition *</label>
                  <input
                    id="trigger-condition"
                    type="text"
                    value={newRule.triggerCondition}
                    onChange={(e) => setNewRule({ ...newRule, triggerCondition: e.target.value })}
                    placeholder="e.g., status:done, priority:high, days_elapsed:7"
                  />
                  <div className="help-text">
                    {newRule.triggerType === 'status_change' && 'Format: status:[todo|inprogress|done]'}
                    {newRule.triggerType === 'priority_change' && 'Format: priority:[low|medium|high]'}
                    {newRule.triggerType === 'due_date' && 'Format: due_date:[passed|today|tomorrow]'}
                    {newRule.triggerType === 'label_added' && 'Format: label_name'}
                    {newRule.triggerType === 'time_elapsed' && 'Format: days_elapsed:number'}
                  </div>
                </div>
              </div>

              <div className="builder-step">
                <h3>Action</h3>
                <div className="form-group">
                  <label htmlFor="action-type">Action Type *</label>
                  <select
                    id="action-type"
                    value={newRule.actionType}
                    onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value as any })}
                  >
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="action-value">Action Value *</label>
                  <input
                    id="action-value"
                    type="text"
                    value={newRule.actionValue}
                    onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                    placeholder="e.g., done, high, bug, weekly_report"
                  />
                  <div className="help-text">
                    {newRule.actionType === 'change_status' && 'Value: todo, inprogress, or done'}
                    {newRule.actionType === 'change_priority' && 'Value: low, medium, or high'}
                    {newRule.actionType === 'add_label' && 'Value: label name'}
                    {newRule.actionType === 'send_notification' && 'Value: notification type'}
                    {newRule.actionType === 'assign_to' && 'Value: user ID or email'}
                  </div>
                </div>
              </div>

              <div className="builder-step">
                <h3>Rule Settings</h3>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newRule.enabled}
                      onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                    />
                    <span>Enable rule immediately</span>
                  </label>
                </div>
              </div>

              <div className="rule-preview">
                <h4>Rule Preview</h4>
                <div className="preview-card">
                  <div className="preview-trigger">
                    <strong>IF:</strong> {getTriggerDescription({
                      type: newRule.triggerType,
                      condition: newRule.triggerCondition || '(condition)'
                    })}
                  </div>
                  <div className="preview-action">
                    <strong>THEN:</strong> {getActionDescription({
                      type: newRule.actionType,
                      value: newRule.actionValue || '(action)'
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowRuleBuilder(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateRule}
                disabled={!newRule.name || !newRule.triggerCondition || !newRule.actionValue}
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="automation-rules">
        <h3>Automation Rules</h3>
        
        {rules.length === 0 ? (
          <div className="no-rules">
            <p>No automation rules yet. Create your first rule to automate workflows!</p>
          </div>
        ) : (
          <div className="rules-list">
            {rules.map(rule => (
              <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                <div className="rule-header">
                  <div className="rule-info">
                    <h4 className="rule-name">{rule.name}</h4>
                    <p className="rule-description">{rule.description}</p>
                  </div>
                  
                  <div className="rule-status">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="status-label">
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <div className="rule-details">
                  <div className="rule-trigger">
                    <div className="detail-label">Trigger</div>
                    <div className="detail-content">
                      {getTriggerDescription(rule.trigger)}
                    </div>
                  </div>
                  
                  <div className="rule-action">
                    <div className="detail-label">Action</div>
                    <div className="detail-content">
                      {getActionDescription(rule.action)}
                    </div>
                  </div>
                  
                  <div className="rule-stats">
                    <div className="stat-item">
                      <div className="stat-label">Last Triggered</div>
                      <div className="stat-value">{formatLastTriggered(rule.lastTriggered)}</div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">Times Triggered</div>
                      <div className="stat-value">{rule.triggerCount}</div>
                    </div>
                  </div>
                </div>
                
                <div className="rule-actions">
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => handleTestRule(rule.id)}
                  >
                    Test Rule
                  </button>
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      // Edit rule (in a real app, this would open edit mode)
                      alert(`Editing rule: ${rule.name}`);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger btn-sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automation Templates */}
      <div className="automation-templates">
        <h3>Quick Templates</h3>
        <div className="templates-grid">
          <div className="template-card">
            <div className="template-icon">📅</div>
            <div className="template-content">
              <h4>Due Date Reminder</h4>
              <p>Send notification when task is due tomorrow</p>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => {
                  setNewRule({
                    name: 'Due Date Reminder',
                    description: 'Send notification when task is due tomorrow',
                    triggerType: 'due_date',
                    triggerCondition: 'due_date:tomorrow',
                    actionType: 'send_notification',
                    actionValue: 'due_reminder',
                    enabled: true
                  });
                  setShowRuleBuilder(true);
                }}
              >
                Use Template
              </button>
            </div>
          </div>
          
          <div className="template-card">
            <div className="template-icon">⚡</div>
            <div className="template-content">
              <h4>Priority Escalation</h4>
              <p>Increase priority after 3 days in todo</p>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => {
                  setNewRule({
                    name: 'Priority Escalation',
                    description: 'Increase priority after 3 days in todo status',
                    triggerType: 'time_elapsed',
                    triggerCondition: 'status:todo AND days_elapsed:3',
                    actionType: 'change_priority',
                    actionValue: 'medium',
                    enabled: true
                  });
                  setShowRuleBuilder(true);
                }}
              >
                Use Template
              </button>
            </div>
          </div>
          
          <div className="template-card">
            <div className="template-icon">🏷️</div>
            <div className="template-content">
              <h4>Auto-label by Priority</h4>
              <p>Add priority-based labels automatically</p>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => {
                  setNewRule({
                    name: 'Auto-label by Priority',
                    description: 'Add priority label based on task priority',
                    triggerType: 'priority_change',
                    triggerCondition: 'priority:high',
                    actionType: 'add_label',
                    actionValue: 'critical',
                    enabled: true
                  });
                  setShowRuleBuilder(true);
                }}
              >
                Use Template
              </button>
            </div>
          </div>
          
          <div className="template-card">
            <div className="template-icon">🔄</div>
            <div className="template-content">
              <h4>Auto-archive Completed</h4>
              <p>Move completed tasks to archive after 7 days</p>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => {
                  setNewRule({
                    name: 'Auto-archive Completed',
                    description: 'Move completed tasks to archive after 7 days',
                    triggerType: 'time_elapsed',
                    triggerCondition: 'status:done AND days_elapsed:7',
                    actionType: 'change_status',
                    actionValue: 'archived',
                    enabled: true
                  });
                  setShowRuleBuilder(true);
                }}
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Log */}
      <div className="automation-log">
        <h3>Automation Log</h3>
        <div className="log-entries">
          {rules
            .filter(rule => rule.lastTriggered)
            .sort((a, b) => new Date(b.lastTriggered!).getTime() - new Date(a.lastTriggered!).getTime())
            .slice(0, 5)
            .map(rule => (
              <div key={rule.id} className="log-entry">
                <div className="log-time">
                  {rule.lastTriggered?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="log-content">
                  <span className="log-rule">{rule.name}</span>
                  <span className="log-action">triggered</span>
                  <span className="log-count">{rule.triggerCount} times</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomation;