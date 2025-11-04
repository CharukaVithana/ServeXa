import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const Completed: React.FC = () => {
  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Completed Tasks</h2>
          <p className="text-sm text-gray-600">Recently completed service tasks</p>
        </div>

        {/* Completed Tasks List */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">#SRV-2024-005</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                    <CheckCircle size={12} />
                    COMPLETED
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Michael Brown</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Clock size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">Completed: 12:45 PM</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-base font-semibold text-gray-900 mb-1">Tesla Model 3 2023</p>
              <p className="text-sm text-gray-600">Battery Check & Software Update</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Duration: <span className="font-semibold">90m</span></span>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium">
                View Details
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">#SRV-2024-006</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                    <CheckCircle size={12} />
                    COMPLETED
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Lisa Anderson</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Clock size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">Completed: 11:20 AM</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-base font-semibold text-gray-900 mb-1">Chevrolet Silverado 2022</p>
              <p className="text-sm text-gray-600">Engine Diagnostic</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Duration: <span className="font-semibold">120m</span></span>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completed;
