import React from 'react';
import { FaCalendarDay, FaClock, FaMapMarkerAlt, FaCar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AppointmentCard = ({ title, date, time, location, vehicle, status }: { title: string, date: string, time: string, location: string, vehicle: string, status: 'Confirmed' | 'Pending' }) => {
    const isConfirmed = status === 'Confirmed';
    return (
        <div className={`p-4 rounded-lg border-l-4 ${isConfirmed ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
            <h3 className="font-bold text-gray-800">{title}</h3>
            <div className="text-gray-600 text-sm mt-2 space-y-1">
                <p className="flex items-center gap-2"><FaCalendarDay /> {date}</p>
                <p className="flex items-center gap-2"><FaClock /> {time}</p>
                <p className="flex items-center gap-2"><FaMapMarkerAlt /> {location}</p>
                <p className="flex items-center gap-2"><FaCar /> {vehicle}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
                <span className={`flex items-center gap-2 text-sm font-semibold ${isConfirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isConfirmed ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {isConfirmed ? 'Confirmed' : 'Pending Confirmation'}
                </span>
                <div className="flex gap-2">
                    <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">Reschedule</button>
                    <button className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-100">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const Appointments = () => {
    const appointments = [
        { title: 'Tire Rotation & Balancing', date: 'July 28, 2023', time: '10:30 AM', location: 'Main Service Center', vehicle: 'Toyota Camry', status: 'Confirmed' },
        { title: '60,000 Mile Service', date: 'August 15, 2023', time: '2:00 PM', location: 'Downtown Branch', vehicle: 'Honda Civic', status: 'Pending' },
    ];
    
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>
            <div className="space-y-4">
                {appointments.map((appt, index) => (
                    <AppointmentCard key={index} {...appt} status={appt.status as "Confirmed" | "Pending"} />

                ))}
            </div>
        </div>
    );
};

export default Appointments;