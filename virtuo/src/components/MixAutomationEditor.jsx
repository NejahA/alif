import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Music, Disc, Zap, Volume2, 
  RotateCcw, Trash2, Play, Square, Plus, 
  Minus, Grid3X3, Lock, Unlock, Eye, EyeOff,
  Save, Upload, Copy, Scissors
} from 'lucide-react';

const AUTOMATION_TARGETS = {
  volume: { name: 'Volume', color: '#3b82f6', unit: 'dB', min: -60, max: 6, default: 0 },
  pan: { name: 'Pan', color: '#10b981', unit: '%', min: -100, max: 100, default: 0 },
  filterCutoff: { name: 'Filter Cutoff', color: '#f59e0b', unit: 'Hz', min: 20, max: 20000, default: 20000 },
  reverbSend: { name: 'Reverb Send', color: '#8b5cf6', unit: '%', min: 0, max: 100, default: 20 },
  delaySend: { name: 'Delay Send', color: '#ec4899', unit: '%', min: 0, max: 100, default: 15 },
  distortion: { name: 'Distortion', color: '#ef4444', unit: '%', min: 0, max: 100, default: 0 },
};

const SHAPE_PRESETS = {
  rampUp: {
    name: 'Ramp Up',
    generate: (steps) => Array.from({ length: steps }, (_, i) => ({
      x: i / (steps - 1),
      y: 1 - (i / (steps - 1))
    }))
  },
  rampDown: {
    name: 'Ramp Down',
    generate: (steps) => Array.from({ length: steps }, (_, i) => ({
      x: i / (steps - 1),
      y: i / (steps - 1)
    }))
  },
  sine: {
    name: 'Sine Wave',
    generate: (steps) => Array.from({ length: steps }, (_, i) => ({
      x: i / (steps - 1),
      y: 0.5 + 0.5 * Math.sin((i / (steps - 1)) * Math.PI * 2)
    }))
  },
  triangle: {
    name: 'Triangle',
    generate: (steps) => Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      return { x: t, y: t < 0.5 ? t * 2 : 2 - t * 2 };
    })
  },
  saw: {
    name: 'Sawtooth',
    generate: (steps) => Array.from({ length: steps }, (_, i) => ({
      x: i / (steps - 1),
      y: 1 - ((i % (steps / 4)) / (steps / 4))
    }))
  },
  square: {
    name: 'Square',
    generate: (steps) => Array.from({ length: steps }, (_, i) => ({
      x: i / (steps - 1),
      y: Math.sin((i / (steps - 1)) * Math.PI * 2) > 0 ? 0 : 1
    }))
  },
  random: {
    name: 'Random',
    generate: (steps) => Array.from({ length: steps }, (_, i) => ({
      x: i / (steps - 1),
      y: Math.random()
    }))
  }
};

