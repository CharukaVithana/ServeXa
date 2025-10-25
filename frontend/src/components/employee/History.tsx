import React from 'react';
import { Calendar } from 'lucide-react';

const History: React.FC = () => {
  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task History</h2>
          <p className="text-sm text-gray-600">View all your past service tasks</p>
        </div>

        {/* History Content */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Task History</h3>
            <p className="text-gray-600 mb-6">Complete history of all your service tasks</p>
            <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium shadow-md">
              Load History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
