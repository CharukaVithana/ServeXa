// Service endpoints configuration
// Using 127.0.0.1 instead of localhost to avoid IPv6 resolution issues with Docker on Windows
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1";

export const SERVICE_ENDPOINTS = {
  // API Gateway (if using gateway pattern)
  gateway: `${BASE_URL}:8080`,

  // Individual services (if accessing directly)
  auth: `${BASE_URL}:8081`,
  customer: `${BASE_URL}:8082`,
  appointment: `${BASE_URL}:8083`,
  vehicle: `${BASE_URL}:8084`,
  employee: `${BASE_URL}:8083`, // Using appointment service for employee task endpoints
} as const;

// API paths
export const API_PATHS = {
  // Authentication
  signup: "/api/auth/signup",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  currentUser: "/api/auth/me",

  // Customer
  customerProfile: "/api/customers/profile",
  updateCustomer: "/api/customers",

  // Vehicles
  vehicles: "/api/vehicles",
  vehicleById: (id: string) => `/api/vehicles/${id}`,

  // Appointments
  appointments: "/api/appointments",
  appointmentById: (id: string) => `/api/appointments/${id}`,

  // Notifications
  notifications: "/api/notifications",
  markAsRead: (id: string) => `/api/notifications/${id}/read`,
} as const;

// Helper function to construct full URLs
export const getApiUrl = (
  service: keyof typeof SERVICE_ENDPOINTS,
  path: string
) => {
  return `${SERVICE_ENDPOINTS[service]}${path}`;
};