const MixAutomationEditor = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [automations, setAutomations] = useState({});
  const [activeTarget, setActiveTarget] = useState('volume');
  const [isPlaying, setIsPlaying] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridResolution, setGridResolution] = useState(16); // steps per bar
  const [loopLength, setLoopLength] = useState(4); // bars
  const [savedPresets, setSavedPresets] = useState(() => {
    const saved = localStorage.getItem('virtuo_automation_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const animationRef = useRef(null);
  const [playbackPos, setPlaybackPos] = useState(0);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 200;
  const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };
  const POINT_RADIUS = 6;

  // Initialize default automation for volume if none exists
  useEffect(() => {
    if (Object.keys(automations).length === 0) {
      const defaultPoints = [
        { x: 0, y: 0.5 },
        { x: 0.25, y: 0.5 },
        { x: 0.5, y: 0.5 },
        { x: 0.75, y: 0.5 },
        { x: 1, y: 0.5 },
      ];
      setAutomations({
        volume: { points: defaultPoints, muted: false, loopLength: 4 },
        pan: { points: generateDefaultPoints(0.5), muted: true, loopLength: 4 },
        filterCutoff: { points: generateDefaultPoints(0.8), muted: true, loopLength: 4 },
        reverbSend: { points: generateDefaultPoints(0.2), muted: true, loopLength: 4 },
        delaySend: { points: generateDefaultPoints(0.15), muted: true, loopLength: 4 },
        distortion: { points: generateDefaultPoints(0), muted: true, loopLength: 4 },
      });
    }
  }, []);

  function generateDefaultPoints(value) {
    return [
      { x: 0, y: value },
      { x: 1, y: value }
    ];
  }

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftHeld(true);
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPoints.length > 0) {
          deleteSelectedPoints();
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedPoints, automations, activeTarget]);

  // Map value from automation y (0-1) to target range
  const mapToRange = useCallback((y, target) => {
    const t = AUTOMATION_TARGETS[target];
    if (!t) return 0;
    return t.min + (1 - y) * (t.max - t.min);
  }, []);

  // Map value from target range to automation y (0-1)
  const mapToY = useCallback((value, target) => {
    const t = AUTOMATION_TARGETS[target];
    if (!t) return 0.5;
    return 1 - ((value - t.min) / (t.max - t.min));
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    const target = AUTOMATION_TARGETS[activeTarget];
    const auto = automations[activeTarget];
    if (!target || !auto || auto.muted) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (auto?.muted) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('MUTED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
      return;
    }

    const plotX = (x) => PADDING.left + x * (CANVAS_WIDTH - PADDING.left - PADDING.right);
    const plotY = (y) => PADDING.top + y * (CANVAS_HEIGHT - PADDING.top - PADDING.bottom);

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    if (snapToGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      const gridSteps = gridResolution * loopLength;
      for (let i = 0; i <= gridSteps; i++) {
        const x = plotX(i / gridSteps);
        ctx.beginPath();
        ctx.moveTo(x, PADDING.top);
        ctx.lineTo(x, CANVAS_HEIGHT - PADDING.bottom);
        ctx.stroke();
      }
      // Bar lines
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i <= loopLength; i++) {
        const x = plotX(i / loopLength);
        ctx.beginPath();
        ctx.moveTo(x, PADDING.top);
        ctx.lineTo(x, CANVAS_HEIGHT - PADDING.bottom);
        ctx.stroke();
      }
      // Horizontal grid lines (dB markers)
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for (let i = 0; i <= 4; i++) {
        const y = plotY(i / 4);
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(CANVAS_WIDTH - PADDING.right, y);
        ctx.stroke();
      }
    }

    // Center line (0dB for volume, center for pan)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING.left, plotY(0.5));
    ctx.lineTo(CANVAS_WIDTH - PADDING.right, plotY(0.5));
    ctx.stroke();
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    const labelPositions = [0, 0.25, 0.5, 0.75, 1];
    labelPositions.forEach(y => {
      const px = plotY(y);
      const val = mapToRange(y, activeTarget);
      const label = target.unit === 'dB' ? `${Math.round(val)}` : `${Math.round(val)}%`;
      ctx.fillText(label, PADDING.left - 8, px + 3);
    });

    // Playback position
    if (isPlaying) {
      const playX = plotX(playbackPos);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(playX, PADDING.top);
      ctx.lineTo(playX, CANVAS_HEIGHT - PADDING.bottom);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Sort points by x
    const sorted = [...auto.points].sort((a, b) => a.x - b.x);
    if (sorted.length < 2) return;

    // Draw automation curve
    ctx.beginPath();
    ctx.moveTo(plotX(sorted[0].x), plotY(sorted[0].y));
    
    // Catmull-Rom spline through points for smooth curves
    for (let i = 1; i < sorted.length - 1; i++) {
      const p0 = sorted[i - 1];
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      
      const cp1x = plotX(p0.x + (p1.x - p0.x) * 0.5);
      const cp1y = plotY(p0.y);
      const cp2x = plotX(p1.x - (p2.x - p1.x) * 0.5);
      const cp2y = plotY(p2.y);
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, plotY(p1.y), plotX(p1.x), plotY(p1.y));
    }
    // Line to last point
    ctx.lineTo(plotX(sorted[sorted.length - 1].x), plotY(sorted[sorted.length - 1].y));

    ctx.strokeStyle = target.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = target.color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill beneath curve
    ctx.lineTo(plotX(sorted[sorted.length - 1].x), CANVAS_HEIGHT - PADDING.bottom);
    ctx.lineTo(plotX(sorted[0].x), CANVAS_HEIGHT - PADDING.bottom);
    ctx.closePath();
    ctx.fillStyle = `${target.color}15`;
    ctx.fill();

    // Draw points
    sorted.forEach((point, idx) => {
      const px = plotX(point.x);
      const py = plotY(point.y);
      
      const isSelected = selectedPoints.includes(idx);
      const isHovered = hoveredPoint === idx;
      const isDragging = draggingPoint?.index === idx;

      ctx.beginPath();
      ctx.arc(px, py, isHovered || isSelected ? POINT_RADIUS + 3 : POINT_RADIUS, 0, Math.PI * 2);
      
      if (isSelected) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = target.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else if (isHovered) {
        ctx.fillStyle = target.color;
        ctx.shadowColor = target.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = target.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Value tooltip on hover
      if (isHovered) {
        const val = mapToRange(point.y, activeTarget);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(px + 12, py - 20, 60, 20);
        ctx.fillStyle = 'white';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(val * 10) / 10} ${target.unit}`, px + 16, py - 6);
      }
    });
  }, [automations, activeTarget, snapToGrid, gridResolution, loopLength, draggingPoint, hoveredPoint, selectedPoints, isPlaying, playbackPos]);

  // Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const startTime = Tone.now();
    const startPos = playbackPos;
    
    const animate = () => {
      const elapsed = Tone.now() - startTime;
      const progress = (startPos + (elapsed / (loopLength * 4))) % 1; // Assuming 4/4 time at 120bpm ~ 2 sec per bar
      setPlaybackPos(progress);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, loopLength]);

  // Apply automation to Tone.js
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const auto = automations[activeTarget];
      if (!auto || auto.muted) return;
      
      const sorted = [...auto.points].sort((a, b) => a.x - b.x);
      // Interpolate value at current playback position
      let value;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (playbackPos >= sorted[i].x && playbackPos <= sorted[i + 1].x) {
          const t = (playbackPos - sorted[i].x) / (sorted[i + 1].x - sorted[i].x);
          value = sorted[i].y + (sorted[i + 1].y - sorted[i].y) * t;
          break;
        }
      }
      if (value === undefined) value = sorted[sorted.length - 1].y;
      
      const mappedValue = mapToRange(value, activeTarget);
      
      // Apply to Tone.Destination based on target
      switch (activeTarget) {
        case 'volume':
          Tone.Destination.volume.value = mappedValue;
          break;
        // Other targets would be applied via custom routing
        default:
          break;
      }
    }, 50); // 20fps automation resolution
    
    return () => clearInterval(interval);
  }, [isPlaying, automations, activeTarget, playbackPos]);

  // Handle canvas click to add/select points
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const plotXInv = (x) => (x - PADDING.left) / (CANVAS_WIDTH - PADDING.left - PADDING.right);
    const plotYInv = (y) => (y - PADDING.top) / (CANVAS_HEIGHT - PADDING.top - PADDING.bottom);
    
    const normX = Math.max(0, Math.min(1, plotXInv(mx)));
    const normY = Math.max(0, Math.min(1, plotYInv(my)));
    
    const snappedX = snapToGrid 
      ? Math.round(normX * gridResolution * loopLength) / (gridResolution * loopLength)
      : normX;
    
    if (isShiftHeld) {
      // Select nearest point
      const auto = automations[activeTarget];
      if (!auto) return;
      let nearestIdx = -1;
      let nearestDist = Infinity;
      auto.points.forEach((p, idx) => {
        const dx = p.x - snappedX;
        const dist = Math.sqrt(dx * dx + (p.y - normY) * (p.y - normY));
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });
      if (nearestDist < 0.05) {
        setSelectedPoints(prev => 
          prev.includes(nearestIdx) 
            ? prev.filter(i => i !== nearestIdx)
            : [...prev, nearestIdx]
        );
      }
      return;
    }
    
    // Check if clicking near existing point (for selection/drag)
    const auto = automations[activeTarget];
    if (!auto) return;
    
    let clickedOnPoint = false;
    auto.points.forEach((point, idx) => {
      const px = PADDING.left + point.x * (CANVAS_WIDTH - PADDING.left - PADDING.right);
      const py = PADDING.top + point.y * (CANVAS_HEIGHT - PADDING.top - PADDING.bottom);
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
      if (dist < POINT_RADIUS + 8) {
        clickedOnPoint = true;
        setDraggingPoint({ index: idx, startX: mx, startY: my, origX: point.x, origY: point.y });
      }
    });
    
    if (!clickedOnPoint && !isShiftHeld) {
      setSelectedPoints([]);
      // Add new point
      setAutomations(prev => {
        const current = prev[activeTarget];
        if (!current) return prev;
        const newPoints = [...current.points, { x: snappedX, y: normY }];
        return { ...prev, [activeTarget]: { ...current, points: newPoints } };
      });
      
      // Trigger XP gain for creativity
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'innovation', amount: 5 }
      }));
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!draggingPoint) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const plotXInv = (x) => (x - PADDING.left) / (CANVAS_WIDTH - PADDING.left - PADDING.right);
    const plotYInv = (y) => (y - PADDING.top) / (CANVAS_HEIGHT - PADDING.top - PADDING.bottom);
    
    let newX = plotXInv(mx);
    let newY = Math.max(0, Math.min(1, plotYInv(my)));
    
    if (snapToGrid) {
      newX = Math.round(newX * gridResolution * loopLength) / (gridResolution * loopLength);
    }
    
    newX = Math.max(0, Math.min(1, newX));
    
    setAutomations(prev => {
      const current = prev[activeTarget];
      if (!current) return prev;
      const newPoints = current.points.map((p, idx) => {
        if (idx === draggingPoint.index) {
          // Don't move first or last point x position (anchors)
          if (idx === 0 || idx === current.points.length - 1) {
            return { ...p, y: newY };
          }
          return { x: newX, y: newY };
        }
        return p;
      });
      return { ...prev, [activeTarget]: { ...current, points: newPoints } };
    });

    // Trigger XP for sustained editing
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'expression', amount: 1 }
    }));
  };

  const handleMouseUp = () => {
    if (draggingPoint) {
      // Sort points by x position after drag
      setAutomations(prev => {
        const current = prev[activeTarget];
        if (!current) return prev;
        const sortedPoints = [...current.points].sort((a, b) => a.x - b.x);
        return { ...prev, [activeTarget]: { ...current, points: sortedPoints } };
      });
    }
    setDraggingPoint(null);
  };

  const handleMouseLeave = () => {
    setDraggingPoint(null);
    setHoveredPoint(null);
  };

  const handleMouseOver = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const auto = automations[activeTarget];
    if (!auto) return;
    
    let nearestIdx = -1;
    let nearestDist = Infinity;
    auto.points.forEach((point, idx) => {
      const px = PADDING.left + point.x * (CANVAS_WIDTH - PADDING.left - PADDING.right);
      const py = PADDING.top + point.y * (CANVAS_HEIGHT - PADDING.top - PADDING.bottom);
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });
    
    setHoveredPoint(nearestDist < 15 ? nearestIdx : null);
  };

  // Delete selected points
  const deleteSelectedPoints = () => {
    setAutomations(prev => {
      const current = prev[activeTarget];
      if (!current || current.points.length <= 2) return prev; // Keep at least 2 points
      
      const newPoints = current.points.filter((_, idx) => !selectedPoints.includes(idx));
      if (newPoints.length < 2) return prev;
      
      return { ...prev, [activeTarget]: { ...current, points: newPoints } };
    });
    setSelectedPoints([]);
    
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 3 }
    }));
  };

  // Apply a shape preset
  const applyPreset = (presetId) => {
    const preset = SHAPE_PRESETS[presetId];
    if (!preset) return;
    
    const steps = gridResolution * loopLength;
    const rawPoints = preset.generate(steps + 1);
    
    const newPoints = rawPoints.map(p => ({
      x: Math.round(p.x * 1000) / 1000,
      y: Math.round(p.y * 1000) / 1000
    }));
    
    setAutomations(prev => ({
      ...prev,
      [activeTarget]: { ...prev[activeTarget], points: newPoints }
    }));
    
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 15 }
    }));
    window.dispatchEvent(new CustomEvent('virtuo-notification', {
      detail: { title: 'AUTOMATION APPLIED', message: preset.name, type: 'info' }
    }));
  };

  // Toggle mute for a target
  const toggleMute = (target) => {
    setAutomations(prev => ({
      ...prev,
      [target]: { ...prev[target], muted: !prev[target].muted }
    }));
  };

  // Clear all points for active target (reset to flat line)
  const clearAutomation = () => {
    setAutomations(prev => {
      const current = prev[activeTarget];
      const defaultValue = current?.points?.[0]?.y ?? 0.5;
      return {
        ...prev,
        [activeTarget]: {
          ...current,
          points: [
            { x: 0, y: defaultValue },
            { x: 1, y: defaultValue }
          ]
        }
      };
    });
    setSelectedPoints([]);
  };

  // Save as preset
  const saveAsPreset = () => {
    const auto = automations[activeTarget];
    if (!auto) return;
    
    const name = prompt('Preset name:', `${activeTarget}_${Date.now()}`);
    if (!name) return;
    
    const newPreset = {
      id: Date.now(),
      name,
      target: activeTarget,
      points: auto.points
    };
    
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('virtuo_automation_presets', JSON.stringify(updated));
    
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 20 }
    }));
  };

  // Load a saved preset
  const loadPreset = (preset) => {
    setAutomations(prev => ({
      ...prev,
      [preset.target]: { ...prev[preset.target], points: preset.points }
    }));
    setActiveTarget(preset.target);
    setShowPresets(false);
    
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'theory', amount: 10 }
    }));
  };

  // Delete a saved preset
  const deletePreset = (id) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('virtuo_automation_presets', JSON.stringify(updated));
  };

  // Toggle playback
  const togglePlayback = () => {
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
      setPlaybackPos(0);
    }
  };

  // Smooth/inverse curves by adding interpolation points
  const addInterpolationPoints = () => {
    setAutomations(prev => {
      const current = prev[activeTarget];
      if (!current) return prev;
      
      const newPoints = [];
      current.points.forEach((p, idx) => {
        newPoints.push(p);
        if (idx < current.points.length - 1) {
          const next = current.points[idx + 1];
          newPoints.push({ x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 });
        }
      });
      
      return { ...prev, [activeTarget]: { ...current, points: newPoints } };
    });
  };

  const targetEntries = Object.entries(AUTOMATION_TARGETS);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel"
      style={{ 
        width: '100%', 
        maxWidth: '800px', 
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={16} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Mix Automation</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Parameter automation curves</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={togglePlayback}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {isPlaying ? <Square size={12} /> : <Play size={12} />}
            {isPlaying ? ' Stop' : ' Play'}
          </button>
          <button
            className="btn-glass"
            onClick={() => setSnapToGrid(!snapToGrid)}
            style={{ 
              padding: '6px 8px', 
              color: snapToGrid ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderColor: snapToGrid ? 'var(--accent-primary)' : 'var(--glass-border)'
            }}
            title="Snap to Grid"
          >
            <Grid3X3 size={12} />
          </button>
          <button
            className="btn-glass"
            onClick={saveAsPreset}
            style={{ padding: '6px 8px' }}
            title="Save as Preset"
          >
            <Save size={12} />
          </button>
          <button
            className="btn-glass"
            onClick={() => setShowPresets(!showPresets)}
            style={{ padding: '6px 8px' }}
            title="Load Preset"
          >
            <Upload size={12} />
          </button>
        </div>
      </div>

      {/* Target Selector */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {targetEntries.map(([key, target]) => {
          const auto = automations[key];
          const isActive = key === activeTarget;
          return (
            <button
              key={key}
              onClick={() => setActiveTarget(key)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: `1px solid ${isActive ? target.color : 'var(--glass-border)'}`,
                background: isActive ? `${target.color}20` : 'transparent',
                color: isActive ? target.color : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {auto?.muted && <EyeOff size={10} />}
              {target.name}
            </button>
          );
        })}
      </div>

      {/* Canvas Editor */}
      <div 
        ref={containerRef}
        style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={(e) => { handleMouseMove(e); handleMouseOver(e); }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: draggingPoint ? 'grabbing' : 'crosshair', display: 'block' }}
        />
        
        {/* Overlay info */}
        {automations[activeTarget]?.muted && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.6)',
            padding: '10px 20px',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '2px'
          }}>
            LANE MUTED
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Loop Length */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loop:</span>
          <button 
            className="btn-glass" 
            onClick={() => setLoopLength(Math.max(1, loopLength - 1))}
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
          >
            <Minus size={10} />
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{loopLength}</span>
          <button 
            className="btn-glass" 
            onClick={() => setLoopLength(Math.min(16, loopLength + 1))}
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
          >
            <Plus size={10} />
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>bars</span>
        </div>

        {/* Grid Resolution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Grid:</span>
          <select 
            value={gridResolution}
            onChange={(e) => setGridResolution(Number(e.target.value))}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={4}>1/4</option>
            <option value={8}>1/8</option>
            <option value={16}>1/16</option>
            <option value={32}>1/32</option>
          </select>
        </div>

        {/* Shape Presets */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {Object.entries(SHAPE_PRESETS).map(([id, preset]) => (
            <button
              key={id}
              className="btn-glass"
              onClick={() => applyPreset(id)}
              style={{ padding: '4px 8px', fontSize: '0.65rem' }}
              title={preset.name}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          <button
            className="btn-glass"
            onClick={addInterpolationPoints}
            style={{ padding: '5px 8px', fontSize: '0.65rem', color: '#8b5cf6', borderColor: '#8b5cf6' }}
            title="Smooth Curve"
          >
            <Scissors size={10} /> Smooth
          </button>
          <button
            className="btn-glass"
            onClick={() => toggleMute(activeTarget)}
            style={{ 
              padding: '5px 8px', 
              fontSize: '0.65rem',
              color: automations[activeTarget]?.muted ? '#ef4444' : '#10b981',
              borderColor: automations[activeTarget]?.muted ? '#ef4444' : '#10b981'
            }}
          >
            {automations[activeTarget]?.muted ? <EyeOff size={10} /> : <Eye size={10} />}
            {automations[activeTarget]?.muted ? ' Unmute' : ' Mute'}
          </button>
          <button
            className="btn-glass"
            onClick={clearAutomation}
            style={{ padding: '5px 8px', fontSize: '0.65rem', color: '#ef4444', borderColor: '#ef4444' }}
          >
            <Trash2 size={10} /> Clear
          </button>
        </div>
      </div>

      {/* Presets Panel */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '12px', 
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Saved Presets
              </h4>
              {savedPresets.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No saved presets yet. Click Save to create one.
                </span>
              ) : (
                savedPresets.map(preset => (
                  <div
                    key={preset.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: AUTOMATION_TARGETS[preset.target]?.color || 'var(--accent-primary)'
                      }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{preset.name}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        ({AUTOMATION_TARGETS[preset.target]?.name})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-glass"
                        onClick={() => loadPreset(preset)}
                        style={{ padding: '3px 8px', fontSize: '0.65rem' }}
                      >
                        Load
                      </button>
                      <button
                        className="btn-glass"
                        onClick={() => deletePreset(preset.id)}
                        style={{ padding: '3px 8px', fontSize: '0.65rem', color: '#ef4444' }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div style={{ 
        fontSize: '0.65rem', 
        color: 'var(--text-muted)', 
        background: 'rgba(255,255,255,0.02)', 
        padding: '10px 15px', 
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <span>Click canvas to add points</span>
        <span>Drag points to adjust</span>
        <span>Shift+Click to multi-select</span>
        <span>Delete to remove selected</span>
        <span>Presets for quick shapes</span>
      </div>
    </motion.div>
  );
};

export default MixAutomationEditor;