import { useState, useEffect, useRef } from 'react';
import type { Task } from '../types';

interface ARVisualizationProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
}

const ARVisualization = ({ tasks, onTaskSelect }: ARVisualizationProps) => {
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'vr'>('3d');
  const [selectedLayer, setSelectedLayer] = useState<'priority' | 'status' | 'timeline'>('priority');
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getTaskColor = (task: Task) => {
    switch (task.priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTaskSize = (task: Task) => {
    switch (task.priority) {
      case 'high': return 1.5;
      case 'medium': return 1.2;
      case 'low': return 0.8;
      default: return 1;
    }
  };

  const getTaskPosition = (task: Task, index: number) => {
    const totalTasks = tasks.length;
    const angle = (index / totalTasks) * Math.PI * 2;
    const radius = 3 + (task.priority === 'high' ? 1 : 0);
    
    return {
      x: Math.cos(angle) * radius,
      y: task.priority === 'high' ? 1 : task.priority === 'medium' ? 0 : -1,
      z: Math.sin(angle) * radius
    };
  };

  const render3DScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw 3D grid lines
    for (let i = -5; i <= 5; i++) {
      // X-axis lines
      ctx.beginPath();
      ctx.moveTo(250 + i * 30, 0);
      ctx.lineTo(250 + i * 30, 500);
      ctx.stroke();
      
      // Y-axis lines
      ctx.beginPath();
      ctx.moveTo(0, 250 + i * 30);
      ctx.lineTo(500, 250 + i * 30);
      ctx.stroke();
    }

    // Draw tasks as 3D spheres
    tasks.forEach((task, index) => {
      const position = getTaskPosition(task, index);
      const screenX = 250 + position.x * 30;
      const screenY = 250 + position.y * 30;
      const size = getTaskSize(task) * 20;
      const color = getTaskColor(task);

      // Draw sphere with gradient
      const gradient = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, size
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, `${color}80`);

      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw highlight
      ctx.beginPath();
      ctx.arc(screenX - size * 0.3, screenY - size * 0.3, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();

      // Draw label
      if (showLabels) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(task.title.substring(0, 15), screenX, screenY + size + 15);
        
        // Draw status badge
        ctx.fillStyle = task.status === 'done' ? '#10b981' : 
                        task.status === 'inprogress' ? '#f59e0b' : '#6b7280';
        ctx.beginPath();
        ctx.arc(screenX, screenY - size - 10, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connection lines between related tasks
      if (index < tasks.length - 1) {
        const nextPosition = getTaskPosition(tasks[index + 1], index + 1);
        const nextX = 250 + nextPosition.x * 30;
        const nextY = 250 + nextPosition.y * 30;

        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(nextX, nextY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw legend
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('AR Visualization', 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText('High Priority', 20, 60);
    ctx.fillText('Medium Priority', 20, 80);
    ctx.fillText('Low Priority', 20, 100);

    // Draw priority indicators
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(100, 55, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(100, 75, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(100, 95, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    const animate = () => {
      if (autoRotate && canvasRef.current) {
        setCameraPosition(prev => ({
          x: prev.x + 0.01,
          y: prev.y,
          z: prev.z
        }));
      }
      render3DScene();
      requestAnimationFrame(animate);
    };

    animate();
  }, [tasks, viewMode, selectedLayer, cameraPosition, showLabels, autoRotate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked task
    tasks.forEach((task, index) => {
      const position = getTaskPosition(task, index);
      const screenX = 250 + position.x * 30;
      const screenY = 250 + position.y * 30;
      const size = getTaskSize(task) * 20;

      const distance = Math.sqrt(Math.pow(x - screenX, 2) + Math.pow(y - screenY, 2));
      if (distance <= size) {
        onTaskSelect(task.id);
      }
    });
  };

  const exportScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `nextus-ar-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const simulateAR = () => {
    setIsAnimating(true);
    alert('AR mode activated! Point your camera at a flat surface to visualize tasks.');
    
    // Simulate AR scanning
    setTimeout(() => {
      setIsAnimating(false);
      setViewMode('ar');
    }, 2000);
  };

  return (
    <div className="ar-visualization">
      <div className="ar-header">
        <h2 className="ar-title">AR Task Visualization</h2>
        <div className="ar-controls">
          <div className="view-mode-selector">
            <button 
              className={`mode-button ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              3D View
            </button>
            <button 
              className={`mode-button ${viewMode === 'ar' ? 'active' : ''}`}
              onClick={simulateAR}
              disabled={isAnimating}
            >
              {isAnimating ? 'Scanning...' : 'AR View'}
            </button>
            <button 
              className={`mode-button ${viewMode === 'vr' ? 'active' : ''}`}
              onClick={() => setViewMode('vr')}
            >
              VR View
            </button>
          </div>
          
          <div className="layer-selector">
            <select 
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value as any)}
            >
              <option value="priority">Priority Layer</option>
              <option value="status">Status Layer</option>
              <option value="timeline">Timeline Layer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ar-content">
        <div className="visualization-canvas">
          <canvas 
            ref={canvasRef}
            width={500}
            height={500}
            onClick={handleCanvasClick}
            className="ar-canvas"
          />
          
          <div className="canvas-overlay">
            <div className="overlay-stats">
              <div className="stat-item">
                <span className="stat-value">{tasks.length}</span>
                <span className="stat-label">Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {tasks.filter(t => t.priority === 'high').length}
                </span>
                <span className="stat-label">High Priority</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {tasks.filter(t => t.status === 'done').length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ar-control-panel">
          <div className="control-section">
            <h3 className="section-title">Visualization Controls</h3>
            
            <div className="control-group">
              <label className="control-label">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                Show Labels
              </label>
              
              <label className="control-label">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                />
                Auto Rotate
              </label>
            </div>
            
            <div className="control-group">
              <label className="control-label">Camera Position</label>
              <div className="slider-group">
                <span>X: {cameraPosition.x.toFixed(2)}</span>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={cameraPosition.x}
                  onChange={(e) => setCameraPosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="slider-group">
                <span>Y: {cameraPosition.y.toFixed(2)}</span>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={cameraPosition.y}
                  onChange={(e) => setCameraPosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="slider-group">
                <span>Z: {cameraPosition.z.toFixed(2)}</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={cameraPosition.z}
                  onChange={(e) => setCameraPosition(prev => ({ ...prev, z: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3 className="section-title">Quick Actions</h3>
            
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={exportScene}
              >
                Export Scene
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => {
                  // Reset camera
                  setCameraPosition({ x: 0, y: 0, z: 5 });
                }}
              >
                Reset Camera
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => {
                  // Take screenshot
                  const canvas = canvasRef.current;
                  if (canvas) {
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const item = new ClipboardItem({ 'image/png': blob });
                        navigator.clipboard.write([item]);
                        alert('Screenshot copied to clipboard!');
                      }
                    });
                  }
                }}
              >
                Copy Screenshot
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3 className="section-title">Task Filters</h3>
            
            <div className="filter-buttons">
              <button className="filter-button priority-high">
                High Priority
              </button>
              <button className="filter-button priority-medium">
                Medium Priority
              </button>
              <button className="filter-button priority-low">
                Low Priority
              </button>
              <button className="filter-button status-done">
                Completed
              </button>
              <button className="filter-button status-inprogress">
                In Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ar-stats">
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <div className="stat-value">3D</div>
            <div className="stat-label">Visualization Mode</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{selectedLayer}</div>
            <div className="stat-label">Active Layer</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Visualized Tasks</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">60 FPS</div>
            <div className="stat-label">Performance</div>
          </div>
        </div>
      </div>

      <div className="ar-instructions">
        <h3>How to Use AR Visualization</h3>
        <div className="instructions-grid">
          <div className="instruction-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Select View Mode</h4>
              <p>Choose between 3D, AR, or VR visualization modes</p>
            </div>
          </div>
          
          <div className="instruction-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Adjust Camera</h4>
              <p>Use sliders to adjust camera position and rotation</p>
            </div>
          </div>
          
          <div className="instruction-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Click to Select</h4>
              <p>Click on any task sphere to view details</p>
            </div>
          </div>
          
          <div className="instruction-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Export & Share</h4>
              <p>Export your visualization as an image or share the view</p>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'ar' && (
        <div className="ar-simulation">
          <div className="simulation-overlay">
            <div className="scanning-animation">
              <div className="scan-line"></div>
              <div className="scan-dots">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="scan-dot"></div>
                ))}
              </div>
            </div>
            
            <div className="ar-instructions-overlay">
              <h3>AR Mode Active</h3>
              <p>Move your device around to place tasks in your environment</p>
              <button 
                className="btn-primary"
                onClick={() => setViewMode('3d')}
              >
                Exit AR Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARVisualization;