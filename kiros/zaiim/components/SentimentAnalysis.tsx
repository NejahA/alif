'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, MessageSquare, Globe, Users, Heart, AlertTriangle, Smile, Frown, Meh } from 'lucide-react';

interface SentimentData {
  id: string;
  source: 'social' | 'news' | 'polls' | 'surveys';
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  volume: number;
  topic: string;
  politician?: string;
  campaign?: string;
  timestamp: Date;
  keyPhrases: string[];
}

interface SentimentSummary {
  overall: number;
  positive: number;
  negative: number;
  neutral: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

export default function SentimentAnalysis() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([
    {
      id: '1',
      source: 'social',
      sentiment: 'positive',
      score: 85,
      volume: 1250,
      topic: 'Climate Policy',
      politician: 'Alexandra Chen',
      timestamp: new Date(Date.now() - 3600000),
      keyPhrases: ['environmental leadership', 'sustainable future', 'green energy']
    },
    {
      id: '2',
      source: 'news',
      sentiment: 'negative',
      score: 35,
      volume: 800,
      topic: 'Tax Reform',
      politician: 'Marcus Johnson',
      timestamp: new Date(Date.now() - 7200000),
      keyPhrases: ['economic burden', 'middle class', 'revenue loss']
    },
    {
      id: '3',
      source: 'polls',
      sentiment: 'neutral',
      score: 55,
      volume: 1500,
      topic: 'Healthcare',
      campaign: '2024 Presidential Election',
      timestamp: new Date(Date.now() - 10800000),
      keyPhrases: ['access to care', 'cost concerns', 'system reform']
    },
    {
      id: '4',
      source: 'surveys',
      sentiment: 'positive',
      score: 78,
      volume: 950,
      topic: 'Education Funding',
      politician: 'Sarah Williams',
      timestamp: new Date(Date.now() - 14400000),
      keyPhrases: ['school investment', 'teacher support', 'student success']
    },
    {
      id: '5',
      source: 'social',
      sentiment: 'negative',
      score: 42,
      volume: 2100,
      topic: 'Immigration',
      politician: 'Elena Rodriguez',
      timestamp: new Date(Date.now() - 18000000),
      keyPhrases: ['border security', 'policy debate', 'national interest']
    },
  ]);

  const [summary, setSummary] = useState<SentimentSummary>({
    overall: 65,
    positive: 45,
    negative: 30,
    neutral: 25,
    trend: 'up',
    confidence: 88
  });

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const getSources = () => {
    return Array.from(new Set(sentimentData.map(d => d.source)));
  };

  const getTopics = () => {
    return Array.from(new Set(sentimentData.map(d => d.topic)));
  };

  const getFilteredData = () => {
    let filtered = [...sentimentData];
    
    if (selectedSource !== 'all') {
      filtered = filtered.filter(d => d.source === selectedSource);
    }
    
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(d => d.topic === selectedTopic);
    }
    
    return filtered;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      case 'neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'news':
        return <Globe className="h-4 w-4" />;
      case 'polls':
        return <BarChart3 className="h-4 w-4" />;
      case 'surveys':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'news':
        return 'bg-green-100 text-green-800';
      case 'polls':
        return 'bg-purple-100 text-purple-800';
      case 'surveys':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const filteredData = getFilteredData();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
            <p className="text-gray-600">Public opinion and emotional response tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${
            summary.trend === 'up' ? 'bg-green-100 text-green-800' :
            summary.trend === 'down' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {summary.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
             summary.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
             <Minus className="h-4 w-4" />}
            <span className="text-sm font-medium">{summary.overall}% Overall</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            {getSources().map(source => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Topics</option>
            {getTopics().map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Positive</p>
              <p className="text-2xl font-bold text-gray-900">{summary.positive}%</p>
            </div>
            <Smile className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${summary.positive}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Negative</p>
              <p className="text-2xl font-bold text-gray-900">{summary.negative}%</p>
            </div>
            <Frown className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-red-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${summary.negative}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Neutral</p>
              <p className="text-2xl font-bold text-gray-900">{summary.neutral}%</p>
            </div>
            <Meh className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${summary.neutral}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Confidence</p>
              <p className="text-2xl font-bold text-gray-900">{summary.confidence}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${summary.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Data */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Sentiment Data</h3>
          <span className="text-sm text-gray-600">
            Showing {filteredData.length} of {sentimentData.length} entries
          </span>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {filteredData.map((data) => (
            <div key={data.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getSentimentIcon(data.sentiment)}
                  <div>
                    <h4 className="font-bold text-gray-900">{data.topic}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(data.source)}`}>
                        <div className="flex items-center space-x-1">
                          {getSourceIcon(data.source)}
                          <span>{data.source}</span>
                        </div>
                      </span>
                      {data.politician && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {data.politician}
                        </span>
                      )}
                      {data.campaign && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {data.campaign}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    data.sentiment === 'positive' ? 'text-green-600' :
                    data.sentiment === 'negative' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {data.score}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(data.volume)} mentions
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {data.keyPhrases.map((phrase, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatTimeAgo(data.timestamp)}</span>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-16 rounded-full ${
                    data.sentiment === 'positive' ? 'bg-green-200' :
                    data.sentiment === 'negative' ? 'bg-red-200' :
                    'bg-yellow-200'
                  }`}>
                    <div 
                      className={`h-2 rounded-full ${
                        data.sentiment === 'positive' ? 'bg-green-500' :
                        data.sentiment === 'negative' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{data.sentiment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-2">Top Positive Topics</h4>
          <div className="space-y-2">
            {sentimentData
              .filter(d => d.sentiment === 'positive')
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((data, idx) => (
                <div key={data.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{data.topic}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-green-600">{data.score}%</span>
                    <Smile className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-2">Top Negative Topics</h4>
          <div className="space-y-2">
            {sentimentData
              .filter(d => d.sentiment === 'negative')
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((data, idx) => (
                <div key={data.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{data.topic}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-red-600">{data.score}%</span>
                    <Frown className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Analysis Methodology</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">Natural Language Processing</span>
            </div>
            <p className="text-xs text-gray-600">
              Analyzes text from social media, news articles, and surveys using advanced NLP algorithms
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-900">Machine Learning</span>
            </div>
            <p className="text-xs text-gray-600">
              Trained models classify sentiment and identify emotional patterns in political discourse
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-900">Trend Analysis</span>
            </div>
            <p className="text-xs text-gray-600">
              Tracks sentiment changes over time and identifies emerging patterns
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Sentiment Analysis v1.2</span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-xs text-gray-500">
              Data sources: Social Media, News, Polls, Surveys
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Real-time Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}