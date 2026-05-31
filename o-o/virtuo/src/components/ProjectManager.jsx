import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, HardDrive, FileMusic, AlertCircle } from 'lucide-react';

const ProjectManager = ({ onSave, onLoad }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.virtuo')) {
      alert("Invalid file format. Please drop a .virtuo file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onLoad(data);
      } catch (e) {
        alert("Failed to parse project file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HardDrive size={24} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Project Management</h3>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
        Save your active tab, volume state, themes, and arrangements to your local hard drive.
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Save Box */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '30px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)' }}>
            <Save size={32} color="#10b981" />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Export .virtuo File</span>
        </motion.div>

        {/* Load Box */}
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '30px',
            background: dragActive ? 'rgba(59, 130, 246, 0.2)' : 'var(--glass-bg)',
            border: `2px dashed ${dragActive ? '#3b82f6' : 'var(--glass-border)'}`,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".virtuo"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)' }}>
            <Upload size={32} color="#3b82f6" />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
            {dragActive ? "Drop File Here" : "Load or Drag .virtuo"}
          </span>
        </motion.div>
      </div>

      <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9, lineHeight: 1.5 }}>
          <strong>Note:</strong> Browsers do not allow saving massive audio buffers directly in localStorage. The .virtuo file saves your session parameters, but live-recorded Looper or Sampler audio must be exported separately via the Recording Gallery.
        </p>
      </div>
    </div>
  );
};

export default ProjectManager;
