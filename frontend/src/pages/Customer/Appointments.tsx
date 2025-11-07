import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaClock, FaMapMarkerAlt, FaCar, FaCheckCircle, FaExclamationCircle, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import appointmentService from '../../services/appointmentService';
import { toast } from 'react-hot-toast';

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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch appointments when component mounts
    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);
    
    const fetchAppointments = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const customerId = parseInt(user.id);
            if (!isNaN(customerId)) {
                const data = await appointmentService.getCustomerAppointments(customerId);
                // Transform data for display
                const transformedData = data.map(appointment => ({
                    title: appointment.serviceType,
                    date: new Date(appointment.bookingDateTime).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    time: new Date(appointment.bookingDateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    location: 'Main Service Center',
                    vehicle: appointment.vehicleType,
                    status: appointment.status === 'SCHEDULED' ? 'Confirmed' : 'Pending',
                    id: appointment.id
                }));
                setAppointments(transformedData);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = () => {
        navigate('/cus-dashboard/appointments');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
                        <button
                            onClick={handleBookAppointment}
                            className="bg-[#D72638] text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <FaPlus />
                            Book Appointment
                        </button>
                    </div>

                    {/* Appointments List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                <p className="mt-2 text-gray-600">Loading appointments...</p>
                            </div>
                        ) : appointments.length > 0 ? (
                            appointments.map((appt) => (
                                <AppointmentCard 
                                    key={appt.id} 
                                    {...appt} 
                                    status={appt.status as "Confirmed" | "Pending"} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Appointments Yet</h3>
                                <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
                                <button
                                    onClick={handleBookAppointment}
                                    className="bg-[#D72638] text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <FaPlus />
                                    Book Your First Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments;