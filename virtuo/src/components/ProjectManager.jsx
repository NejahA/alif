import React, { useState } from 'react';
import { Save, FolderOpen, FileJson, Trash2, Download, Upload, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectManager({ onSave, onLoad, currentData }) {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('virtuo_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const randomizeAll = () => {
    window.dispatchEvent(new CustomEvent('virtuo-randomize'));
  };

  const saveProject = () => {
    const name = prompt("Enter project name:");
    if (!name) return;
    
    const newProject = {
      id: Date.now(),
      name,
      date: new Date().toLocaleString(),
      data: currentData
    };
    
    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem('virtuo_projects', JSON.stringify(updated));
  };

  const loadProject = (project) => {
    if (confirm(`Load project "${project.name}"? This will overwrite your current session.`)) {
      onLoad(project.data);
    }
  };

  const deleteProject = (id) => {
    if (confirm("Delete this project?")) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('virtuo_projects', JSON.stringify(updated));
    }
  };

  const exportProject = (project) => {
    const dataStr = JSON.stringify(project);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${project.name.replace(/\s+/g, '_')}_project.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target.result);
        if (project.name && project.data) {
          const updated = [...projects, { ...project, id: Date.now() }];
          setProjects(updated);
          localStorage.setItem('virtuo_projects', JSON.stringify(updated));
        }
      } catch (err) {
        alert("Invalid project file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '900px', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Project Manager</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Save and recall your entire studio state.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="btn-glass" style={{ cursor: 'pointer' }}>
            <Upload size={18} /> Import
            <input type="file" accept=".json" onChange={importProject} style={{ display: 'none' }} />
          </label>
          <button className="btn-glass active" onClick={saveProject}>
            <Save size={18} /> New Snapshot
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {projects.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FolderOpen size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
            <p>No projects saved yet. Create a snapshot to save your session.</p>
          </div>
        ) : (
          projects.map(project => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.02 }}
              className="glass-panel"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{project.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{project.date}</span>
                </div>
                <FileJson size={20} color="var(--accent-primary)" />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  className="btn-glass" 
                  onClick={() => loadProject(project)}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  Load
                </button>
                <button 
                  className="btn-glass" 
                  onClick={() => exportProject(project)}
                  style={{ padding: '8px' }}
                  title="Export"
                >
                  <Download size={16} />
                </button>
                <button 
                  className="btn-glass" 
                  onClick={() => deleteProject(project.id)}
                  style={{ padding: '8px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
