import type { LoginCredentials, SignupData, AuthResponse, ResetPasswordData, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

class AuthService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.status === 401) {
        return null;
      }
      const result = await this.handleResponse<any>(response);
      const data = result.data || null;
      if (!data) return null;

      // Map AuthResponse -> User
      const user: User = {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: (data.role || 'CUSTOMER').toLowerCase() as any,
        phoneNumber: data.phoneNumber || undefined,
        address: data.address || undefined,
        profilePictureUrl: data.profilePictureUrl || null,
        vehicles: data.vehicles || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return user;
    } catch (error) {
      return null;
    }
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