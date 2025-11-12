import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaCar, FaHistory, FaCalendarAlt, FaBell, FaPencilAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import ProfilePictureModal from '../../components/ProfilePictureModal';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/Badge';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useAppointmentCount } from '../../hooks/useAppointmentCount';
import authService from '../../services/authService';

const CustomerProfile = () => {
    const { user, logout, updateProfilePicture } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);
    
    // Initialize visited tabs from localStorage
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => {
        const stored = localStorage.getItem('visitedTabs');
        return stored ? new Set(JSON.parse(stored)) : new Set(['personal-info']);
    });
    
    const { unreadCount: notificationCount, refetch: refetchNotifications } = useNotificationCount();
    const { counts: appointmentCounts, refetch: refetchAppointments } = useAppointmentCount();
    
    // Debug: Log user data
    console.log('Current user data:', user);

    // Track visited tabs and mark as read when visiting
    useEffect(() => {
        const currentTab = location.pathname.split('/').pop();
        const validTabs = ['personal-info', 'my-vehicles', 'service-history', 'appointments', 'notifications'];
        if (currentTab && validTabs.includes(currentTab)) {
            setVisitedTabs(prev => {
                const newSet = new Set([...prev, currentTab]);
                // Save to localStorage
                localStorage.setItem('visitedTabs', JSON.stringify([...newSet]));
                return newSet;
            });

            // If visiting notifications tab, mark all as read after a short delay
            if (currentTab === 'notifications' && notificationCount > 0) {
                // Delay to ensure the tab content has loaded
                setTimeout(() => {
                    markAllNotificationsAsRead();
                }, 1000);
            }
        }
    }, [location.pathname, notificationCount]);

    const markAllNotificationsAsRead = async () => {
        try {
            const token = authService.getStoredToken();
            const base = import.meta.env.VITE_NOTIFICATION_API_URL || "http://127.0.0.1:8085";
            
            // First fetch all notifications
            const res = await axios.get(`${base}/api/notifications/me`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            const response = res.data;
            const notifications = response?.data?.content || response?.data || [];
            
            // Mark each unread notification as read
            const unreadNotifications = (Array.isArray(notifications) ? notifications : [])
                .filter(n => !n.isRead);
            
            if (unreadNotifications.length > 0) {
                await Promise.all(
                    unreadNotifications.map(notification =>
                        axios.put(
                            `${base}/api/notifications/${notification.id}/mark-read`,
                            {},
                            {
                                headers: { Authorization: token ? `Bearer ${token}` : "" },
                            }
                        ).catch(err => console.error('Failed to mark notification as read:', err))
                    )
                );
                
                // Refresh the notification count
                refetchNotifications();
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { to: 'personal-info', icon: <FaUser />, label: 'Personal Info' },
        { to: 'my-vehicles', icon: <FaCar />, label: 'My Vehicles' },
        { to: 'service-history', icon: <FaHistory />, label: 'Service History' },
        { to: 'appointments', icon: <FaCalendarAlt />, label: 'Appointments', badge: appointmentCounts.upcoming },
        { to: 'notifications', icon: <FaBell />, label: 'Notifications', badge: notificationCount },
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

            <div className="flex-1 overflow-y-auto bg-white lg:ml-64">
                {/* Header */}
                <header className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center gap-4">

                        <div 
                           className="relative cursor-pointer group"
                           onClick={() => setPictureModalOpen(true)}
                           title="Click to change profile picture"
                        >
                        <img
                            src={getAvatarUrl()}
                            alt="User Avatar"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500"
                        />

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-opacity">
                                <FaPencilAlt className="text-white opacity-0 group-hover:opacity-100" />
                            </div>
                            </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{user?.fullName || 'User'}</h1>
                            <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                            {user?.phoneNumber && (
                                <p className="text-gray-600">{user.phoneNumber}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setPictureModalOpen(true)} className="bg-[#D72638] text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2 mt-4 sm:mt-0">
                        <FaPencilAlt /> 
                         Picture
                    </button>
                </header>

                {/* Navigation Tabs */}
                <nav className="flex flex-wrap border-b border-gray-200">
                    {navItems.map((item) => {
                        const isUnvisited = item.badge && item.badge > 0 && !visitedTabs.has(item.to);
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                                        isActive
                                            ? 'border-b-2 border-[#D72638] text-[#D72638]'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`
                                }
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <Badge 
                                        count={item.badge} 
                                        variant={isUnvisited ? 'active' : 'default'} 
                                    />
                                )}
                                {isUnvisited && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Main Content Area */}
                <div className="p-6">
                    <Outlet />
                </div>

                
            </div>
            <ProfilePictureModal
                isOpen={isPictureModalOpen}
                onClose={() => setPictureModalOpen(false)}
                onSave={async (imageUrl) => {
                    try {
                        await updateProfilePicture(imageUrl);
                        setPictureModalOpen(false);
                    } catch (error) {
                        console.error('Failed to update profile picture:', error);
                        // Optionally show an error message
                    }
                }}
                currentImageUrl={user?.profilePictureUrl}
            />
        </div>
    );
};

export default CustomerProfile;