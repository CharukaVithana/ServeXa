import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">User Information</h2>
            <div className="bg-gray-50 rounded p-4 space-y-2">
              <p><span className="font-medium">Name:</span> {user?.fullName}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Book Service</h3>
              <p className="text-blue-700 text-sm mt-2">Schedule your vehicle service</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Book Now
              </button>
            </div>

            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Service History</h3>
              <p className="text-green-700 text-sm mt-2">View past services</p>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View History
              </button>
            </div>

            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Active Services</h3>
              <p className="text-purple-700 text-sm mt-2">Track current services</p>
              <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                Track Service
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;