import type { LoginCredentials, SignupData, AuthResponse, ResetPasswordData, User } from '../types/auth';
import { SERVICE_ENDPOINTS, API_PATHS, getApiUrl } from '../config/services';

// For backward compatibility, check if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL || `${SERVICE_ENDPOINTS.auth}/api`;

class AuthService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.validationErrors) {
          const errors = Object.entries(errorData.validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errors;
        } else {
          // Check for different error response formats
          errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`;
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<any>(response);

    //Extract the actual user data inside the `data` wrapper
    const data = result.data;

    //Store the access token locally for future API calls
    if (data?.accessToken) {
      this.setStoredToken(data.accessToken);
    }

    return data;
  }


  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await this.handleResponse<any>(response);
    // Extract the actual response from the Spring Boot ApiResponse wrapper
    return result.data || result;
  }

  async logout(): Promise<void> {
    try {
      // Get the current user ID from stored token or context
      const token = this.getStoredToken();
      let userId = '';
      
      // Try to extract userId from token if available
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || '';
        } catch (e) {
          // Invalid token format
        }
      }

      const url = userId 
        ? `${API_BASE_URL}/auth/logout?userId=${userId}`
        : `${API_BASE_URL}/auth/logout`;

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        console.warn('Logout request failed, but continuing with local logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    }
    
    // Always clear local storage
    this.removeStoredToken();
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        this.removeStoredToken();
        return null;
      }
      
      const result = await this.handleResponse<any>(response);
      const authData = result.data;
      
      if (!authData || !authData.userId) {
        return null;
      }
      
      // Transform AuthResponse to User object
      const user: User = {
        id: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        phoneNumber: authData.phoneNumber || undefined,
        address: authData.address || undefined,
        profilePictureUrl: authData.imageUrl || undefined,
        role: authData.role.toLowerCase() as "customer" | "employee" | "admin",
        vehicles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Update the stored token if a new one is provided
      if (authData.accessToken) {
        this.setStoredToken(authData.accessToken);
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateProfile(profileData: { fullName: string; phoneNumber: string; address: string }): Promise<User> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const result = await this.handleResponse<any>(response);
    const authData = result.data;
    
    // Transform the response to User object
    const user: User = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      phoneNumber: authData.phoneNumber || undefined,
      address: authData.address || undefined,
      profilePictureUrl: authData.imageUrl || undefined,
      role: authData.role.toLowerCase() as "customer" | "employee" | "admin",
      vehicles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return user;
  }

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async loginWithFacebook(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setStoredToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  removeStoredToken(): void {
    localStorage.removeItem('authToken');
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


export default new AuthService();