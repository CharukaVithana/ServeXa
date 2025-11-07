import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import appointmentService from '../../services/appointmentService';
import { adminService } from '../../services/adminService';
import type { PendingUser } from '../../services/adminService';

interface Appointment {
  id: string;
  customerId: number;
  fullName: string;
  phoneNumber: string;
  vehicleType: string;
  serviceType: string;
  bookingDateTime: string;
  additionalNote?: string;
  paymentMethod: string;
  duration: number;
  status: string;
  isAssigned?: boolean;
  assignedEmployeeId?: number;
  employeeId?: number;
  employeeName?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [approvedEmployees, setApprovedEmployees] = useState<PendingUser[]>([]);
  const [assigningAppointment, setAssigningAppointment] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
    fetchApprovedEmployees();
  }, [currentPage, statusFilter]);

  const fetchApprovedEmployees = async () => {
    try {
      const employees = await adminService.getApprovedEmployees();
      setApprovedEmployees(employees);
    } catch (error) {
      console.error('Error fetching approved employees:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch appointments from API
      try {
        const response = await appointmentService.getAllAppointments(currentPage, 10, statusFilter);
        
        let filteredAppointments = response.content || [];
        
        // Filter by search term
        if (searchTerm) {
          filteredAppointments = filteredAppointments.filter(apt =>
            apt.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setAppointments(filteredAppointments);
        setTotalPages(response.totalPages || 0);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        // Use mock data as fallback
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            customerId: 1,
            fullName: 'John Doe',
            phoneNumber: '+1234567890',
            vehicleType: 'Toyota Camry 2020',
            serviceType: 'Oil Change',
            bookingDateTime: '2024-01-25T09:00:00Z',
            paymentMethod: 'CASH',
            duration: 60,
            status: 'PENDING',
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            customerId: 2,
            fullName: 'Jane Smith',
            phoneNumber: '+1234567891',
            vehicleType: 'Honda Civic 2019',
            serviceType: 'Brake Service',
            bookingDateTime: '2024-01-25T10:30:00Z',
            paymentMethod: 'CARD',
            duration: 90,
            status: 'CONFIRMED',
            createdAt: '2024-01-19T14:00:00Z',
            updatedAt: '2024-01-19T14:00:00Z'
          },
        ];
        
        let filtered = mockAppointments;
        if (statusFilter !== 'ALL') {
          filtered = mockAppointments.filter(apt => apt.status === statusFilter);
        }
        
        if (searchTerm) {
          filtered = filtered.filter(apt =>
            apt.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setAppointments(filtered);
        setTotalPages(Math.ceil(filtered.length / 10));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      
      // Optionally refresh data
      fetchAppointments();
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment status');
    }
  };

  const handleAssignEmployee = async (appointmentId: string, employeeId: string) => {
    if (!employeeId) return;
    
    try {
      setAssigningAppointment(appointmentId);
      await appointmentService.assignEmployee(appointmentId, employeeId);
      await fetchAppointments(); // Refresh the appointments
    } catch (err: any) {
      console.error('Error assigning employee:', err);
      setError(err.message || 'Failed to assign employee');
    } finally {
      setAssigningAppointment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D72638] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 h-full overflow-y-auto p-8 ml-64">
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-[#D72638]" />
              Appointments Management
            </h1>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by customer, vehicle, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D72638]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D72638]"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

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

          {/* Appointments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User size={20} className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {appointment.phoneNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Car size={20} className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {appointment.vehicleType}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.serviceType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(appointment.bookingDateTime).toLocaleDateString()}
                            </span>
                            <Clock size={16} className="text-gray-400 ml-2" />
                            <span className="text-sm text-gray-900">
                              {new Date(appointment.bookingDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {appointment.status === 'CREATED' && !appointment.isAssigned ? (
                            <select
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D72638]"
                              onChange={(e) => handleAssignEmployee(appointment.id, e.target.value)}
                              disabled={assigningAppointment === appointment.id}
                              defaultValue=""
                            >
                              <option value="" disabled>Select Employee</option>
                              {approvedEmployees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.fullName}
                                </option>
                              ))}
                            </select>
                          ) : appointment.assignedEmployeeId ? (
                            <div className="text-sm text-gray-900">
                              {approvedEmployees.find(e => e.id === appointment.assignedEmployeeId?.toString())?.fullName || `Employee #${appointment.assignedEmployeeId}`}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage + 1}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;