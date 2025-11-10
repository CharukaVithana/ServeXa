import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Search } from "lucide-react";
import employeeService from "../../services/employeeService";
import type { Task } from "../../services/employeeService";

const Completed: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    setLoading(true);
    try {
      const tasks = await employeeService.getCompletedTasks();
      setCompletedTasks(tasks);
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format time to 12-hour format
  const formatCompletionTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Format duration
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Completed Tasks
          </h2>
          <p className="text-sm text-gray-600">
            Recently completed service tasks
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading completed tasks...</p>
          </div>
        ) : completedTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">
                No completed tasks
              </p>
              <p className="text-gray-500 text-sm">
                Completed tasks will appear here
              </p>
            </div>
          </div>
        ) : (
          /* Completed Tasks List */
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-green-200 p-6 shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {task.taskNumber}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle size={12} />
                        COMPLETED
                      </span>
                      {task.isUrgent && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full shadow-sm">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      {task.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      Completed: {formatCompletionTime(task.completionTime)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    {task.vehicleModel}
                  </p>
                  <p className="text-sm text-gray-600">{task.serviceType}</p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    Duration:{" "}
                    <span className="font-semibold">
                      {formatDuration(task.duration)}
                    </span>
                  </span>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium">
                    View Details
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

export default Completed;
