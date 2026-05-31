'use client';

import { useState, useEffect } from 'react';
import { Users, Zap, Target, AlertTriangle, Activity, Shield, Vote, Megaphone, Edit } from 'lucide-react';

interface PoliticianData {
  _id: string;
  name: string;
  position: string;
  party: string;
  location: string;
  approvalRating: number;
  status: 'active' | 'retired' | 'investigation';
  ideology: 'progressive' | 'moderate' | 'conservative' | 'liberal' | 'nationalist';
  lastPublicAppearance: string | null;
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
  politicians: PoliticianData[];
}

export default function Dashboard() {
  const [politicians, setPoliticians] = useState<PoliticianData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'politicians' | 'campaigns'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [politiciansRes, campaignsRes] = await Promise.all([
        fetch('/api/politicians'),
        fetch('/api/campaigns')
      ]);

      const politiciansData = await politiciansRes.json();
      const campaignsData = await campaignsRes.json();

      if (politiciansData.success) setPoliticians(politiciansData.data);
      if (campaignsData.success) setCampaigns(campaignsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'retired': return 'bg-gray-500';
      case 'investigation': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getIdeologyColor = (ideology: string) => {
    switch (ideology) {
      case 'progressive': return 'bg-purple-100 text-purple-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'conservative': return 'bg-red-100 text-red-800';
      case 'liberal': return 'bg-green-100 text-green-800';
      case 'nationalist': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'election': return 'bg-blue-100 text-blue-800';
      case 'policy_initiative': return 'bg-green-100 text-green-800';
      case 'reform': return 'bg-yellow-100 text-yellow-800';
      case 'grassroots': return 'bg-purple-100 text-purple-800';
      case 'legislative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSupportColor = (support: number, target: number) => {
    if (support >= target) return 'text-green-600';
    if (support >= target * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading Political Leadership Dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Zaiim</h1>
              <p className="text-gray-600">Political Leadership & Campaign Tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                {politicians.filter(p => p.status === 'active').length}/{politicians.length} Active
              </span>
            </div>
            <a
              href="/data"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Manage Data</span>
            </a>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('politicians')}
            className={`px-4 py-2 font-medium ${activeTab === 'politicians' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Politicians ({politicians.length})
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 font-medium ${activeTab === 'campaigns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Campaigns ({campaigns.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Politicians</p>
                    <p className="text-3xl font-bold text-gray-900">{politicians.length}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(politicians.filter(p => p.status === 'active').length / politicians.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round((politicians.filter(p => p.status === 'active').length / politicians.length) * 100)}% Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
                  </div>
                  <Target className="h-10 w-10 text-green-500" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(campaigns.filter(c => c.publicSupport >= c.targetSupport).length / campaigns.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {campaigns.filter(c => c.publicSupport >= c.targetSupport).length} On Target
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Approval Rating</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {politicians.length > 0 
                        ? Math.round(politicians.reduce((sum, p) => sum + p.approvalRating, 0) / politicians.length)
                        : 0}%
                    </p>
                  </div>
                  <Vote className="h-10 w-10 text-yellow-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {campaigns.filter(c => c.status === 'active').length} active campaigns
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Political Activity</h2>
              <div className="space-y-4">
                {politicians.slice(0, 5).map(politician => (
                  <div key={politician._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(politician.status)}`}></div>
                      <div>
                        <p className="font-medium">{politician.name}</p>
                        <p className="text-sm text-gray-500">{politician.position} • {politician.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{politician.approvalRating}% Approval</p>
                      <p className="text-xs text-gray-500">{politician.yearsInOffice} years in office</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'politicians' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Political Leaders</h2>
              <p className="text-gray-600 mt-1">Monitor and track political figures and their performance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ideology</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Years</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {politicians.map(politician => (
                    <tr key={politician._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{politician.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{politician.position}</td>
                      <td className="px-6 py-4 text-gray-700">{politician.party}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(politician.status)} text-white`}>
                          {politician.status.charAt(0).toUpperCase() + politician.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${politician.approvalRating}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{politician.approvalRating}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIdeologyColor(politician.ideology)}`}>
                          {politician.ideology.charAt(0).toUpperCase() + politician.ideology.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{politician.yearsInOffice} years</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <a
                            href="/data"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Leadership Campaigns</h2>
              <p className="text-gray-600 mt-1">Monitor and track political campaigns and initiatives</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public Support</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Issues</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.map(campaign => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{campaign.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCampaignTypeColor(campaign.campaignType)}`}>
                          {campaign.campaignType.replace('_', ' ').charAt(0).toUpperCase() + campaign.campaignType.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${getSupportColor(campaign.publicSupport, campaign.targetSupport).replace('text-', 'bg-')}`}
                              style={{ width: `${campaign.publicSupport}%` }}
                            ></div>
                          </div>
                          <span className={`font-bold ${getSupportColor(campaign.publicSupport, campaign.targetSupport)}`}>
                            {campaign.publicSupport}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{campaign.targetSupport}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                          campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{campaign.region}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {campaign.keyIssues?.slice(0, 3).map((issue, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {issue}
                            </span>
                          ))}
                          {campaign.keyIssues?.length > 3 && (
                            <span className="text-xs text-gray-500">+{campaign.keyIssues.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <a
                            href="/data"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            Zaiim Political Leadership System • Real-time tracking of political figures and campaigns
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-600">Retired</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Investigation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}