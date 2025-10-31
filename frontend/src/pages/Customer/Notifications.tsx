import React, { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTag, FaRegClock } from 'react-icons/fa';

const ToggleSwitch = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700">{label}</span>
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
        </label>
    </div>
);

const NotificationItem = ({ icon, text, time, colorClass }: { icon: React.ReactNode, text: string, time: string, colorClass: string }) => (
    <div className={`p-4 rounded-lg flex items-start gap-4 ${colorClass}`}>
        <div className="text-xl mt-1">{icon}</div>
        <div>
            <p>{text}</p>
            <p className="text-sm opacity-75">{time}</p>
        </div>
    </div>
);

const Notifications = () => {
    const [prefs, setPrefs] = useState({
        serviceUpdates: true,
        appointmentReminders: true,
        specialOffers: false,
    });

    const notifications = [
        { icon: <FaRegClock />, text: 'Oil change is 60% complete. Expected completion in 25 minutes.', time: '15 minutes ago', colorClass: 'bg-orange-50 text-orange-700' },
        { icon: <FaExclamationTriangle />, text: 'Reminder: Your tire rotation appointment is tomorrow at 10:30 AM.', time: '2 hours ago', colorClass: 'bg-yellow-50 text-yellow-700' },
        { icon: <FaCheckCircle />, text: 'Your brake service has been completed. Your vehicle is ready for pickup.', time: 'Yesterday', colorClass: 'bg-green-50 text-green-700' },
        { icon: <FaTag />, text: 'Special summer discount: 15% off on all A/C services this month!', time: '3 days ago', colorClass: 'bg-blue-50 text-blue-700' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                <button className="text-sm text-red-500 hover:underline">Mark all as read</button>
            </div>
            <div className="space-y-3 mb-8">
                {notifications.map((n, i) => <NotificationItem key={i} {...n} />)}
            </div>
            <div className="text-center mb-8">
                <button className="text-sm text-red-500 font-semibold hover:underline">View All Notifications</button>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Notification Preferences</h3>
                <div className="space-y-4 max-w-sm">
                    <ToggleSwitch id="service-updates" label="Service Updates" checked={prefs.serviceUpdates} onChange={(c) => setPrefs(p => ({...p, serviceUpdates: c}))} />
                    <ToggleSwitch id="appointment-reminders" label="Appointment Reminders" checked={prefs.appointmentReminders} onChange={(c) => setPrefs(p => ({...p, appointmentReminders: c}))} />
                    <ToggleSwitch id="special-offers" label="Special Offers" checked={prefs.specialOffers} onChange={(c) => setPrefs(p => ({...p, specialOffers: c}))} />
                </div>
            </div>
        </div>
    );
};

export default Notifications;