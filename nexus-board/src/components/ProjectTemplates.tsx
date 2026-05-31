import { useState } from 'react';
import type { Task } from '../types';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'development' | 'design' | 'marketing' | 'management' | 'personal';
  tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[];
  color: string;
}

interface ProjectTemplatesProps {
  onApplyTemplate: (tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

const ProjectTemplates = ({ onApplyTemplate }: ProjectTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const templates: ProjectTemplate[] = [
    {
      id: 'web-dev',
      name: 'Web Development',
      description: 'Complete web development project template with common tasks',
      icon: '💻',
      category: 'development',
      color: '#6366f1',
      tasks: [
        {
          title: 'Project Setup',
          description: 'Initialize project repository and setup development environment',
          priority: 'high',
          status: 'todo',
          labels: ['setup', 'development']
        },
        {
          title: 'UI Design',
          description: 'Create wireframes and design mockups',
          priority: 'high',
          status: 'todo',
          labels: ['design', 'ui']
        },
        {
          title: 'Frontend Development',
          description: 'Implement user interface components',
          priority: 'medium',
          status: 'todo',
          labels: ['frontend', 'development']
        },
        {
          title: 'Backend API',
          description: 'Develop server-side API endpoints',
          priority: 'medium',
          status: 'todo',
          labels: ['backend', 'api']
        },
        {
          title: 'Testing',
          description: 'Write and run unit and integration tests',
          priority: 'medium',
          status: 'todo',
          labels: ['testing', 'quality']
        },
        {
          title: 'Deployment',
          description: 'Deploy application to production environment',
          priority: 'low',
          status: 'todo',
          labels: ['deployment', 'devops']
        }
      ]
    },
    {
      id: 'product-launch',
      name: 'Product Launch',
      description: 'Template for launching a new product or feature',
      icon: '🚀',
      category: 'marketing',
      color: '#10b981',
      tasks: [
        {
          title: 'Market Research',
          description: 'Analyze target market and competitors',
          priority: 'high',
          status: 'todo',
          labels: ['research', 'marketing']
        },
        {
          title: 'Marketing Strategy',
          description: 'Develop comprehensive marketing plan',
          priority: 'high',
          status: 'todo',
          labels: ['strategy', 'marketing']
        },
        {
          title: 'Content Creation',
          description: 'Create marketing materials and content',
          priority: 'medium',
          status: 'todo',
          labels: ['content', 'marketing']
        },
        {
          title: 'Launch Campaign',
          description: 'Execute product launch campaign',
          priority: 'medium',
          status: 'todo',
          labels: ['launch', 'campaign']
        },
        {
          title: 'Analytics Setup',
          description: 'Configure analytics and tracking',
          priority: 'low',
          status: 'todo',
          labels: ['analytics', 'tracking']
        }
      ]
    },
    {
      id: 'agile-sprint',
      name: 'Agile Sprint',
      description: 'Two-week agile sprint template for software teams',
      icon: '🏃',
      category: 'management',
      color: '#f59e0b',
      tasks: [
        {
          title: 'Sprint Planning',
          description: 'Plan sprint goals and select backlog items',
          priority: 'high',
          status: 'todo',
          labels: ['planning', 'agile']
        },
        {
          title: 'Daily Standups',
          description: 'Daily team synchronization meetings',
          priority: 'medium',
          status: 'todo',
          labels: ['meetings', 'agile']
        },
        {
          title: 'Feature Development',
          description: 'Implement planned features',
          priority: 'high',
          status: 'todo',
          labels: ['development', 'features']
        },
        {
          title: 'Code Review',
          description: 'Review team member code changes',
          priority: 'medium',
          status: 'todo',
          labels: ['review', 'quality']
        },
        {
          title: 'Sprint Review',
          description: 'Demo completed work to stakeholders',
          priority: 'medium',
          status: 'todo',
          labels: ['review', 'demo']
        },
        {
          title: 'Retrospective',
          description: 'Reflect on sprint and identify improvements',
          priority: 'low',
          status: 'todo',
          labels: ['retrospective', 'improvement']
        }
      ]
    },
    {
      id: 'ui-design',
      name: 'UI Design Project',
      description: 'Complete UI/UX design project workflow',
      icon: '🎨',
      category: 'design',
      color: '#8b5cf6',
      tasks: [
        {
          title: 'User Research',
          description: 'Conduct user interviews and surveys',
          priority: 'high',
          status: 'todo',
          labels: ['research', 'ux']
        },
        {
          title: 'Wireframing',
          description: 'Create low-fidelity wireframes',
          priority: 'high',
          status: 'todo',
          labels: ['wireframes', 'design']
        },
        {
          title: 'Visual Design',
          description: 'Develop high-fidelity mockups',
          priority: 'medium',
          status: 'todo',
          labels: ['visual', 'design']
        },
        {
          title: 'Prototyping',
          description: 'Create interactive prototypes',
          priority: 'medium',
          status: 'todo',
          labels: ['prototype', 'interactive']
        },
        {
          title: 'User Testing',
          description: 'Test designs with real users',
          priority: 'medium',
          status: 'todo',
          labels: ['testing', 'validation']
        },
        {
          title: 'Design Handoff',
          description: 'Prepare assets for development',
          priority: 'low',
          status: 'todo',
          labels: ['handoff', 'development']
        }
      ]
    },
    {
      id: 'personal-goals',
      name: 'Personal Goals',
      description: 'Template for personal development and goal tracking',
      icon: '🎯',
      category: 'personal',
      color: '#06b6d4',
      tasks: [
        {
          title: 'Goal Setting',
          description: 'Define personal and professional goals',
          priority: 'high',
          status: 'todo',
          labels: ['goals', 'planning']
        },
        {
          title: 'Skill Development',
          description: 'Learn new skills or improve existing ones',
          priority: 'medium',
          status: 'todo',
          labels: ['learning', 'skills']
        },
        {
          title: 'Health & Wellness',
          description: 'Track fitness and wellness activities',
          priority: 'medium',
          status: 'todo',
          labels: ['health', 'wellness']
        },
        {
          title: 'Financial Planning',
          description: 'Budgeting and financial goal tracking',
          priority: 'medium',
          status: 'todo',
          labels: ['finance', 'budget']
        },
        {
          title: 'Hobby Projects',
          description: 'Work on personal hobby projects',
          priority: 'low',
          status: 'todo',
          labels: ['hobbies', 'personal']
        },
        {
          title: 'Progress Review',
          description: 'Review progress towards goals',
          priority: 'low',
          status: 'todo',
          labels: ['review', 'progress']
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋' },
    { id: 'development', name: 'Development', icon: '💻' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'management', name: 'Management', icon: '👔' },
    { id: 'personal', name: 'Personal', icon: '👤' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyTemplate = (template: ProjectTemplate) => {
    if (confirm(`Apply "${template.name}" template? This will add ${template.tasks.length} tasks to your board.`)) {
      onApplyTemplate(template.tasks);
    }
  };

  const handleCustomTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      const description = prompt('Enter template description:');
      const category = prompt('Enter category (development/design/marketing/management/personal):');
      
      if (description && category) {
        const newTemplate: ProjectTemplate = {
          id: crypto.randomUUID(),
          name,
          description,
          icon: '📝',
          category: category as any,
          color: '#6366f1',
          tasks: []
        };
        
        alert(`Template "${name}" created! You can now add tasks to it.`);
        // In a real app, you would save this template
      }
    }
  };

  return (
    <div className="project-templates">
      <div className="templates-header">
        <h2 className="templates-title">Project Templates</h2>
        <div className="templates-controls">
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="search-input"
            />
          </div>
          <button 
            className="btn-primary"
            onClick={handleCustomTemplate}
          >
            Create Custom Template
          </button>
        </div>
      </div>

      <div className="templates-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <p>No templates found matching your search.</p>
            <button 
              className="btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-card"
              style={{ borderLeftColor: template.color }}
            >
              <div className="template-header">
                <div className="template-icon" style={{ backgroundColor: template.color }}>
                  {template.icon}
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  <div className="template-meta">
                    <span className="template-category">{template.category}</span>
                    <span className="template-task-count">{template.tasks.length} tasks</span>
                  </div>
                </div>
              </div>

              <div className="template-tasks">
                <h4 className="tasks-title">Included Tasks:</h4>
                <ul className="tasks-list">
                  {template.tasks.slice(0, 4).map((task, index) => (
                    <li key={index} className="task-item">
                      <span className="task-title">{task.title}</span>
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </li>
                  ))}
                  {template.tasks.length > 4 && (
                    <li className="task-item more-tasks">
                      +{template.tasks.length - 4} more tasks
                    </li>
                  )}
                </ul>
              </div>

              <div className="template-actions">
                <button 
                  className="btn-primary"
                  onClick={() => handleApplyTemplate(template)}
                >
                  Apply Template
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    // Preview template
                    alert(`Previewing "${template.name}" template with ${template.tasks.length} tasks`);
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="templates-stats">
        <div className="template-stat">
          <span className="stat-value">{templates.length}</span>
          <span className="stat-label">Available Templates</span>
        </div>
        <div className="template-stat">
          <span className="stat-value">
            {templates.reduce((total, template) => total + template.tasks.length, 0)}
          </span>
          <span className="stat-label">Total Template Tasks</span>
        </div>
        <div className="template-stat">
          <span className="stat-value">
            {new Set(templates.map(t => t.category)).size}
          </span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="template-stat">
          <span className="stat-value">5</span>
          <span className="stat-label">Most Used</span>
        </div>
      </div>

      <div className="templates-info">
        <h4>How to Use Templates</h4>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h5>Browse Templates</h5>
              <p>Explore templates by category or search for specific needs</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h5>Preview Tasks</h5>
              <p>Review the included tasks before applying the template</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h5>Apply Template</h5>
              <p>Add all template tasks to your project board with one click</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h5>Customize</h5>
              <p>Modify the added tasks to fit your specific project needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplates;