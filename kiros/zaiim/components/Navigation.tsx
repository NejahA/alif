'use client';

import { useState } from 'react';
import { Home, BarChart3, Bell, Search, Download, Database, Users, Target, Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home, href: '/' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'data', label: 'Data Management', icon: Database, href: '/data' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '#' },
    { id: 'search', label: 'Search', icon: Search, href: '#' },
    { id: 'export', label: 'Export', icon: Download, href: '#' },
  ];

  const handleNavigation = (id: string, href: string) => {
    setActivePage(id);
    setIsOpen(false);
    if (href !== '#') {
      window.location.href = href;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Navigation Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-64 bg-white shadow-xl md:shadow-none
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-300 ease-in-out
        h-screen overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zaiim</h1>
              <p className="text-sm text-gray-600">Political Leadership</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.href)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${activePage === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Politicians</span>
                </div>
                <span className="text-sm font-bold text-gray-900">5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Campaigns</span>
                </div>
                <span className="text-sm font-bold text-gray-900">4</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Alerts</span>
                </div>
                <span className="text-sm font-bold text-gray-900">2</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/data'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Add New Politician
              </button>
              <button
                onClick={() => window.location.href = '/data'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Add New Campaign
              </button>
              <button
                onClick={() => window.location.href = '/analytics'}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Zaiim v1.0 • Political Leadership Platform
            </p>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}