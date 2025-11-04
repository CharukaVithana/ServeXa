import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Pause } from 'lucide-react';

interface ServiceJob {
  id: string;
  serviceId: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    owner: string;
  };
  serviceType: string;
  status: 'In Progress' | 'Pending';
  timeSpend: string;
  timeLogged: string;
  deadline: string;
}

const CurrentTasks: React.FC = () => {
  const [serviceJobs] = useState<ServiceJob[]>([
    {
      id: '1',
      serviceId: '#SRV-2024-001',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        owner: 'John Anderson'
      },
      serviceType: 'Oil Change',
      status: 'In Progress',
      timeSpend: '75m',
      timeLogged: '75m',
      deadline: '11:30 AM'
    },
    {
      id: '2',
      serviceId: '#SRV-2024-002',
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        owner: 'Sarah Miller'
      },
      serviceType: 'Brake Inspection',
      status: 'Pending',
      timeSpend: '-',
      timeLogged: '-',
      deadline: '2:00 PM'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentSession, setCurrentSession] = useState({
    taskName: serviceJobs[0]?.serviceId || '',
    time: '1:15:32',
    isRunning: true
  });

  useEffect(() => {
    let interval: number;
    if (currentSession.isRunning) {
      interval = window.setInterval(() => {
        // Timer logic would go here
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession.isRunning]);

  const handleStopTimer = () => {
    setCurrentSession({ ...currentSession, isRunning: false });
  };

  const handleAddNote = () => {
    console.log('Add note');
  };

  const handleMarkAsCompleted = () => {
    console.log('Mark as completed');
  };

  const filteredJobs = serviceJobs.filter(job =>
    job.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Service Jobs</h2>
          <p className="text-sm text-gray-600">Monitor and manage your ongoing service tasks</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Search className="absolute left-3 bottom-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show entries</label>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
                10
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">filter by</label>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-sm">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Service Jobs Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Service ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Vehicle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Service Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Time Spend</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Time Logged</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{job.serviceId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {job.vehicle.make} {job.vehicle.model} {job.vehicle.year}
                      </div>
                      <div className="text-xs text-gray-500">{job.vehicle.owner}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{job.serviceType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'In Progress' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{job.timeSpend}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{job.timeLogged}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-red-600">
                        <Clock size={14} />
                        <span className="text-sm font-semibold">{job.deadline}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {job.status === 'Pending' ? (
                          <button className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-all shadow-sm">
                            Start
                          </button>
                        ) : (
                          <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition-all shadow-sm">
                            Pause
                          </button>
                        )}
                        <button className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-all shadow-sm">
                          Complete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Task Info Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Current task name</h3>
        </div>

        {/* Time Tracking Section */}
        <div className="max-w-md mx-auto">
          {/* Time Tracking Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Time Tracking</h3>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">{currentSession.time}</div>
              <p className="text-sm text-gray-600">Current Session</p>
            </div>

            <div className="flex gap-3 mb-4">
              <button 
                onClick={handleStopTimer}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium shadow-md flex items-center justify-center gap-2"
              >
                <Pause size={16} />
                Stop Timer
              </button>
              <button 
                onClick={handleAddNote}
                className="flex-1 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium shadow-md"
              >
                Add Note
              </button>
            </div>

            <button 
              onClick={handleMarkAsCompleted}
              className="w-full px-4 py-2.5 bg-pink-200 hover:bg-pink-300 text-gray-800 rounded-lg transition-all font-medium"
            >
              Mark As Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentTasks;
