'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, Settings, Filter } from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'politician' | 'campaign' | 'analytics';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'High Alert Level',
      message: 'Campaign "2024 Presidential Election" has exceeded target support by 18%',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      priority: 'high',
      category: 'campaign',
      action: {
        label: 'View Campaign',
        onClick: () => window.location.href = '/data',
      },
    },
    {
      id: '2',
      type: 'warning',
      title: 'Investigation Started',
      message: 'Politician "Elena Rodriguez" is under investigation',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      priority: 'high',
      category: 'politician',
      action: {
        label: 'View Details',
        onClick: () => window.location.href = '/data',
      },
    },
    {
      id: '3',
      type: 'success',
      title: 'Campaign Milestone',
      message: 'Green Energy Initiative reached 42% public support',
      timestamp: new Date(Date.now() - 900000),
      read: true,
      priority: 'medium',
      category: 'campaign',
    },
    {
      id: '4',
      type: 'info',
      title: 'System Update',
      message: 'Analytics dashboard has been updated with new features',
      timestamp: new Date(Date.now() - 1200000),
      read: true,
      priority: 'low',
      category: 'system',
    },
    {
      id: '5',
      type: 'warning',
      title: 'Low Approval Rating',
      message: 'Politician "Robert Garcia" approval rating dropped to 45%',
      timestamp: new Date(Date.now() - 1500000),
      read: true,
      priority: 'medium',
      category: 'politician',
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    soundEnabled: false,
    highPriorityOnly: false,
    categories: {
      system: true,
      politician: true,
      campaign: true,
      analytics: true,
    },
  });

  useEffect(() => {
    updateUnreadCount();
  }, [notifications]);

  const updateUnreadCount = () => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'alerts') {
      filtered = filtered.filter(n => n.type === 'alert' || n.type === 'warning');
    }

    // Apply category filters from settings
    filtered = filtered.filter(n => notificationSettings.categories[n.category]);

    // Apply priority filter
    if (notificationSettings.highPriorityOnly) {
      filtered = filtered.filter(n => n.priority === 'high');
    }

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
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

  const addTestNotification = () => {
    const types: Notification['type'][] = ['alert', 'info', 'success', 'warning'];
    const categories: Notification['category'][] = ['system', 'politician', 'campaign', 'analytics'];
    const priorities: Notification['priority'][] = ['low', 'medium', 'high'];
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: types[Math.floor(Math.random() * types.length)],
      title: 'Test Notification',
      message: 'This is a test notification generated for demonstration purposes',
      timestamp: new Date(),
      read: false,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread • {filteredNotifications.length} total
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          <button
            onClick={addTestNotification}
            className="text-sm text-green-600 hover:text-green-800"
          >
            + Test Notification
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('alerts')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'alerts'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Alerts & Warnings
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailAlerts: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Email Alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      pushNotifications: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Push Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.soundEnabled}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      soundEnabled: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Sound Alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.highPriorityOnly}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      highPriorityOnly: e.target.checked
                    })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">High Priority Only</span>
                </label>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700">Categories</h4>
                {Object.entries(notificationSettings.categories).map(([category, enabled]) => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        categories: {
                          ...notificationSettings.categories,
                          [category]: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No notifications</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'all' ? 'All caught up!' : `No ${filter} notifications`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                          {notification.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <span className="text-xs text-blue-600 font-medium">New</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {notification.action.label}
                          </button>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-600 font-medium">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => {
                  const today = new Date();
                  const notificationDate = new Date(n.timestamp);
                  return notificationDate.toDateString() === today.toDateString();
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
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {showSettings ? 'Hide Settings' : 'Settings'}
            </button>
            <div className="text-sm text-gray-600">
              Last updated: {formatTimeAgo(new Date())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}