'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, Calendar, Users, Zap, Brain, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface Prediction {
  id: string;
  type: 'election' | 'campaign' | 'politician' | 'policy';
  title: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  lastUpdated: Date;
  accuracy?: number;
}

interface Model {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'needs_update';
  features: number;
}

export default function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      type: 'election',
      title: '2024 Presidential Election',
      currentValue: 65,
      predictedValue: 72,
      confidence: 85,
      timeframe: 'Next 6 months',
      trend: 'up',
      factors: ['Current polling', 'Economic indicators', 'Incumbent advantage'],
      lastUpdated: new Date(),
      accuracy: 89
    },
    {
      id: '2',
      type: 'politician',
      title: 'Alexandra Chen Approval',
      currentValue: 68,
      predictedValue: 75,
      confidence: 78,
      timeframe: 'Next 3 months',
      trend: 'up',
      factors: ['Policy success', 'Media coverage', 'Public events'],
      lastUpdated: new Date(Date.now() - 86400000),
      accuracy: 82
    },
    {
      id: '3',
      type: 'campaign',
      title: 'Green Energy Initiative',
      currentValue: 42,
      predictedValue: 58,
      confidence: 65,
      timeframe: 'Next 9 months',
      trend: 'up',
      factors: ['Public interest', 'Funding availability', 'Political support'],
      lastUpdated: new Date(Date.now() - 172800000),
      accuracy: 76
    },
    {
      id: '4',
      type: 'policy',
      title: 'Healthcare Reform Support',
      currentValue: 55,
      predictedValue: 48,
      confidence: 72,
      timeframe: 'Next 12 months',
      trend: 'down',
      factors: ['Opposition messaging', 'Implementation challenges', 'Public concerns'],
      lastUpdated: new Date(Date.now() - 259200000),
      accuracy: 81
    },
    {
      id: '5',
      type: 'politician',
      title: 'Marcus Johnson Investigation',
      currentValue: 45,
      predictedValue: 35,
      confidence: 88,
      timeframe: 'Next 2 months',
      trend: 'down',
      factors: ['Ethics committee', 'Media scrutiny', 'Public opinion'],
      lastUpdated: new Date(Date.now() - 345600000),
      accuracy: 90
    },
  ]);

  const [models, setModels] = useState<Model[]>([
    {
      id: '1',
      name: 'Election Outcome Predictor',
      accuracy: 89,
      lastTrained: new Date(Date.now() - 86400000),
      status: 'active',
      features: 24
    },
    {
      id: '2',
      name: 'Approval Rating Forecaster',
      accuracy: 85,
      lastTrained: new Date(Date.now() - 172800000),
      status: 'active',
      features: 18
    },
    {
      id: '3',
      name: 'Campaign Success Predictor',
      accuracy: 82,
      lastTrained: new Date(Date.now() - 259200000),
      status: 'needs_update',
      features: 22
    },
    {
      id: '4',
      name: 'Policy Impact Analyzer',
      accuracy: 78,
      lastTrained: new Date(Date.now() - 345600000),
      status: 'training',
      features: 20
    },
  ]);

  const [activeTab, setActiveTab] = useState<'predictions' | 'models' | 'scenarios'>('predictions');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<number>(0);

  const getFilteredPredictions = () => {
    let filtered = [...predictions];
    
    if (timeframeFilter !== 'all') {
      filtered = filtered.filter(p => {
        if (timeframeFilter === 'short') return p.timeframe.includes('month') && parseInt(p.timeframe) <= 3;
        if (timeframeFilter === 'medium') return p.timeframe.includes('month') && parseInt(p.timeframe) > 3 && parseInt(p.timeframe) <= 9;
        if (timeframeFilter === 'long') return p.timeframe.includes('month') && parseInt(p.timeframe) > 9;
        return true;
      });
    }
    
    if (confidenceFilter > 0) {
      filtered = filtered.filter(p => p.confidence >= confidenceFilter);
    }
    
    return filtered;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'election':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'campaign':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'politician':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'policy':
        return <BarChart3 className="h-5 w-5 text-orange-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'election':
        return 'bg-blue-100 text-blue-800';
      case 'campaign':
        return 'bg-green-100 text-green-800';
      case 'politician':
        return 'bg-purple-100 text-purple-800';
      case 'policy':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs_update':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const runNewPrediction = () => {
    const types: Prediction['type'][] = ['election', 'campaign', 'politician', 'policy'];
    const trends: Prediction['trend'][] = ['up', 'down', 'stable'];
    
    const newPrediction: Prediction = {
      id: Date.now().toString(),
      type: types[Math.floor(Math.random() * types.length)],
      title: 'New Scenario Analysis',
      currentValue: Math.floor(Math.random() * 100),
      predictedValue: Math.floor(Math.random() * 100),
      confidence: Math.floor(Math.random() * 30) + 70,
      timeframe: 'Next ' + (Math.floor(Math.random() * 12) + 1) + ' months',
      trend: trends[Math.floor(Math.random() * trends.length)],
      factors: ['AI analysis', 'Historical data', 'Current trends'],
      lastUpdated: new Date(),
      accuracy: Math.floor(Math.random() * 20) + 75
    };

    setPredictions(prev => [newPrediction, ...prev]);
  };

  const retrainModel = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'training', lastTrained: new Date() }
        : model
    ));
    
    setTimeout(() => {
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'active', accuracy: Math.min(100, model.accuracy + 2) }
          : model
      ));
    }, 2000);
  };

  const filteredPredictions = getFilteredPredictions();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
            <p className="text-gray-600">AI-powered forecasting and scenario modeling</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={runNewPrediction}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Run New Prediction</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-medium ${activeTab === 'predictions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Predictions ({predictions.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 font-medium ${activeTab === 'models' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Models ({models.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 font-medium ${activeTab === 'scenarios' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Scenarios</span>
          </div>
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="short">Short-term (≤3 months)</option>
              <option value="medium">Medium-term (3-9 months)</option>
              <option value="long">Long-term (≥9 months)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Confidence</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium">{confidenceFilter}%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Showing</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{filteredPredictions.length} predictions</span>
              <span className="text-sm text-gray-600 ml-2">
                ({predictions.length - filteredPredictions.length} filtered out)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Predictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(prediction.type)}
                    <div>
                      <h3 className="font-bold text-gray-900">{prediction.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(prediction.type)}`}>
                          {prediction.type}
                        </span>
                        <span className="text-xs text-gray-500">{prediction.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      prediction.trend === 'up' ? 'text-green-600' :
                      prediction.trend === 'down' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {prediction.confidence}%
                    </div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>

                {/* Value Comparison */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current</span>
                    <span className="text-sm text-gray-600">Predicted</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">{prediction.currentValue}%</div>
                    <div className="flex items-center space-x-2">
                      {prediction.trend === 'up' ? (
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      ) : prediction.trend === 'down' ? (
                        <TrendingDown className="h-6 w-6 text-red-500" />
                      ) : (
                        <div className="h-6 w-6 text-yellow-500">—</div>
                      )}
                      <div className="text-3xl font-bold text-gray-900">{prediction.predictedValue}%</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          prediction.trend === 'up' ? 'bg-green-500' :
                          prediction.trend === 'down' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.max(prediction.currentValue, prediction.predictedValue)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Factors */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Factors</h4>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {formatTimeAgo(prediction.lastUpdated)}</span>
                  </div>
                  {prediction.accuracy && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{prediction.accuracy}% accuracy</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Upward Trends</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions.filter(p => p.trend === 'up').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Downward Trends</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions.filter(p => p.trend === 'down').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(predictions.reduce((sum, p) => sum + (p.accuracy || 0), 0) / predictions.length)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model) => (
              <div key={model.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{model.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(model.status)}`}>
                        {model.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">{model.features} features</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{model.accuracy}%</div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                </div>

                {/* Accuracy Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Model Accuracy</span>
                    <span className="text-sm font-medium">{model.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        model.accuracy >= 85 ? 'bg-green-500' :
                        model.accuracy >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${model.accuracy}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{model.features}</div>
                      <div className="text-xs text-gray-600">Features</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {formatTimeAgo(model.lastTrained)}
                      </div>
                      <div className="text-xs text-gray-600">Last Trained</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    onClick={() => retrainModel(model.id)}
                    disabled={model.status === 'training'}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      model.status === 'training'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {model.status === 'training' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Training...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Retrain Model</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Model Performance */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Model Performance</h3>
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{model.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          model.accuracy >= 85 ? 'bg-green-500' :
                          model.accuracy >= 75 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${model.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{model.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Scenario Analysis</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Run "what-if" scenarios to understand potential outcomes under different conditions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md text-left">
                <h4 className="font-bold text-gray-900 mb-2">Economic Impact</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Analyze how economic changes affect political outcomes
                </p>
                <span className="text-xs text-purple-600">Run Scenario →</span>
              </button>
              <button className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md text-left">
                <h4 className="font-bold text-gray-900 mb-2">Policy Success</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Predict outcomes based on policy implementation success
                </p>
                <span className="text-xs text-purple-600">Run Scenario →</span>
              </button>
              <button className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md text-left">
                <h4 className="font-bold text-gray-900 mb-2">Media Influence</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Model impact of media coverage on public opinion
                </p>
                <span className="text-xs text-purple-600">Run Scenario →</span>
              </button>
            </div>
          </div>

          {/* Scenario Builder */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Custom Scenario Builder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Election Outcome</option>
                  <option>Approval Rating Change</option>
                  <option>Campaign Success</option>
                  <option>Policy Impact</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
                <div className="flex flex-wrap gap-2">
                  {['Economic Growth', 'Media Coverage', 'Public Sentiment', 'Opposition Strength', 'Policy Success'].map((variable) => (
                    <button
                      key={variable}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    defaultValue="6"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Months</option>
                    <option>Years</option>
                  </select>
                </div>
              </div>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 font-medium">
                Run Scenario Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Predictive Analytics v2.1</span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-xs text-gray-500">
              Last analysis: {new Date().toLocaleTimeString()}
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">AI Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}