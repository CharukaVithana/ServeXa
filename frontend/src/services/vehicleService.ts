import type { Vehicle } from '../types/auth';
import { SERVICE_ENDPOINTS } from '../config/services';

const API_BASE_URL = import.meta.env.VITE_VEHICLE_API_URL || SERVICE_ENDPOINTS.vehicle;


interface VehicleResponse {
  id: number;
  make: string;
  model: string;
  registrationNumber: string;
  imageUrl: string;
  year?: number;
  color?: string;
  customerId: string;
}

interface VehicleRequest {
  make: string;
  model: string;
  registrationNumber: string;
  imageUrl?: string;
  year?: number;
  color?: string;
  customerId: string;
}

class VehicleService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data || result;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Convert backend VehicleResponse to frontend Vehicle type
   */
  private mapToVehicle(vehicle: VehicleResponse): Vehicle {
    return {
      id: vehicle.id.toString(),
      make: vehicle.make || '',
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      imageUrl: vehicle.imageUrl || '',
      year: vehicle.year ? vehicle.year.toString() : '',
      color: vehicle.color || '',
    };
  }

  /**
   * Convert frontend Vehicle to backend VehicleRequest
   */
  private mapToRequest(vehicle: Omit<Vehicle, 'id'>, customerId: string): VehicleRequest {
    return {
      make: vehicle.make,
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      imageUrl: vehicle.imageUrl || undefined,
      year: vehicle.year ? parseInt(vehicle.year, 10) : undefined,
      color: vehicle.color || undefined,
      customerId: customerId,
    };
  }

  /**
   * Get all vehicles for a customer
   */
  async getVehiclesByCustomerId(customerId: string): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/customer/${customerId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // Return empty array if no vehicles found
        }
        throw new Error(`Failed to fetch vehicles: ${response.status}`);
      }

      const vehicles: VehicleResponse[] = await this.handleResponse<VehicleResponse[]>(response);
      return vehicles.map(v => this.mapToVehicle(v));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Add a new vehicle
   */
  async addVehicle(vehicleData: Omit<Vehicle, 'id'>, customerId: string): Promise<Vehicle> {
    try {
      const request = this.mapToRequest(vehicleData, customerId);
      
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const vehicle: VehicleResponse = await this.handleResponse<VehicleResponse>(response);
      return this.mapToVehicle(vehicle);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }

  /**
   * Update an existing vehicle
   */
  async updateVehicle(vehicleId: string, vehicleData: Omit<Vehicle, 'id'>, customerId: string): Promise<Vehicle> {
    try {
      const request = this.mapToRequest(vehicleData, customerId);
      
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const vehicle: VehicleResponse = await this.handleResponse<VehicleResponse>(response);
      return this.mapToVehicle(vehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId: string, customerId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/customer/${customerId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return; // Vehicle already deleted or doesn't exist
        }
        throw new Error(`Failed to delete vehicle: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }
}

export default new VehicleService();

