import React, { useState, useEffect } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import employeeService from "../../services/employeeService";
import type { Task } from "../../services/employeeService";

const Rejected: React.FC = () => {
  const [rejectedTasks, setRejectedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch rejected tasks
  useEffect(() => {
    fetchRejectedTasks();
  }, []);

  const fetchRejectedTasks = async () => {
    setLoading(true);
    try {
      const tasks = await employeeService.getRejectedTasks();
      setRejectedTasks(tasks);
    } catch (error) {
      console.error("Error fetching rejected tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = rejectedTasks.filter(
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

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cancelled Tasks
          </h2>
          <p className="text-sm text-gray-600">
            View all cancelled service tasks
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

        {/* Rejected Tasks Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">
                No cancelled tasks
              </p>
              <p className="text-gray-500 text-sm">
                All tasks are either pending, ongoing, or completed
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
                      Scheduled Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Cancelled Date
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <X size={14} className="mr-1" />
                          CANCELLED
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar size={14} />
                          <span className="text-sm">
                            {formatTime(task.dueTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(task.updatedAt || "")}
                        </span>
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

export default Rejected;
