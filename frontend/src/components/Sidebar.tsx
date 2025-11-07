import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Phone,
  User,
  Settings,
  LogOut,
  Users,
  ClipboardList,
  BarChart,
  Wrench,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menus = {
    customer: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/cus-dashboard" },
      { name: "Appointment", icon: Calendar, path: "appointments" },
      { name: "Contact", icon: Phone, path: "/customer/contact" },
      { name: "Profile", icon: User, path: "/profile" },
      { name: "Settings", icon: Settings, path: "/customer/settings" },
    ],
    employee: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
      { name: "Work Orders", icon: ClipboardList, path: "/employee/orders" },
      { name: "Tasks", icon: Wrench, path: "/employee/tasks" },
      { name: "Contact", icon: Phone, path: "/employee/contact" },
      { name: "Settings", icon: Settings, path: "/employee/settings" },
    ],
    admin: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { name: "Users", icon: Users, path: "/admin/users" },
      { name: "Reports", icon: BarChart, path: "/admin/reports" },
      { name: "Appointments", icon: Calendar, path: "/admin/appointments" },
      { name: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  };

  const userRole = user?.role || "customer";
  const sidebarItems = menus[userRole as keyof typeof menus];

  return (
    <div
      className={`fixed top-0 left-0 h-screen flex flex-col justify-between bg-black text-white shadow-lg z-50 ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300`}
    >
      {/* ===== LOGO ===== */}
      <div className="flex items-center justify-center py-6 border-b border-gray-800">
        <img src="/logo.png" alt="ServeXa Logo" className="w-32" />
      </div>

      {/* ===== MENU ===== */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {sidebarItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 py-4 px-4 w-full text-left transition-all ${
                  isActive
                    ? "bg-gray-800 border-l-4 border-blue-400 text-blue-200"
                    : "hover:bg-gray-800 border-l-5 border-transparent text-white-300 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </button>
              {/* Divider between tabs */}
              {idx < sidebarItems.length - 1 && (
                <div className="border-b border-gray-800 mx-4" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ===== LOGOUT ===== */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-3 text-red-400 hover:text-red-500 font-semibold w-full"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
