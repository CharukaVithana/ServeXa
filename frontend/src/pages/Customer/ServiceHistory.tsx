import { useEffect, useState } from 'react';
import { FaCheckCircle, FaEye } from 'react-icons/fa';
import appointmentService from '../../services/appointmentService';
import authService from '../../services/authService';
import vehicleService from '../../services/vehicleService';

const ServiceHistory = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServiceHistory();
    }, []);

    const fetchServiceHistory = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Get current user
            const user = await authService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Fetch customer appointments
            const appointments = await appointmentService.getCustomerAppointments(user.id);
            console.log('All appointments:', appointments);
            console.log('Appointment statuses:', appointments.map(a => a.status));
            
            // Fetch customer vehicles
            const vehicles = await vehicleService.getVehiclesByCustomerId(user.id);
            
            // Create a map of vehicle IDs to vehicle details
            const vehicleMap = new Map();
            vehicles.forEach(vehicle => {
                vehicleMap.set(vehicle.id, vehicle);
            });
            
            // Filter only completed appointments and format them
            const completedServices = appointments
                .filter(appointment => appointment.status === 'COMPLETED')
                .map(appointment => {
                    const vehicle = vehicleMap.get(appointment.vehicleId);
                    const vehicleDisplay = vehicle 
                        ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim()
                        : `Vehicle ${appointment.vehicleId}`;
                    
                    return {
                        id: appointment.id,
                        date: new Date(appointment.bookingDateTime).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        }),
                        vehicle: vehicleDisplay,
                        registrationNumber: vehicle?.registrationNumber || 'N/A',
                        service: appointment.serviceType,
                        status: appointment.status,
                        cost: 'N/A', // Cost might not be available in the current backend
                        employeeName: appointment.employeeName || 'N/A'
                    };
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistory(completedServices);
        } catch (error) {
            console.error('Error fetching service history:', error);
            setError('Failed to fetch service history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Service History</h2>
            
            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading service history...</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            
            {!loading && !error && history.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded">
                    <p className="text-gray-500 mb-2">No service history found</p>
                    <p className="text-gray-400 text-sm">Your completed services will appear here</p>
                </div>
            )}
            
            {!loading && !error && history.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="text-sm font-semibold text-gray-600">
                                <th className="p-4">Date</th>
                                <th className="p-4">Vehicle</th>
                                <th className="p-4">Registration</th>
                                <th className="p-4">Service Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Technician</th>
                                <th className="p-4">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="p-4">{item.date}</td>
                                    <td className="p-4">{item.vehicle}</td>
                                    <td className="p-4">{item.registrationNumber}</td>
                                    <td className="p-4">{item.service}</td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-2 text-green-600">
                                            <FaCheckCircle /> Completed
                                        </span>
                                    </td>
                                    <td className="p-4">{item.employeeName}</td>
                                    <td className="p-4">
                                        <button className="text-red-500 hover:underline flex items-center gap-1">
                                            <FaEye /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ServiceHistory;