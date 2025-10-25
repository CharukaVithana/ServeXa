import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const MyStats: React.FC = () => {
  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Statistics</h2>
          <p className="text-sm text-gray-600">Track your performance and productivity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Tasks Today</h3>
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">8</p>
            <p className="text-xs text-green-600 mt-1">+2 from yesterday</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
              <BarChart3 size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">94%</p>
            <p className="text-xs text-green-600 mt-1">Above average</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg. Task Time</h3>
              <BarChart3 size={20} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">1.8h</p>
            <p className="text-xs text-gray-600 mt-1">Per task</p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="flex items-center justify-center py-16 bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Performance charts and analytics</p>
              <p className="text-sm text-gray-500">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStats;
