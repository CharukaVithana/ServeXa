import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle, X } from "lucide-react";
import employeeService from "../../services/employeeService";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  path: string;
}

const NavigationTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [taskCounts, setTaskCounts] = useState({
    assigned: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  });

  // Fetch task counts
  useEffect(() => {
    fetchTaskCounts();
  }, []);

  const fetchTaskCounts = async () => {
    try {
      const [assignedTasks, ongoingTasks, completedTasks, cancelledTasks] =
        await Promise.all([
          employeeService.getPendingTasks(),
          employeeService.getOngoingTasks(),
          employeeService.getCompletedTasks(),
          employeeService.getRejectedTasks(),
        ]);

      setTaskCounts({
        assigned: assignedTasks.length,
        ongoing: ongoingTasks.length,
        completed: completedTasks.length,
        cancelled: cancelledTasks.length,
      });
    } catch (error) {
      console.error("Error fetching task counts:", error);
    }
  };

  const tabs: Tab[] = [
    {
      id: "pending-tasks",
      label: "Assigned Tasks",
      icon: <ClipboardList size={18} />,
      count: taskCounts.assigned,
      path: "/employee/pending-tasks",
    },
    {
      id: "current-tasks",
      label: "Ongoing Tasks",
      icon: <Clock size={18} />,
      count: taskCounts.ongoing,
      path: "/employee/current-tasks",
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircle size={18} />,
      count: taskCounts.completed,
      path: "/employee/completed",
    },
    {
      id: "rejected",
      label: "Cancelled",
      icon: <X size={18} />,
      count: taskCounts.cancelled,
      path: "/employee/rejected",
    },
  ];

  const handleTabClick = (tab: Tab) => {
    navigate(tab.path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                flex items-center gap-2 px-6 py-3 transition-all flex-1 justify-center
                ${
                  isActive(tab.path)
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <span
                className={
                  isActive(tab.path) ? "text-red-600" : "text-gray-500"
                }
              >
                {tab.icon}
              </span>
              <span className="font-normal text-sm whitespace-nowrap">
                {tab.label}
              </span>
              {tab.count && (
                <span
                  className={`
                  flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold
                  ${
                    isActive(tab.path)
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 text-gray-700"
                  }
                `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;
