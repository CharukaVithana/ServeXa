import axios from "axios";
import { getApiUrl, API_PATHS } from "../config/services";
import authService from "./authService";

interface AppointmentRequest {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  vehicleId: string;
  vehicleType?: string;
  serviceType: string;
  bookingDateTime: string;
  additionalNote?: string;
  paymentMethod: string;
  duration: number;
}

interface AppointmentResponse {
  id: string;
  customerId: string;
  fullName: string;
  phoneNumber: string;
  vehicleId: string;
  vehicleType?: string; // For backward compatibility
  serviceType: string;
  bookingDateTime: string;
  additionalNote?: string;
  paymentMethod: string;
  duration: number;
  status: string;
  employeeId?: number;
  employeeName?: string;
  createdAt: string;
  updatedAt: string;
}

class AppointmentService {
  private getAuthHeaders() {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }

  async createAppointment(
    appointmentData: Omit<AppointmentRequest, "customerId" | "duration">
  ): Promise<AppointmentResponse> {
    try {
      // Get current user to get customerId
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Use user.id directly as customerId (it's already a string UUID)
      const customerId = user.id;
      if (!customerId) {
        throw new Error("Invalid customer ID");
      }

      // Validate and parse the booking date/time
      const dateTime = new Date(appointmentData.bookingDateTime);

      // Check if the date is valid
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date/time format");
      }

      // Check if the date is in the future
      if (dateTime <= new Date()) {
        throw new Error("Appointment date must be in the future");
      }

      const bookingDateTime = dateTime.toISOString();

      const request: AppointmentRequest = {
        ...appointmentData,
        customerId,
        bookingDateTime,
        duration: 60, // Default duration in minutes
      };

      console.log(
        "Sending appointment request to:",
        getApiUrl("appointment", API_PATHS.appointments)
      );
      console.log("Request data:", request);
      console.log("Auth headers:", this.getAuthHeaders());

      const response = await axios.post(
        getApiUrl("appointment", API_PATHS.appointments),
        request,
        this.getAuthHeaders()
      );

      return response.data.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        console.error(
          "Validation errors:",
          error.response?.data?.validationErrors
        );

        // If there are validation errors, format them nicely
        if (error.response?.data?.validationErrors) {
          const validationErrors = error.response.data.validationErrors;
          const errorMessages = Object.entries(validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(", ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }

        throw new Error(
          error.response?.data?.message || "Failed to create appointment"
        );
      }
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<AppointmentResponse> {
    try {
      const response = await axios.get(
        getApiUrl("appointment", API_PATHS.appointmentById(id)),
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching appointment:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch appointment"
        );
      }
      throw error;
    }
  }

  async getCustomerAppointments(
    customerId: string
  ): Promise<AppointmentResponse[]> {
    try {
      const response = await axios.get(
        getApiUrl("appointment", `/api/appointments/customer/${customerId}`),
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch appointments"
        );
      }
      throw error;
    }
  }

  async updateAppointmentStatus(
    id: string,
    status: string
  ): Promise<AppointmentResponse> {
    try {
      const response = await axios.put(
        getApiUrl("appointment", `/api/appointments/${id}/status`),
        null,
        {
          ...this.getAuthHeaders(),
          params: { status },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to update appointment status"
        );
      }
      throw error;
    }
  }

  async getAllAppointments(
    page = 0,
    size = 10,
    status?: string
  ): Promise<{
    content: AppointmentResponse[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (status && status !== "ALL") {
        params.append("status", status);
      }

      const url = params.toString()
        ? getApiUrl("appointment", `/api/appointments?${params}`)
        : getApiUrl("appointment", "/api/appointments");

      const response = await axios.get(url, this.getAuthHeaders());

      // The backend returns a list, not paginated data, so we need to handle it
      const appointments = response.data.data || [];

      // Convert to paginated format for compatibility
      return {
        content: appointments,
        totalPages: Math.ceil(appointments.length / size),
        totalElements: appointments.length,
        number: page,
        size: size,
      };
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch appointments"
        );
      }
      throw error;
    }
  }

  async assignEmployee(
    appointmentId: string,
    employeeId: string
  ): Promise<AppointmentResponse> {
    try {
      const response = await axios.put(
        getApiUrl("appointment", `/api/appointments/${appointmentId}/assign`),
        null,
        {
          ...this.getAuthHeaders(),
          params: { employeeId },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error assigning employee:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to assign employee"
        );
      }
      throw error;
    }
  }

  async getCustomerStatistics(customerId: string): Promise<{
    activeServices: number;
    totalVehicles: number;
    pastServices: number;
    upcomingAppointments: number;
    totalSpent: number;
    averageRating: number;
    totalServices: number;
  }> {
    try {
      const response = await axios.get(
        getApiUrl("appointment", `/api/appointments/statistics/customer/${customerId}`),
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer statistics:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch customer statistics"
        );
      }
      throw error;
    }
  }
}

const appointmentService = new AppointmentService();
export default appointmentService;
