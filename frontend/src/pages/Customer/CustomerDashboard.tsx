import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Car,
  Clock,
  Calendar,
  CreditCard,
  Star,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <Sidebar />

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 h-full overflow-y-auto p-8">
        <div className="w-full max-w-7xl mx-auto space-y-10 pb-10">
          {/* ===== CUSTOMER INFO ===== */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src="https://via.placeholder.com/100"
              alt="profile"
              className="w-24 h-24 rounded-full border-4 border-gray-300 object-cover"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold">
                {user?.fullName || "Alex Johnson"}
              </h2>
              <p className="text-gray-600">
                {user?.email || "alex.johnson@example.com"}
              </p>
              <p className="text-gray-600">{user?.phone || "(555) 123-4567"}</p>
            </div>
            <button
              onClick={() => navigate("/customer/profile")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Edit Profile
            </button>
          </div>

          {/* ===== STATS OVERVIEW ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Wrench,
                label: "Active Services",
                value: 3,
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Car,
                label: "Total Vehicles",
                value: 2,
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Clock,
                label: "Past Services",
                value: 15,
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: Calendar,
                label: "Upcoming Appointments",
                value: 1,
                color: "bg-purple-100 text-purple-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all"
              >
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ===== SERVICE SUMMARY & QUICK ACTIONS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Service Summary */}
            <div className="border rounded-xl p-6 bg-white shadow-sm">
              <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">
                Ongoing Service
              </h4>
              <h5 className="font-medium text-slate-800">
                Oil Change - Toyota Camry 2020
              </h5>
              <p className="text-sm text-gray-500 mb-3">Started: 2 hours ago</p>

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Progress</p>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>

              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                View Details
              </button>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-xl p-6 bg-white shadow-sm">
              <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">
                Quick Actions
              </h4>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/customer/appointment")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Book New Service
                </button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                  View All Vehicles
                </button>
                <button
                  onClick={() => navigate("/customer/chat-support")}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Chat with Support
                </button>
              </div>
            </div>
          </div>

          {/* ===== EXPENSE SUMMARY ===== */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">
              Expense Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <CreditCard className="mx-auto text-blue-500 mb-2" size={28} />
                <p className="text-2xl font-semibold">$1,230</p>
                <p className="text-gray-600 text-sm">Total Spent</p>
              </div>
              <div>
                <Star className="mx-auto text-yellow-500 mb-2" size={28} />
                <p className="text-2xl font-semibold">4.7</p>
                <p className="text-gray-600 text-sm">Average Rating</p>
              </div>
              <div>
                <Wrench className="mx-auto text-green-500 mb-2" size={28} />
                <p className="text-2xl font-semibold">22</p>
                <p className="text-gray-600 text-sm">Total Services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
