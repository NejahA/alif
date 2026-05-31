import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, TrendingUp, Brain, Target, BarChart3, Lightbulb, Play, Pause, RotateCcw, Sparkles, Calendar, Timer, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

const WorkflowAutomation = () => {
  const [workflowState, setWorkflowState] = useState('idle');
  const [currentTask, setCurrentTask] = useState(null);
  const [timeSaved, setTimeSaved] = useState(0);
  const [efficiencyScore, setEfficiencyScore] = useState(75);
  const [suggestions, setSuggestions] = useState([]);
  const [automationHistory, setAutomationHistory] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const workflowTasks = [
    {
      id: 'arrangement',
      name: 'Song Arrangement',
      description: 'Optimize song structure and arrangement flow',
      estimatedTime: 15,
      icon: <BarChart3 size={20} />,
      suggestions: [
        'Add bridge section between chorus and verse',
        'Consider 8-bar intro instead of 4-bar',
        'Add breakdown section for dynamic contrast'
      ]
    },
    {
      id: 'mixing',
      name: 'Mixing Balance',
      description: 'Balance levels and EQ across all tracks',
      estimatedTime: 20,
      icon: <Volume2 size={20} />,
      suggestions: [
        'Reduce bass frequency buildup around 200Hz',
        'Add subtle sidechain compression to drums',
        'Increase vocal presence with 2-4kHz boost'
      ]
    },
    {
      id: 'effects',
      name: 'Effects Chain',
      description: 'Optimize effects routing and parameters',
      estimatedTime: 12,
      icon: <Zap size={20} />,
      suggestions: [
        'Add subtle reverb to create space',
        'Use delay with quarter-note timing',
        'Apply gentle compression to master bus'
      ]
    },
    {
      id: 'mastering',
      name: 'Mastering Prep',
      description: 'Prepare track for final mastering',
      estimatedTime: 18,
      icon: <Target size={20} />,
      suggestions: [
        'Ensure -6dB headroom for mastering',
        'Check stereo image consistency',
        'Apply gentle limiting to prevent clipping'
      ]
    }
  ];

  const startWorkflow = (taskId) => {
    const task = workflowTasks.find(t => t.id === taskId);
    if (!task) return;

    setWorkflowState('analyzing');
    setCurrentTask(task);
    setIsOptimizing(true);

    // Simulate analysis phase
    setTimeout(() => {
      setWorkflowState('optimizing');
      
      // Generate AI suggestions
      const taskSuggestions = task.suggestions.map((suggestion, index) => ({
        id: index,
        text: suggestion,
        applied: false
      }));
      setSuggestions(taskSuggestions);

      // Simulate optimization completion
      setTimeout(() => {
        setWorkflowState('completed');
        setTimeSaved(prev => prev + task.estimatedTime);
        setEfficiencyScore(prev => Math.min(prev + 5, 95));
        
        // Add to history
        setAutomationHistory(prev => [
          {
            id: Date.now(),
            task: task.name,
            timeSaved: task.estimatedTime,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 4)
        ]);

        setIsOptimizing(false);
      }, 3000);
    }, 2000);
  };

  const applySuggestion = (suggestionId) => {
    setSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === suggestionId
          ? { ...suggestion, applied: true }
          : suggestion
      )
    );
  };

  const resetWorkflow = () => {
    setWorkflowState('idle');
    setCurrentTask(null);
    setSuggestions([]);
  };

  const getStatusColor = () => {
    switch (workflowState) {
      case 'analyzing': return 'text-blue-400';
      case 'optimizing': return 'text-purple-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (workflowState) {
      case 'analyzing': return <Brain className="animate-pulse" />;
      case 'optimizing': return <Zap className="animate-pulse" />;
      case 'completed': return <CheckCircle2 />;
      default: return <Lightbulb />;
    }
  };

  return (
    <div className="p-6 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Sparkles size={24} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Workflow Automation</h2>
            <p className="text-gray-400 text-sm">AI-powered production optimization</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center space-x-2 text-green-400">
              <Timer size={16} />
              <span className="font-mono">{timeSaved}m saved</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <TrendingUp size={16} />
              <span>{efficiencyScore}% efficiency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task Status */}
      {currentTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStatusColor()} bg-opacity-20`}>
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="font-medium text-white">{currentTask.name}</h3>
                <p className="text-sm text-gray-400">
                  {workflowState === 'analyzing' && 'Analyzing your project...'}
                  {workflowState === 'optimizing' && 'Applying optimizations...'}
                  {workflowState === 'completed' && 'Optimization complete!'}
                </p>
              </div>
            </div>
            
            {workflowState === 'completed' && (
              <button
                onClick={resetWorkflow}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>

          {workflowState !== 'idle' && (
            <div className="mt-3 pt-3 border-t border-gray-700/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Estimated time saved:</span>
                <span className="text-green-400 font-mono">{currentTask.estimatedTime} minutes</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Task Selection Grid */}
      {workflowState === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {workflowTasks.map((task) => (
            <motion.button
              key={task.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startWorkflow(task.id)}
              className="p-4 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-all text-left group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                  {task.icon}
                </div>
                <h3 className="font-medium text-white">{task.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">{task.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Saves ~{task.estimatedTime}m
                </span>
                <div className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                  AI Powered
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <Brain size={20} className="text-blue-400" />
            <span>AI Suggestions</span>
          </h4>
          
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border transition-all ${
                  suggestion.applied
                    ? 'bg-green-600/20 border-green-600/30'
                    : 'bg-gray-800/40 border-gray-700/30 hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${suggestion.applied ? 'text-green-300' : 'text-gray-300'}`}>
                    {suggestion.text}
                  </p>
                  
                  {!suggestion.applied && (
                    <button
                      onClick={() => applySuggestion(suggestion.id)}
                      className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded-full transition-colors"
                    >
                      Apply
                    </button>
                  )}
                  
                  {suggestion.applied && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <CheckCircle2 size={14} />
                      <span className="text-xs">Applied</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Automation History */}
      {automationHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/30 rounded-xl p-4"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <Calendar size={20} className="text-purple-400" />
            <span>Recent Optimizations</span>
          </h4>
          
          <div className="space-y-2">
            {automationHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                <div>
                  <p className="text-sm text-white">{item.task}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-400 font-mono">+{item.timeSaved}m</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-700/30">
        <div className="flex space-x-3">
          <button
            onClick={() => setIsOptimizing(!isOptimizing)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isOptimizing
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30'
            }`}
          >
            {isOptimizing ? (
              <>
                <Pause size={16} className="inline mr-2" />
                Pause AI
              </>
            ) : (
              <>
                <Play size={16} className="inline mr-2" />
                Auto-Optimize
              </>
            )}
          </button>
          
          <button className="px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600/30 rounded-lg text-sm font-medium hover:bg-gray-700/70 transition-colors">
            <Target size={16} className="inline mr-2" />
            Set Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomation;