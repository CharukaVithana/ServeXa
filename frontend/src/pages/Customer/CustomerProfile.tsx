import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaUser, FaCar, FaHistory, FaCalendarAlt, FaBell, FaCog, FaSignOutAlt, FaPencilAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const CustomerProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { to: 'personal-info', icon: <FaUser />, label: 'Personal Info' },
        { to: 'my-vehicles', icon: <FaCar />, label: 'My Vehicles' },
        { to: 'service-history', icon: <FaHistory />, label: 'Service History' },
        { to: 'appointments', icon: <FaCalendarAlt />, label: 'Appointments' },
        { to: 'notifications', icon: <FaBell />, label: 'Notifications' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
                {/* Header */}
                <header className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center gap-4">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.fullName?.replace(' ', '+') || 'Alex+Johnson'}&background=D72638&color=fff&rounded=true&size=80`}
                            alt="User Avatar"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{user?.fullName || 'Alex Johnson'}</h1>
                            <p className="text-gray-600">{user?.email || 'alex.johnson@example.com'}</p>
                            <p className="text-gray-600">0552265435</p>
                        </div>
                    </div>
                    <button className="bg-[#D72638] text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2 mt-4 sm:mt-0">
                        <FaPencilAlt /> Edit Profile
                    </button>
                </header>

                {/* Navigation Tabs */}
                <nav className="flex flex-wrap border-b border-gray-200">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'border-b-2 border-[#D72638] text-[#D72638]'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Main Content Area */}
                <div className="p-6">
                    <Outlet />
                </div>

                {/* Footer */}
                <footer className="p-6 border-t border-gray-200 flex justify-between items-center">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <FaCog />
                        <span>Settings</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CustomerProfile;