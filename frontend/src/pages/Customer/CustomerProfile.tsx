import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaUser, FaCar, FaHistory, FaCalendarAlt, FaBell, FaPencilAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import ProfilePictureModal from '../../components/ProfilePictureModal';
import Sidebar from '../../components/Sidebar';

const CustomerProfile = () => {
    const { user, logout, updateProfilePicture } = useAuth();
    const navigate = useNavigate();
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);

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

    const getAvatarUrl = () => {
        if (user?.profilePictureUrl) {
            return user.profilePictureUrl;
        }
        const name = user?.fullName?.replace(' ', '+') || 'User';
        return `https://ui-avatars.com/api/?name=${name}&background=D72638&color=fff&rounded=true&size=80`;
    };

    return (
        <div className="flex h-screen bg-gray-50 text-slate-800 overflow-hidden">
            <Sidebar />

            <div className="flex-1 h-full overflow-y-auto p-8 ml-64 transition-all duration-300">
                {/* Header */}
                <header className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center gap-4">

                        <div 
                           className="relative cursor-pointer group"
                           onClick={() => setPictureModalOpen(true)}
                           title="Click to change profile picture"
                        >
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.fullName?.replace(' ', '+') || 'Alex+Johnson'}&background=D72638&color=fff&rounded=true&size=80`}
                            alt="User Avatar"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500"
                        />

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-opacity">
                                <FaPencilAlt className="text-white opacity-0 group-hover:opacity-100" />
                            </div>
                            </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{user?.fullName || 'Alex Johnson'}</h1>
                            <p className="text-gray-600">{user?.email || 'alex.johnson@example.com'}</p>
                            <p className="text-gray-600">0752265435</p>
                        </div>
                    </div>
                    <button onClick={() => setPictureModalOpen(true)} className="bg-[#D72638] text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2 mt-4 sm:mt-0">
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

                
            </div>
            <ProfilePictureModal
                isOpen={isPictureModalOpen}
                onClose={() => setPictureModalOpen(false)}
                onSave={updateProfilePicture}
                currentImageUrl={user?.profilePictureUrl}
            />
        </div>
    );
};

export default CustomerProfile;