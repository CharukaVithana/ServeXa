import axios from 'axios';
import { SERVICE_ENDPOINTS } from '../config/services';

const api = axios.create({
  baseURL: `${SERVICE_ENDPOINTS.auth}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface PendingUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface PendingTask {
  id: string;
  taskName: string;
  description: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  priority: string;
}


const adminService = {
  // Get pending employee registrations
  getPendingUsers: async (): Promise<PendingUser[]> => {
    const response = await api.get('/admin/users/pending');
    // Handle ApiResponse wrapper
    return response.data.data || [];
  },

  // Get all users with pagination
  getAllUsers: async (page = 0, size = 10): Promise<PaginatedResponse<PendingUser>> => {
    const response = await api.get(`/admin/users?page=${page}&size=${size}`);
    // Handle ApiResponse wrapper
    return response.data.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string): Promise<any> => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    // Handle ApiResponse wrapper
    return response.data.data;
  },

  // Get users by status
  getUsersByStatus: async (status: string): Promise<PendingUser[]> => {
    const response = await api.get(`/admin/users/status/${status}`);
    // Handle ApiResponse wrapper
    return response.data.data || [];
  },

  // Get approved employees
  getApprovedEmployees: async (): Promise<PendingUser[]> => {
    const response = await api.get('/admin/users/status/APPROVED');
    // Filter only employees from the approved users
    const users = response.data.data || [];
    return users.filter((user: PendingUser) => user.role === 'EMPLOYEE');
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    // This would need a backend endpoint
    return {
      pendingEmployees: 0,
      pendingAdmins: 0,
      activeTasks: 0,
      totalUsers: 0,
      totalAppointments: 0,
      revenue: 0
    };
  }
};

export { adminService };