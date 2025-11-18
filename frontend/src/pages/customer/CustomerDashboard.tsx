import { useState, useEffect } from "react";
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
import { FaPencilAlt } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import ProfilePictureModal from "../../components/ProfilePictureModal";
import appointmentService from "../../services/appointmentService";

interface DashboardStats {
  activeServices: number;
  totalVehicles: number;
  pastServices: number;
  upcomingAppointments: number;
  totalSpent: number;
  averageRating: number;
  totalServices: number;
}

const CustomerDashboard: React.FC = () => {
  const { user,  updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const [isPictureModalOpen, setPictureModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeServices: 0,
    totalVehicles: 0,
    pastServices: 0,
    upcomingAppointments: 0,
    totalSpent: 0,
    averageRating: 0,
    totalServices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const statistics = await appointmentService.getCustomerStatistics(user.id);
        setStats(statistics);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        // Keep default values if the fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [user?.id]);


  const getAvatarUrl = () => {
    if (user?.profilePictureUrl) return user.profilePictureUrl;
    const name = user?.fullName?.replace(" ", "+") || "User";
    return `https://ui-avatars.com/api/?name=${name}&background=D72638&color=fff&rounded=true&size=100`;
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 h-full overflow-y-auto p-8 ml-64 transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto space-y-10 pb-10">
          {/* ===== PROFILE SECTION ===== */}
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
              <h2 className="text-xl font-semibold text-gray-800">
                {user?.fullName || "User"}
              </h2>
              <p className="text-gray-600">
                {user?.email || "user@example.com"}
              </p>
              {user?.phoneNumber && (
                <p className="text-gray-600">{user.phoneNumber}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="bg-[#D72638] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaPencilAlt /> Edit Profile 
              </button>
            </div>
          </div>

          {/* ===== STATS OVERVIEW ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Wrench,
                label: "Active Services",
                value: stats.activeServices,
                color: "bg-red-100 text-[#D72638]",
              },
              {
                icon: Car,
                label: "Total Vehicles",
                value: stats.totalVehicles,
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Clock,
                label: "Past Services",
                value: stats.pastServices,
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: Calendar,
                label: "Upcoming Appointments",
                value: stats.upcomingAppointments,
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
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ===== SERVICE SUMMARY & QUICK ACTIONS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ongoing Service Summary */}
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
                <span className="text-xs text-black bg-yellow-100 px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>

              <button className="bg-blue-500 hover:bg-blue-400 text-black px-4 py-2 rounded text-sm">
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
                <CreditCard className="mx-auto text-[#D72638] mb-2" size={28} />
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-semibold">
                      ${stats.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm">Total Spent</p>
                  </>
                )}
              </div>
              <div>
                <Star className="mx-auto text-yellow-500 mb-2" size={28} />
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-semibold">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <p className="text-gray-600 text-sm">Average Rating</p>
                  </>
                )}
              </div>
              <div>
                <Wrench className="mx-auto text-green-500 mb-2" size={28} />
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-semibold">{stats.totalServices}</p>
                    <p className="text-gray-600 text-sm">Total Services</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isPictureModalOpen}
        onClose={() => setPictureModalOpen(false)}
        onSave={async (imageUrl) => {
          await updateProfilePicture(imageUrl);
        }}
        currentImageUrl={user?.profilePictureUrl}
      />
    </div>
  );
};

export default CustomerDashboard;
