import { useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import allProjectsData from '../data/allWorkspaceProjects.json';
import {
  Search,
  FolderOpen,
  Code2,
  Play,
  Terminal,
  Globe,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Command
} from 'lucide-react';

export interface ProjectEntry {
  name: string;
  title: string;
  description: string;
  version: string;
  category: string;
  icon: string;
  techStack: string[];
  path: string;
  relativePath: string;
  scripts: Record<string, string>;
  hasPackageJson: boolean;
  hasHtml: boolean;
  isFlutter: boolean;
  fileCount: number;
}

export default function WorkspaceUniverseTab() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | null>(null);
  const [customCommand, setCustomCommand] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const projects = allProjectsData as unknown as ProjectEntry[];

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = search.toLowerCase();
      const matchQuery = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.techStack && p.techStack.some(t => t.toLowerCase().includes(q)));
      return matchCat && matchQuery;
    });
  }, [projects, selectedCategory, search]);

  const handleOpenExplorer = async (pathStr: string) => {
    try {
      await invoke('open_in_explorer', { folderPath: pathStr });
      showNotice(`Explorer opened: ${pathStr}`);
    } catch (err) {
      showNotice(`Could not open explorer: ${err}`);
    }
  };

  const handleOpenVSCode = async (pathStr: string) => {
    try {
      await invoke('open_in_vscode', { folderPath: pathStr });
      showNotice(`VS Code launched: ${pathStr}`);
    } catch (err) {
      showNotice(`Could not open VS Code: ${err}`);
    }
  };

  const handleRunCommand = async (pathStr: string, cmd?: string) => {
    try {
      await invoke('run_project_terminal', { folderPath: pathStr, command: cmd || null });
      showNotice(`Started process: ${cmd || 'default dev process'} in ${pathStr}`);
    } catch (err) {
      showNotice(`Error launching process: ${err}`);
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getDefaultRunCommand = (p: ProjectEntry) => {
    if (p.scripts) {
      if (p.scripts['dev']) return 'npm run dev';
      if (p.scripts['start']) return 'npm start';
      if (p.scripts['serve']) return 'npm run serve';
      const firstKey = Object.keys(p.scripts)[0];
      if (firstKey) return `npm run ${firstKey}`;
    }
    if (p.isFlutter) return 'flutter run';
    if (p.techStack?.includes('Rust')) return 'cargo run';
    if (p.techStack?.includes('Python')) return 'python main.py';
    return 'npm test';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="hero-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>🌌 Alif Universe — Run & Launch Any Project</h2>
          <p>
            Run dev servers, execute scripts, and inspect all {projects.length} workspace projects directly from Alif Desktop.
          </p>
        </div>
        <div style={{
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '8px 16px',
          borderRadius: '10px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>{projects.length}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Runnable Projects</div>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid #38bdf8',
          borderRadius: '8px',
          color: '#bae6fd',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} />
          {actionNotice}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input
            className="greet-input"
            style={{ width: '100%', paddingLeft: '38px' }}
            placeholder={`Search across ${projects.length} projects by name, keyword, or technology...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                background: selectedCategory === cat ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.5)',
                color: selectedCategory === cat ? '#38bdf8' : '#94a3b8'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Inspector Split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1fr 380px' : '1fr', gap: '16px' }}>
        {/* Projects Cards List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
          maxHeight: '640px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {filteredProjects.map((p) => {
            const isSelected = selectedProject?.name === p.name;
            const defaultCmd = getDefaultRunCommand(p);

            return (
              <div
                key={p.name}
                onClick={() => {
                  setSelectedProject(p);
                  setCustomCommand(defaultCmd);
                }}
                style={{
                  background: isSelected ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{p.icon || '📦'}</span>
                    <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{p.name}</strong>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8'
                  }}>
                    {p.category}
                  </span>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {p.description || p.title || 'Workspace project module.'}
                </p>

                {/* Quick Run & Tech Tags */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {p.techStack && p.techStack.slice(0, 2).map((t, i) => (
                      <span key={i} style={{
                        fontSize: '10px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38bdf8',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunCommand(p.path, defaultCmd);
                    }}
                    style={{
                      background: 'rgba(52, 211, 153, 0.15)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      color: '#34d399',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={12} fill="#34d399" />
                    Run
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Project Side Drawer */}
        {selectedProject && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: 'fit-content'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{selectedProject.icon || '📦'}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedProject.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#38bdf8' }}>{selectedProject.category}</span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {selectedProject.description || selectedProject.title || 'No description provided.'}
            </p>

            {/* Run Section */}
            <div style={{
              background: 'rgba(11, 15, 25, 0.7)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                <Terminal size={15} />
                <span>Execute & Launch Process</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="greet-input"
                  style={{ flex: 1, fontSize: '12px', padding: '8px 10px', fontFamily: 'monospace' }}
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  placeholder="e.g. npm run dev"
                />
                <button
                  onClick={() => handleRunCommand(selectedProject.path, customCommand)}
                  style={{
                    background: '#22c55e',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#052e16',
                    fontWeight: 700,
                    padding: '8px 14px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Play size={13} fill="#052e16" />
                  Launch
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleOpenExplorer(selectedProject.path)}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '9px'
                }}
              >
                <FolderOpen size={15} />
                Explorer
              </button>

              <button
                onClick={() => handleOpenVSCode(selectedProject.path)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  padding: '9px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Code2 size={15} />
                VS Code
              </button>
            </div>

            {/* Package Scripts */}
            {selectedProject.scripts && Object.keys(selectedProject.scripts).length > 0 && (
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Runnable Scripts (Click to Run)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {Object.entries(selectedProject.scripts).map(([cmd, script]) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setCustomCommand(`npm run ${cmd}`);
                        handleRunCommand(selectedProject.path, `npm run ${cmd}`);
                      }}
                      style={{
                        fontSize: '11px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#f1f5f9',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Play size={10} fill="#38bdf8" />
                        {cmd}
                      </span>
                      <span style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                        {script}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                Technologies & Frameworks
              </span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                {selectedProject.techStack && selectedProject.techStack.length > 0 ? (
                  selectedProject.techStack.map((t, i) => (
                    <span key={i} style={{
                      fontSize: '11px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {t}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>None detected</span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
              <strong>Path:</strong> {selectedProject.relativePath}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
