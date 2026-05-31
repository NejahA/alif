'use client';

import { useState, useEffect } from 'react';
import { Grid, Layout, Zap, BarChart3, Bell, Search, Download, Users, Target, Activity, Shield, Brain, Heart, TrendingUp } from 'lucide-react';
import RealTimeUpdates from './RealTimeUpdates';
import Notifications from './Notifications';
import SearchComponent from './Search';
import Analytics from './Analytics';
import Export from './Export';
import VirtuoAssistant from './VirtuoAssistant';
import SentimentAnalysis from './SentimentAnalysis';
import PredictiveAnalytics from './PredictiveAnalytics';

interface PoliticianData {
  _id: string;
  name: string;
  position: string;
  party: string;
  location: string;
  approvalRating: number;
  status: 'active' | 'retired' | 'investigation';
  ideology: 'progressive' | 'moderate' | 'conservative' | 'liberal' | 'nationalist';
  yearsInOffice: number;
  keyPolicies: string[];
}

interface CampaignData {
  _id: string;
  name: string;
  description: string;
  campaignType: 'election' | 'policy_initiative' | 'reform' | 'grassroots' | 'legislative';
  region: string;
  publicSupport: number;
  targetSupport: number;
  keyIssues: string[];
  status: 'planning' | 'active' | 'completed' | 'stalled';
}

