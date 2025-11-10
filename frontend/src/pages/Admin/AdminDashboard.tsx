import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { FaPencilAlt } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import ProfilePictureModal from "../../components/ProfilePictureModal";
import { adminService } from "../../services/adminService";
import type { PendingUser } from "../../services/adminService";

interface DashboardStats {
  pendingEmployees: number;
  pendingAdmins: number;
  activeTasks: number;
  totalUsers: number;
  totalAppointments: number;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout, updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const [isPictureModalOpen, setPictureModalOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingEmployees: 0,
    pendingAdmins: 0,
    activeTasks: 0,
    totalUsers: 0,
    totalAppointments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pending users
      const pendingData = await adminService.getPendingUsers();
      
      // Ensure pendingData is an array
      const users = Array.isArray(pendingData) ? pendingData : [];
      setPendingUsers(users);
      
      // Calculate stats from pending users
      const pendingEmployees = users.filter(u => u.role === 'EMPLOYEE').length;
      const pendingAdmins = users.filter(u => u.role === 'ADMIN').length;
      
      setStats(prev => ({
        ...prev,
        pendingEmployees,
        pendingAdmins,
        activeTasks: 5, // Mock data - replace with actual API call
        totalUsers: 150, // Mock data
        totalAppointments: 23, // Mock data
        revenue: 15750 // Mock data
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      await adminService.updateUserStatus(userId, status);
      
      // Refresh the pending users list
      await fetchDashboardData();
    } catch (err: any) {
      console.error(`Failed to ${action} user:`, err);
      setError(`Failed to ${action} user`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getAvatarUrl = () => {
    if (user?.profilePictureUrl) return user.profilePictureUrl;
    const name = user?.fullName?.replace(" ", "+") || "Admin";
    return `https://ui-avatars.com/api/?name=${name}&background=D72638&color=fff&rounded=true&size=100`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72638] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 overflow-hidden">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto p-8 ml-64 transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto space-y-10 pb-10">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className="relative cursor-pointer group"
              onClick={() => setPictureModalOpen(true)}
              title="Click to change profile picture"
            >
              <img
                src={getAvatarUrl()}
                alt="profile"
                className="w-24 h-24 rounded-full border-4 border-[#D72638] object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-opacity">
                <FaPencilAlt className="text-white opacity-0 group-hover:opacity-100" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {user?.fullName || "Admin"} 
                <Shield className="text-[#D72638]" size={20} />
              </h2>
              <p className="text-gray-600">{user?.email || "admin@servexa.com"}</p>
              <p className="text-sm text-gray-500 mt-1">System Administrator</p>
            </div>

            <button
              onClick={() => navigate("/admin/profile")}
              className="bg-[#D72638] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaPencilAlt /> Edit Profile
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <UserX size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.pendingEmployees}</h3>
                <p className="text-gray-600 text-sm">Pending Employees</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.pendingAdmins}</h3>
                <p className="text-gray-600 text-sm">Pending Admins</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.activeTasks}</h3>
                <p className="text-gray-600 text-sm">Active Tasks</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </div>

          {/* Pending Requests Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending User Registrations */}
            <div className="border rounded-xl p-6 bg-white shadow-sm">
              <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800 flex items-center gap-2">
                <UserCheck size={20} />
                Pending User Registrations
              </h4>
              
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending registrations</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-slate-800">{user.fullName}</h5>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUserAction(user.id, 'approve')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'reject')}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {pendingUsers.length > 5 && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="mt-4 w-full text-center text-sm text-[#D72638] hover:underline"
                >
                  View all {pendingUsers.length} pending requests →
                </button>
              )}
            </div>

            {/* Pending Tasks */}
            <div className="border rounded-xl p-6 bg-white shadow-sm">
              <h4 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800 flex items-center gap-2">
                <ClipboardList size={20} />
                Pending Tasks
              </h4>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Mock tasks - replace with actual API data */}
                {[
                  { id: '1', title: 'Review service quality reports', priority: 'HIGH', assignedTo: 'John Doe', dueDate: '2024-01-20' },
                  { id: '2', title: 'Approve employee schedules', priority: 'MEDIUM', assignedTo: 'Jane Smith', dueDate: '2024-01-21' },
                  { id: '3', title: 'Update pricing structure', priority: 'LOW', assignedTo: 'Mike Johnson', dueDate: '2024-01-25' },
                ].map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800">{task.title}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Assigned to: {task.assignedTo}</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => navigate('/admin/tasks')}
                className="mt-4 w-full text-center text-sm text-[#D72638] hover:underline"
              >
                View all tasks →
              </button>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Revenue This Month
              </h4>
              <p className="text-3xl font-bold text-gray-800">${stats.revenue.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={16} /> +12% from last month
              </p>
            </div>

            {/* Appointments Today */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Appointments Today
              </h4>
              <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
              <p className="text-sm text-gray-600 mt-2">Across all locations</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  View Reports
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isPictureModalOpen}
        onClose={() => setPictureModalOpen(false)}
        onSave={updateProfilePicture}
        currentImageUrl={user?.profilePictureUrl}
      />
    </div>
  );
};

export default AdminDashboard;