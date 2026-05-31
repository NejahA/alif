'use client';

import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Target, Vote, Activity } from 'lucide-react';

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
}

interface CampaignData {
  _id: string;
  name: string;
  campaignType: 'election' | 'policy_initiative' | 'reform' | 'grassroots' | 'legislative';
  publicSupport: number;
  targetSupport: number;
  status: 'planning' | 'active' | 'completed' | 'stalled';
  region: string;
}

export default function Analytics() {
  const [politicians, setPoliticians] = useState<PoliticianData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

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

  // Calculate analytics
  const avgApprovalRating = politicians.length > 0 
    ? Math.round(politicians.reduce((sum, p) => sum + p.approvalRating, 0) / politicians.length)
    : 0;

  const partyDistribution = politicians.reduce((acc, p) => {
    acc[p.party] = (acc[p.party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ideologyDistribution = politicians.reduce((acc, p) => {
    acc[p.ideology] = (acc[p.ideology] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const campaignSuccessRate = campaigns.length > 0
    ? Math.round((campaigns.filter(c => c.publicSupport >= c.targetSupport).length / campaigns.length) * 100)
    : 0;

  const topPerformingPoliticians = [...politicians]
    .sort((a, b) => b.approvalRating - a.approvalRating)
    .slice(0, 5);

  const campaignTypeDistribution = campaigns.reduce((acc, c) => {
    acc[c.campaignType] = (acc[c.campaignType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionDistribution = campaigns.reduce((acc, c) => {
    acc[c.region] = (acc[c.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights and trends in political leadership</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm text-gray-500">Avg Approval Rating</p>
              <p className="text-3xl font-bold text-gray-900">{avgApprovalRating}%</p>
            </div>
            <Vote className="h-10 w-10 text-green-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {politicians.filter(p => p.approvalRating >= 60).length} above 60%
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <Target className="h-10 w-10 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${campaignSuccessRate}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{campaignSuccessRate}% Success Rate</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {campaigns.filter(c => c.publicSupport >= c.targetSupport).length} meeting targets
            </p>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Party Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Party Distribution</h2>
            <PieChart className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(partyDistribution).map(([party, count]) => (
              <div key={party} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">{party}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / politicians.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{count} ({Math.round((count / politicians.length) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideology Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ideology Distribution</h2>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(ideologyDistribution).map(([ideology, count]) => (
              <div key={ideology} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    ideology === 'progressive' ? 'bg-purple-500' :
                    ideology === 'moderate' ? 'bg-blue-500' :
                    ideology === 'conservative' ? 'bg-red-500' :
                    ideology === 'liberal' ? 'bg-green-500' :
                    'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{ideology}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        ideology === 'progressive' ? 'bg-purple-500' :
                        ideology === 'moderate' ? 'bg-blue-500' :
                        ideology === 'conservative' ? 'bg-red-500' :
                        ideology === 'liberal' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${(count / politicians.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{count} ({Math.round((count / politicians.length) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Politicians</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Years in Office</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPerformingPoliticians.map((politician, index) => (
                <tr key={politician._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <span className="font-bold">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{politician.name}</div>
                    <div className="text-sm text-gray-500">{politician.location}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{politician.position}</td>
                  <td className="px-6 py-4 text-gray-700">{politician.party}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${
                            politician.approvalRating >= 70 ? 'bg-green-500' :
                            politician.approvalRating >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${politician.approvalRating}%` }}
                        ></div>
                      </div>
                      <span className={`font-bold ${
                        politician.approvalRating >= 70 ? 'text-green-600' :
                        politician.approvalRating >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {politician.approvalRating}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{politician.yearsInOffice} years</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Types</h2>
          <div className="space-y-4">
            {Object.entries(campaignTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    type === 'election' ? 'bg-blue-500' :
                    type === 'policy_initiative' ? 'bg-green-500' :
                    type === 'reform' ? 'bg-yellow-500' :
                    type === 'grassroots' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        type === 'election' ? 'bg-blue-500' :
                        type === 'policy_initiative' ? 'bg-green-500' :
                        type === 'reform' ? 'bg-yellow-500' :
                        type === 'grassroots' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(count / campaigns.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{count} campaigns</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Regions</h2>
          <div className="space-y-4">
            {Object.entries(regionDistribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([region, count]) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm font-medium">{region}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${(count / campaigns.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count} campaigns</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            Analytics updated in real-time • Last refresh: {new Date().toLocaleTimeString()}
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">High Approval (70%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Medium Approval (50-69%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Low Approval (&lt;50%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}