import React, { useState, useEffect } from "react";
import employeeService from "../../services/employeeService";

interface StatusCard {
  title: string;
  count: number;
}

const StatusCards: React.FC = () => {
  const [cards, setCards] = useState<StatusCard[]>([
    { title: "Assigned", count: 0 },
    { title: "In Progress", count: 0 },
    { title: "Completed", count: 0 },
    { title: "Cancelled", count: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskStatistics();
  }, []);

  const fetchTaskStatistics = async () => {
    setLoading(true);
    try {
      // Fetch all tasks to calculate statistics
      const [pendingTasks, ongoingTasks, completedTasks, rejectedTasks] =
        await Promise.all([
          employeeService.getMyTasksByStatus("ASSIGNED"),
          employeeService.getMyTasksByStatus("ONGOING"),
          employeeService.getMyTasksByStatus("COMPLETED"),
          employeeService.getRejectedTasks(),
        ]);

      setCards([
        { title: "Assigned", count: pendingTasks.length },
        { title: "In Progress", count: ongoingTasks.length },
        { title: "Completed", count: completedTasks.length },
        { title: "Cancelled", count: rejectedTasks.length },
      ]);
    } catch (error) {
      console.error("Error fetching task statistics:", error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-4 justify-between">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-all cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-2 text-gray-300">
                  {card.title}
                </span>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-600 rounded animate-pulse"></div>
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {card.count}
                  </span>
                )}
              </div>

              {/* Three dots menu */}
              <div className="flex justify-end mt-2">
                <button className="flex flex-col gap-0.5 p-1 rounded hover:bg-gray-600 transition-colors text-gray-500">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusCards;
