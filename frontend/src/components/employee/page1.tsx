import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Clock } from 'lucide-react';
import ProfileHeader from './Header';
import StatusCards from './cards';
import NavigationTabs from './Navigation';

interface Task {
  id: string;
  taskNumber: string;
  customerName: string;
  vehicleModel: string;
  serviceType: string;
  dueTime: string;
  estimatedDuration: string;
  isUrgent: boolean;
}

const Page1: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="sticky top-0 z-50 shadow-md">
        <ProfileHeader />
      </div>

      {/* Main Content Container */}
      <div className="w-full">
        {/* Status Cards Section */}
        <div className="py-6">
          <StatusCards />
        </div>

        {/* Navigation Tabs Section */}
        <div className="bg-white shadow-sm">
          <NavigationTabs />
        </div>

        {/* Tasks List Section */}
        <div className="py-8">
          <TasksList />
        </div>
      </div>
    </div>
  );
};

const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // API Configuration
  const API_BASE_URL = 'https://api.servexa.com';

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks');
        // Use dummy data for demo
        setTasks(getDummyTasks());
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Use dummy data for demo
      setTasks(getDummyTasks());
    } finally {
      setLoading(false);
    }
  };

  // Dummy data for demonstration
  const getDummyTasks = (): Task[] => [
    {
      id: '1',
      taskNumber: '#SRV-2024-003',
      customerName: 'Robert Chen',
      vehicleModel: 'Ford F-150 2023',
      serviceType: 'Transmission Service',
      dueTime: '3:30 PM',
      estimatedDuration: '2h',
      isUrgent: false
    },
    {
      id: '2',
      taskNumber: '#SRV-2024-004',
      customerName: 'Emily Davis',
      vehicleModel: 'BMW 3 Series 2020',
      serviceType: 'Full Service',
      dueTime: '4:00 PM',
      estimatedDuration: '1.5h',
      isUrgent: true
    }
  ];

  const handleStartTask = async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Task started successfully!');
        fetchTasks(); // Refresh the list
      } else {
        alert('Failed to start task');
      }
    } catch (err) {
      console.error('Error starting task:', err);
      alert('Error starting task');
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Tasks</h2>
          <p className="text-sm text-gray-600">Manage and track your assigned service tasks</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks, customers, or vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
              Show entries
            </button>
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-sm">
              <Filter size={16} />
              Filter by
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">No tasks found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{task.taskNumber}</h3>
                      {task.isUrgent && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full shadow-sm">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1 font-medium">{task.customerName}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Est: {task.estimatedDuration}</span>
                  </div>
                </div>

                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-base font-semibold text-gray-900 mb-1">{task.vehicleModel}</p>
                  <p className="text-sm text-gray-600">{task.serviceType}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                    <Clock size={16} className="text-red-600" />
                    <span className="text-sm font-semibold text-red-600">Due: {task.dueTime}</span>
                  </div>

                  <button
                    onClick={() => handleStartTask(task.id)}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Play size={16} fill="white" />
                    Start Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page1;