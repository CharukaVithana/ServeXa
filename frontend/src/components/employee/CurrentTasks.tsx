import React, { useState, useEffect } from "react";
import { Search, Filter, Clock, CheckCircle, X } from "lucide-react";
import employeeService from "../../services/employeeService";
import type { Task } from "../../services/employeeService";

const CurrentTasks: React.FC = () => {
  const [ongoingTasks, setOngoingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch ongoing tasks
  useEffect(() => {
    fetchOngoingTasks();
  }, []);

  const fetchOngoingTasks = async () => {
    setLoading(true);
    try {
      const tasks = await employeeService.getOngoingTasks();
      setOngoingTasks(tasks);
    } catch (error) {
      console.error("Error fetching ongoing tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await employeeService.completeTask(task.id);
      await fetchOngoingTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task");
    }
  };

  const handleCancelTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to cancel task ${task.taskNumber}?`)) {
      return;
    }
    try {
      await employeeService.cancelTask(task.id);
      await fetchOngoingTasks();
    } catch (error) {
      console.error("Error cancelling task:", error);
      alert("Failed to cancel task");
    }
  };

  const filteredTasks = ongoingTasks.filter(
    (task) =>
      task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time to 12-hour format
  const formatTime = (timeString: string): string => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Active Service Jobs
          </h2>
          <p className="text-sm text-gray-600">
            Monitor and manage your ongoing service tasks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Search
              className="absolute left-3 bottom-2.5 text-gray-400"
              size={18}
            />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show entries
              </label>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
                10
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                filter by
              </label>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-sm">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Service Jobs Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">
                No ongoing tasks
              </p>
              <p className="text-gray-500 text-sm">
                Start a task from the pending tasks list
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Task Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Appointment Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {task.taskNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {task.vehicleModel}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {task.serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          ONGOING
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-red-600">
                          <Clock size={14} />
                          <span className="text-sm font-semibold">
                            {formatTime(task.dueTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteTask(task);
                            }}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            Complete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelTask(task);
                            }}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentTasks;
