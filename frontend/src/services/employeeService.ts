import axios from "axios";
import { SERVICE_ENDPOINTS } from "../config/services";

const API_URL = SERVICE_ENDPOINTS.appointment;

// Add auth header to requests
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No token found in localStorage");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get current user ID from token
const getCurrentUserId = (): string => {
  const user = localStorage.getItem("user");
  if (!user) {
    console.warn("No user data found in localStorage");
    return "";
  }
  try {
    const userData = JSON.parse(user);
    console.log("Current user data:", userData);
    return userData.id || userData.userId || "";
  } catch (e) {
    console.error("Error parsing user data:", e);
    return "";
  }
};

export interface Task {
  id: string;
  taskNumber: string;
  title?: string;
  description?: string;
  customerName: string;
  vehicleModel: string;
  serviceType: string;
  status: "ASSIGNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  duration?: number;
  estimatedDuration: string;
  dueTime: string;
  isUrgent: boolean;
  completionTime?: string;
  startTime?: string;
  employeeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskStatusUpdateRequest {
  status: "ONGOING" | "COMPLETED";
  duration?: number;
}

// Appointment response from backend
interface AppointmentResponse {
  id: string;
  customerId: number;
  fullName: string;
  phoneNumber: string;
  vehicleType: string;
  serviceType: string;
  bookingDateTime: string;
  additionalNote?: string;
  paymentMethod: string;
  status: string;
  isAssigned: boolean;
  assignedEmployeeId?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

// Map appointment to task
const mapAppointmentToTask = (appointment: AppointmentResponse): Task => {

  return {
    id: appointment.id,
    taskNumber: `TASK-${appointment.id.substring(0, 8).toUpperCase()}`,
    title: appointment.serviceType,
    description: appointment.additionalNote,
    customerName: appointment.fullName,
    vehicleModel: appointment.vehicleType,
    serviceType: appointment.serviceType,
    status: mapAppointmentStatusToTaskStatus(appointment.status),
    duration: appointment.duration,
    estimatedDuration: "2 hours", // Default, can be calculated based on service type
    dueTime: appointment.bookingDateTime,
    isUrgent: false, // Can be determined based on booking time
    employeeId: appointment.assignedEmployeeId,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
};

// Map appointment status to task status
const mapAppointmentStatusToTaskStatus = (
  status: string
): "ASSIGNED" | "ONGOING" | "COMPLETED" | "CANCELLED" => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "SCHEDULED":
      return "ASSIGNED";
    case "IN_PROGRESS":
    case "INPROGRESS":
      return "ONGOING";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "ASSIGNED";
  }
};

// Map task status to appointment status
const mapTaskStatusToAppointmentStatus = (
  status: "ASSIGNED" | "ONGOING" | "COMPLETED"
): string => {
  switch (status) {
    case "ASSIGNED":
      return "CONFIRMED";
    case "ONGOING":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    default:
      return "CONFIRMED";
  }
};

class EmployeeService {
  // Get all appointments assigned to current employee
  async getAllTasks(): Promise<Task[]> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error("No user ID found");
        return [];
      }

      console.log("Fetching appointments for employee:", userId);

      // Fetch all appointments and filter by assignedEmployeeId on the client side
      const response = await axios.get(`${API_URL}/api/appointments`, {
        headers: getAuthHeaders(),
      });

      console.log("Appointments response:", response.data);

      const appointments: AppointmentResponse[] = response.data.data || [];

      // Filter appointments assigned to current user
      const myAppointments = appointments.filter(
        (appointment) => appointment.assignedEmployeeId === userId
      );

      console.log(
        `Found ${myAppointments.length} appointments assigned to user ${userId}`
      );

      return myAppointments.map(mapAppointmentToTask);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  }

  // Get pending tasks (CONFIRMED/SCHEDULED status)
  async getPendingTasks(): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter((task) => task.status === "ASSIGNED");
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      throw error;
    }
  }

  // Get ongoing tasks (IN_PROGRESS status)
  async getOngoingTasks(): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter((task) => task.status === "ONGOING");
    } catch (error) {
      console.error("Error fetching ongoing tasks:", error);
      throw error;
    }
  }

  // Get completed tasks
  async getCompletedTasks(): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter((task) => task.status === "COMPLETED");
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      throw error;
    }
  }

  // Get rejected/cancelled tasks
  async getRejectedTasks(): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter((task) => task.status === "CANCELLED");
    } catch (error) {
      console.error("Error fetching rejected tasks:", error);
      throw error;
    }
  }

  // Start a task (update appointment status to IN_PROGRESS)
  async startTask(taskId: string): Promise<Task> {
    try {
      const response = await axios.put(
        `${API_URL}/api/appointments/${taskId}/status?status=IN_PROGRESS`,
        {},
        { headers: getAuthHeaders() }
      );
      return mapAppointmentToTask(response.data.data);
    } catch (error) {
      console.error("Error starting task:", error);
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(
    taskId: string,
    request: TaskStatusUpdateRequest
  ): Promise<Task> {
    try {
      const appointmentStatus = mapTaskStatusToAppointmentStatus(
        request.status
      );
      const response = await axios.put(
        `${API_URL}/api/appointments/${taskId}/status?status=${appointmentStatus}`,
        {},
        { headers: getAuthHeaders() }
      );
      return mapAppointmentToTask(response.data.data);
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  }

  // Get current employee's tasks
  async getMyTasks(): Promise<Task[]> {
    try {
      return await this.getAllTasks();
    } catch (error) {
      console.error("Error fetching my tasks:", error);
      throw error;
    }
  }

  // Get current employee's tasks by status
  async getMyTasksByStatus(
    status: "ASSIGNED" | "ONGOING" | "COMPLETED"
  ): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter((task) => task.status === status);
    } catch (error) {
      console.error("Error fetching my tasks by status:", error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(taskId: string): Promise<Task> {
    try {
      const response = await axios.get(
        `${API_URL}/api/appointments/${taskId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return mapAppointmentToTask(response.data.data);
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  }

  // Pause a task (change from IN_PROGRESS to CONFIRMED)
  async pauseTask(taskId: string): Promise<Task> {
    try {
      const response = await axios.put(
        `${API_URL}/api/appointments/${taskId}/status?status=CONFIRMED`,
        {},
        { headers: getAuthHeaders() }
      );
      return mapAppointmentToTask(response.data.data);
    } catch (error) {
      console.error("Error pausing task:", error);
      throw error;
    }
  }

  // Complete a task
  async completeTask(taskId: string): Promise<Task> {
    try {
      const response = await axios.put(
        `${API_URL}/api/appointments/${taskId}/status?status=COMPLETED`,
        {},
        { headers: getAuthHeaders() }
      );
      return mapAppointmentToTask(response.data.data);
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  }

  // Cancel a task
  async cancelTask(taskId: string): Promise<Task> {
    try {
      const response = await axios.put(
        `${API_URL}/api/appointments/${taskId}/status?status=CANCELLED`,
        {},
        { headers: getAuthHeaders() }
      );
      return mapAppointmentToTask(response.data.data);
    } catch (error) {
      console.error("Error cancelling task:", error);
      throw error;
    }
  }
}

export default new EmployeeService();
