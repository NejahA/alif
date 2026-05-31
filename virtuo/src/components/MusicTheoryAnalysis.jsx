import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Music, TrendingUp, AlertCircle, Lightbulb, BookOpen, Target, BarChart3, Zap, Clock, Star, Heart, Eye, Ear, Download } from 'lucide-react';

const MusicTheoryAnalysis = () => {
  const [analysisState, setAnalysisState] = useState('idle');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [complexityScore, setComplexityScore] = useState(68);
  const [emotionalProfile, setEmotionalProfile] = useState({});

  const analysisTypes = [
    {
      id: 'harmonic',
      name: 'Harmonic Analysis',
      description: 'Deep analysis of chord progressions and harmony',
      icon: <Music size={20} />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      insights: [
        'Primary key: C Major',
        'Chord progression: I-V-vi-IV (Pop progression)',
        'Modal mixture: Borrowed chords from parallel minor',
        'Cadence points: Perfect authentic cadence at measure 16'
      ],
      recommendations: [
        'Try secondary dominants for stronger tension',
        'Consider modal interchange with Dorian mode',
        'Add passing chords for smoother transitions'
      ]
    },
    {
      id: 'melodic',
      name: 'Melodic Analysis',
      description: 'Analyze melody structure and phrasing',
      icon: <TrendingUp size={20} />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      insights: [
        'Main motif: 4-bar ascending pattern',
        'Range: Octave and a fifth (C4 to G5)',
        'Phrasing: Balanced 8-bar phrases',
        'Ornamentation: Minimal, focused on purity'
      ],
      recommendations: [
        'Add melodic variation in repetition',
        'Consider sequence development',
        'Experiment with chromatic passing tones'
      ]
    },
    {
      id: 'rhythmic',
      name: 'Rhythmic Analysis',
      description: 'Examine rhythm patterns and groove',
      icon: <Zap size={20} />,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      insights: [
        'Time signature: 4/4 with syncopation',
        'Tempo: 120 BPM (Moderate dance tempo)',
        'Groove: Swing feel with off-beat emphasis',
        'Polyrhythm: Subtle 3-over-4 patterns'
      ],
      recommendations: [
        'Add rhythmic displacement for interest',
        'Experiment with metric modulation',
        'Layer complementary rhythmic patterns'
      ]
    },
    {
      id: 'emotional',
      name: 'Emotional Analysis',
      description: 'Assess emotional impact and mood',
      icon: <Heart size={20} />,
      color: 'text-red-400',
      bgColor: 'bg-red-600/20',
      insights: [
        'Overall mood: Uplifting and optimistic',
        'Energy curve: Builds steadily to climax',
        'Tension/release: Well-balanced emotional arc',
        'Color palette: Bright major tonality'
      ],
      recommendations: [
        'Add contrasting emotional section',
        'Strengthen emotional peaks with dynamics',
        'Consider modal shifts for emotional variety'
      ]
    }
  ];

  const emotionalProfiles = {
    happy: { score: 75, color: 'text-yellow-400', label: 'Joyful' },
    sad: { score: 20, color: 'text-blue-400', label: 'Melancholic' },
    energetic: { score: 85, color: 'text-red-400', label: 'Energetic' },
    calm: { score: 40, color: 'text-green-400', label: 'Peaceful' },
    mysterious: { score: 60, color: 'text-purple-400', label: 'Mysterious' }
  };

  const startAnalysis = (analysisId) => {
    const analysis = analysisTypes.find(a => a.id === analysisId);
    if (!analysis) return;

    setAnalysisState('analyzing');
    setCurrentAnalysis(analysis);

    // Simulate analysis process
    setTimeout(() => {
      setAnalysisState('completed');
      setInsights(analysis.insights);
      setRecommendations(analysis.recommendations);
      
      // Update complexity score
      setComplexityScore(prev => Math.min(prev + 8, 95));
      
      // Set emotional profile (mock data)
      setEmotionalProfile(emotionalProfiles);
    }, 2500);
  };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setCurrentAnalysis(null);
    setInsights([]);
    setRecommendations([]);
  };

  const exportAnalysis = () => {
    // Simulate export functionality
    const analysisData = {
      type: currentAnalysis?.name,
      insights,
      recommendations,
      complexityScore,
      timestamp: new Date().toISOString()
    };
    
    console.log('Exporting analysis:', analysisData);
    // In real implementation, this would download a PDF or JSON file
  };

  const getStatusColor = () => {
    switch (analysisState) {
      case 'analyzing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (analysisState) {
      case 'analyzing': return <Brain className="animate-pulse" />;
      case 'completed': return <Lightbulb />;
      default: return <BookOpen />;
    }
  };

  return (
    <div className="p-6 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Brain size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Music Theory Analysis</h2>
            <p className="text-gray-400 text-sm">Advanced AI-powered music analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center space-x-2 text-purple-400">
              <Target size={16} />
              <span className="font-mono">{complexityScore}% complexity</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Star size={16} />
              <span>Advanced analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Selection Grid */}
      {analysisState === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {analysisTypes.map((analysis) => (
            <motion.button
              key={analysis.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startAnalysis(analysis.id)}
              className={`p-4 ${analysis.bgColor} rounded-xl border border-gray-700/30 transition-all text-left group hover:opacity-90`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${analysis.bgColor}`}>
                  {analysis.icon}
                </div>
                <h3 className={`font-medium ${analysis.color}`}>{analysis.name}</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">{analysis.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Deep analysis
                </span>
                <div className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                  AI Powered
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Current Analysis Status */}
      {currentAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentAnalysis.bgColor}`}>
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="font-medium text-white">{currentAnalysis.name}</h3>
                <p className="text-sm text-gray-400">
                  {analysisState === 'analyzing' && 'Analyzing music structure...'}
                  {analysisState === 'completed' && 'Analysis complete!'}
                </p>
              </div>
            </div>
            
            {analysisState === 'completed' && (
              <div className="flex space-x-2">
                <button
                  onClick={exportAnalysis}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Export Analysis"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={resetAnalysis}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="New Analysis"
                >
                  <Eye size={16} />
                </button>
              </div>
            )}
          </div>

          {analysisState === 'analyzing' && (
            <div className="mt-3 pt-3 border-t border-gray-700/30">
              <div className="flex items-center space-x-2 text-sm text-blue-400">
                <Clock size={14} />
                <span>Processing musical patterns...</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <Lightbulb size={20} className="text-yellow-400" />
            <span>Musical Insights</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg"
              >
                <p className="text-sm text-blue-200">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <Target size={20} className="text-green-400" />
            <span>Creative Recommendations</span>
          </h4>
          
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-green-600/20 border border-green-600/30 rounded-lg"
              >
                <p className="text-sm text-green-200">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emotional Profile Visualization */}
      {analysisState === 'completed' && Object.keys(emotionalProfile).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/30 rounded-xl p-4 mb-6"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <Heart size={20} className="text-red-400" />
            <span>Emotional Profile</span>
          </h4>
          
          <div className="space-y-3">
            {Object.entries(emotionalProfile).map(([emotion, data]) => (
              <div key={emotion} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${data.color} bg-opacity-30`} />
                  <span className="text-sm text-gray-300 capitalize">{emotion}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full">
                    <div
                      className={`h-full ${data.color.replace('text', 'bg')} rounded-full transition-all`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <span className={`text-xs ${data.color} font-mono w-8`}>{data.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Complexity Score */}
      {analysisState === 'completed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-purple-600/20 border border-purple-600/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 size={20} className="text-purple-400" />
              <span className="text-white font-medium">Musical Complexity</span>
            </div>
            <span className="text-purple-400 font-mono text-lg">{complexityScore}%</span>
          </div>
          
          <div className="mt-2 w-full h-2 bg-purple-900/50 rounded-full">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${complexityScore}%` }}
            />
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-purple-300">
            <span>Simple</span>
            <span>Complex</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MusicTheoryAnalysis;