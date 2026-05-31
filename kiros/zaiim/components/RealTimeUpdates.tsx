'use client';

import { useState, useEffect } from 'react';
import { Activity, Bell, Clock, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';

interface Update {
  id: string;
  type: 'politician' | 'campaign';
  action: 'added' | 'updated' | 'deleted';
  name: string;
  description: string;
  timestamp: Date;
  details?: string;
}

export default function RealTimeUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout>();

  // Mock real-time updates (in a real app, this would use WebSockets)
  useEffect(() => {
    // Simulate initial connection
    setTimeout(() => setConnected(true), 1000);

    // Start polling for updates
    const interval = setInterval(() => {
      fetchUpdates();
    }, 10000); // Poll every 10 seconds

    setPollingInterval(interval);

    // Initial fetch
    fetchUpdates();

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

  const fetchUpdates = async () => {
    try {
      // In a real app, this would fetch from a real-time API
      // For now, we'll simulate some updates
      const mockUpdates: Update[] = [
        {
          id: '1',
          type: 'politician',
          action: 'updated',
          name: 'Alexandra Chen',
          description: 'Approval rating increased to 72%',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          details: 'Recent policy announcement boosted popularity',
        },
        {
          id: '2',
          type: 'campaign',
          action: 'added',
          name: 'Climate Action Initiative',
          description: 'New environmental campaign launched',
          timestamp: new Date(Date.now() - 600000), // 10 minutes ago
          details: 'Focus on renewable energy transition',
        },
        {
          id: '3',
          type: 'politician',
          action: 'updated',
          name: 'Marcus Johnson',
          description: 'Status changed to active investigation',
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
          details: 'Ethics committee review initiated',
        },
        {
          id: '4',
          type: 'campaign',
          action: 'updated',
          name: '2024 Presidential Election',
          description: 'Public support reached 68%',
          timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
          details: 'Exceeded target support by 18%',
        },
      ];

      // Add new updates if we have less than 10
      if (updates.length < 10) {
        const newUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)];
        setUpdates(prev => [{
          ...newUpdate,
          id: Date.now().toString(),
          timestamp: new Date(),
        }, ...prev.slice(0, 9)]);
      }

      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const getUpdateIcon = (type: string, action: string) => {
    if (type === 'politician') {
      return <Users className="h-5 w-5" />;
    } else {
      return <Target className="h-5 w-5" />;
    }
  };

  const getUpdateColor = (action: string) => {
    switch (action) {
      case 'added':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'updated':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'deleted':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (action: string) => {
    if (action === 'added' || action === 'updated') {
      return <TrendingUp className="h-4 w-4" />;
    } else {
      return <TrendingDown className="h-4 w-4" />;
    }
  };

  const clearUpdates = () => {
    setUpdates([]);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Real-Time Updates</h2>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Connecting...'} • Last update: {formatTimeAgo(lastUpdateTime)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUpdates}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <Activity className="h-5 w-5" />
          </button>
          <button
            onClick={clearUpdates}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${connected ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {connected ? (
                <Activity className="h-5 w-5 text-green-600 animate-pulse" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {connected ? 'Live Updates Active' : 'Establishing Connection...'}
              </p>
              <p className="text-sm text-gray-600">
                {connected 
                  ? 'Receiving real-time political updates' 
                  : 'Attempting to connect to update stream'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{updates.length} Updates</p>
            <p className="text-xs text-gray-600">Polling every 10s</p>
          </div>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No updates yet</p>
            <p className="text-sm text-gray-500 mt-1">Updates will appear here in real-time</p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`p-4 border rounded-lg ${getUpdateColor(update.action)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getUpdateColor(update.action).replace('text-', 'bg-').split(' ')[0]}`}>
                    {getUpdateIcon(update.type, update.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{update.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUpdateColor(update.action)}`}>
                        {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {update.action.charAt(0).toUpperCase() + update.action.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{update.description}</p>
                    {update.details && (
                      <p className="text-sm text-gray-600 mt-1">{update.details}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(update.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        {getTrendIcon(update.action)}
                        <span className={update.action === 'deleted' ? 'text-red-600' : 'text-green-600'}>
                          {update.action.charAt(0).toUpperCase() + update.action.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Statistics */}
      {updates.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Update Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Total Updates</p>
              <p className="text-2xl font-bold text-gray-900">{updates.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Politician Updates</p>
              <p className="text-2xl font-bold text-gray-900">
                {updates.filter(u => u.type === 'politician').length}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Campaign Updates</p>
              <p className="text-2xl font-bold text-gray-900">
                {updates.filter(u => u.type === 'campaign').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-yellow-600 font-medium">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900">
                {updates.filter(u => {
                  const timeDiff = new Date().getTime() - u.timestamp.getTime();
                  return timeDiff < 3600000; // Last hour
                }).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Live updates enabled</span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setConnected(!connected)}
              className={`px-3 py-1 text-sm rounded-lg ${
                connected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {connected ? 'Disconnect' : 'Connect'}
            </button>
            <div className="text-sm text-gray-600">
              Next poll in: <span className="font-medium">10s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}