export default function FeaturesDashboard() {
  const [politicians, setPoliticians] = useState<PoliticianData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<PoliticianData[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<'overview' | 'analytics' | 'realtime' | 'notifications' | 'search' | 'export' | 'virtuo' | 'sentiment' | 'predictive'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [politiciansRes, campaignsRes] = await Promise.all([
        fetch('/api/politicians'),
        fetch('/api/campaigns')
      ]);

      const politiciansData = await politiciansRes.json();
      const campaignsData = await campaignsRes.json();

      if (politiciansData.success) {
        setPoliticians(politiciansData.data);
        setFilteredPoliticians(politiciansData.data);
      }
      if (campaignsData.success) {
        setCampaigns(campaignsData.data);
        setFilteredCampaigns(campaignsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePoliticiansFiltered = (filtered: PoliticianData[]) => {
    setFilteredPoliticians(filtered);
  };

  const handleCampaignsFiltered = (filtered: CampaignData[]) => {
    setFilteredCampaigns(filtered);
  };

  const getStats = () => {
    return {
      totalPoliticians: politicians.length,
      activePoliticians: politicians.filter(p => p.status === 'active').length,
      avgApprovalRating: politicians.length > 0 
        ? Math.round(politicians.reduce((sum, p) => sum + p.approvalRating, 0) / politicians.length)
        : 0,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      avgSupport: campaigns.length > 0
        ? Math.round(campaigns.reduce((sum, c) => sum + c.publicSupport, 0) / campaigns.length)
        : 0,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading Features Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zaiim Features</h1>
              <p className="text-gray-600">Comprehensive Political Leadership Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                {stats.activePoliticians}/{stats.totalPoliticians} Active
              </span>
            </div>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Refresh All</span>
            </button>
          </div>
        </div>

        {/* Feature Navigation */}
        <div className="mt-6 flex space-x-1 border-b overflow-x-auto">
          <button
            onClick={() => setActiveFeature('overview')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('analytics')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('realtime')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'realtime' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Real-Time</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('notifications')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('search')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search & Filter</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('export')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'export' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('virtuo')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'virtuo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Virtuo AI</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('sentiment')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'sentiment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Sentiment</span>
            </div>
          </button>
          <button
            onClick={() => setActiveFeature('predictive')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeFeature === 'predictive' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Predictive</span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeFeature === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Politicians</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPoliticians}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{stats.activePoliticians} currently active</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Approval</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgApprovalRating}%</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-green-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Across all politicians</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                  </div>
                  <Target className="h-10 w-10 text-purple-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{stats.activeCampaigns} active campaigns</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Support</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgSupport}%</p>
                  </div>
                  <Activity className="h-10 w-10 text-orange-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Campaign public support</p>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveFeature('analytics')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Analytics Dashboard</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Deep insights and visualizations of political trends, party distributions, and campaign performance metrics.
                </p>
                <div className="flex items-center text-blue-600 text-sm">
                  <span>View Analytics</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('realtime')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Real-Time Updates</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Live tracking of political changes, campaign updates, and system notifications with polling every 10 seconds.
                </p>
                <div className="flex items-center text-green-600 text-sm">
                  <span>View Live Updates</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('notifications')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Smart Notifications</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Customizable alerts for high-priority events, investigation updates, campaign milestones, and system changes.
                </p>
                <div className="flex items-center text-purple-600 text-sm">
                  <span>View Notifications</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('search')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Search className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Advanced Search</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Powerful filtering by status, ideology, party, approval ratings, campaign types, and support levels.
                </p>
                <div className="flex items-center text-orange-600 text-sm">
                  <span>Search & Filter</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('export')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Download className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Data Export</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Export complete datasets in JSON, CSV, or text formats with comprehensive statistics and metadata.
                </p>
                <div className="flex items-center text-red-600 text-sm">
                  <span>Export Data</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => window.location.href = '/data'}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Grid className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Data Management</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Full CRUD operations for politicians and campaigns with forms, validation, and real-time updates.
                </p>
                <div className="flex items-center text-indigo-600 text-sm">
                  <span>Manage Data</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('virtuo')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Virtuo AI Assistant</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  AI-powered political intelligence with chat interface, predictions, and insights generation.
                </p>
                <div className="flex items-center text-purple-600 text-sm">
                  <span>Chat with Virtuo</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('sentiment')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Sentiment Analysis</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Track public opinion, emotional responses, and sentiment trends across multiple data sources.
                </p>
                <div className="flex items-center text-green-600 text-sm">
                  <span>Analyze Sentiment</span>
                  <span className="ml-2">→</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveFeature('predictive')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Predictive Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  AI forecasting, scenario modeling, and outcome predictions with confidence scoring.
                </p>
                <div className="flex items-center text-pink-600 text-sm">
                  <span>View Predictions</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity Preview</h2>
                <button 
                  onClick={() => setActiveFeature('realtime')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Top Politician</span>
                  </div>
                  {politicians.length > 0 && (
                    <>
                      <p className="text-lg font-bold text-gray-900">
                        {politicians.sort((a, b) => b.approvalRating - a.approvalRating)[0]?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {politicians.sort((a, b) => b.approvalRating - a.approvalRating)[0]?.approvalRating}% Approval
                      </p>
                    </>
                  )}
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Top Campaign</span>
                  </div>
                  {campaigns.length > 0 && (
                    <>
                      <p className="text-lg font-bold text-gray-900">
                        {campaigns.sort((a, b) => b.publicSupport - a.publicSupport)[0]?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {campaigns.sort((a, b) => b.publicSupport - a.publicSupport)[0]?.publicSupport}% Support
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'analytics' && (
          <Analytics />
        )}

        {activeFeature === 'realtime' && (
          <RealTimeUpdates />
        )}

        {activeFeature === 'notifications' && (
          <Notifications />
        )}

        {activeFeature === 'search' && (
          <div className="space-y-6">
            <SearchComponent 
              onPoliticiansFiltered={handlePoliticiansFiltered}
              onCampaignsFiltered={handleCampaignsFiltered}
              showFilters={true}
            />
            
            {/* Results Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
                <div className="text-sm text-gray-600">
                  Showing {filteredPoliticians.length} politicians • {filteredCampaigns.length} campaigns
                </div>
              </div>
              
              {/* Politicians Results */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Politicians ({filteredPoliticians.length})</h3>
                {filteredPoliticians.length === 0 ? (
                  <p className="text-gray-500 italic">No politicians match your search criteria</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPoliticians.slice(0, 6).map(politician => (
                      <div key={politician._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{politician.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            politician.status === 'active' ? 'bg-green-100 text-green-800' :
                            politician.status === 'retired' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {politician.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{politician.position} • {politician.party}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{politician.approvalRating}% Approval</span>
                          <span className="text-xs text-gray-500">{politician.yearsInOffice} years</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaigns Results */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Campaigns ({filteredCampaigns.length})</h3>
                {filteredCampaigns.length === 0 ? (
                  <p className="text-gray-500 italic">No campaigns match your search criteria</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCampaigns.slice(0, 6).map(campaign => (
                      <div key={campaign._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                            campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{campaign.region} • {campaign.campaignType.replace('_', ' ')}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{campaign.publicSupport}% Support</span>
                          <span className="text-xs text-gray-500">Target: {campaign.targetSupport}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'export' && (
          <Export politicians={politicians} campaigns={campaigns} />
        )}

        {activeFeature === 'virtuo' && (
          <VirtuoAssistant />
        )}

        {activeFeature === 'sentiment' && (
          <SentimentAnalysis />
        )}

        {activeFeature === 'predictive' && (
          <PredictiveAnalytics />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            Zaiim Features Dashboard • All features are fully functional and interactive
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-sm text-gray-600">
              Data updated: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}