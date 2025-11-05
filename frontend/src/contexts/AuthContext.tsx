import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import vehicleService from '../services/vehicleService';
import customerService from '../services/customerService';
import type { AuthContextType, AuthState, LoginCredentials, SignupData, ResetPasswordData, User,Vehicle} from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Helper function to get customer ID from user email
  const getCustomerId = useCallback(async (userEmail: string, userId: string): Promise<number | null> => {
    try {
      // First try to get customer by email
      const customerId = await customerService.getCustomerIdByEmail(userEmail);
      if (customerId) {
        return customerId;
      }
      
      // Fallback: try to parse userId as number (if userId is the customer ID)
      const parsedId = parseInt(userId);
      if (!isNaN(parsedId)) {
        return parsedId;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting customer ID:', error);
      return null;
    }
  }, []);

  // Fetch vehicles for a user
  const fetchVehicles = useCallback(async (customerId: number) => {
    try {
      const vehicles = await vehicleService.getVehiclesByCustomerId(customerId);
      setState(prevState => {
        if (!prevState.user) return prevState;
        return {
          ...prevState,
          user: { ...prevState.user, vehicles },
        };
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Don't throw error, just log it - user can still use the app
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Fetch vehicles for the user
          // Note: We need customerId - for now we'll try to get it from user.id
          // In production, you should have a proper mapping
          const customerId = await getCustomerId(user.email, user.id);
          if (customerId) {
            await fetchVehicles(customerId);
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, [getCustomerId, fetchVehicles]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(credentials);
      
      authService.setStoredToken(response.accessToken);
      
      const user: User = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role.toLowerCase() as "customer" | "employee" | "admin",
        vehicles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Fetch vehicles for the customer
      if (user.role === 'customer') {
        const customerId = await getCustomerId(user.email, user.id);
        if (customerId) {
          await fetchVehicles(customerId);
        }
      }
      
      navigate('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, [navigate, getCustomerId, fetchVehicles]);

  const signup = useCallback(async (data: SignupData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.signup(data);
      
      authService.setStoredToken(response.accessToken);
      
      setState({
       user: {
  id: response.userId,
  email: response.email,
  fullName: response.fullName,
  role: response.role.toLowerCase() as "customer" | "employee" | "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
},

        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      navigate('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Logout will handle errors internally and always clear tokens
      await authService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      navigate('/login');
    } catch (error) {
      // Even if logout fails, we still clear local state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate('/login');
    }
  }, [navigate]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.requestPasswordReset(email);
      setState(prev => ({ ...prev, isLoading: false }));
      navigate('/reset-password/new');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send reset email',
      }));
      throw error;
    }
  }, [navigate]);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.resetPassword(data);
      setState(prev => ({ ...prev, isLoading: false }));
      navigate('/login');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      }));
      throw error;
    }
  }, [navigate]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  const updateUser = useCallback((data: Partial<User>) => {
    setState(prevState => ({
      ...prevState,
      user: prevState.user ? { ...prevState.user, ...data } : null,
    }));
  }, []);
  const addVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id'>) => {
    if (!state.user) {
      throw new Error('User not authenticated');
    }

    try {
      const customerId = await getCustomerId(state.user.email, state.user.id);
      if (!customerId) {
        throw new Error('Unable to determine customer ID');
      }

      const newVehicle = await vehicleService.addVehicle(vehicleData, customerId);
      
      setState(prevState => {
        if (!prevState.user) return prevState;
        const updatedVehicles = [...(prevState.user.vehicles || []), newVehicle];
        const updatedUser = { ...prevState.user, vehicles: updatedVehicles };
        return { ...prevState, user: updatedUser };
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }, [state.user, getCustomerId]);

  const updateVehicle = useCallback(async (id: string, vehicleData: Omit<Vehicle, 'id'>) => {
    if (!state.user) {
      throw new Error('User not authenticated');
    }

    try {
      const customerId = await getCustomerId(state.user.email, state.user.id);
      if (!customerId) {
        throw new Error('Unable to determine customer ID');
      }

      const updatedVehicle = await vehicleService.updateVehicle(id, vehicleData, customerId);
      
      setState(prevState => {
        if (!prevState.user || !prevState.user.vehicles) return prevState;
        
        const updatedVehicles = prevState.user.vehicles.map(v => 
          v.id === id ? updatedVehicle : v
        );
        
        const updatedUser = { ...prevState.user, vehicles: updatedVehicles };
        return { ...prevState, user: updatedUser };
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }, [state.user, getCustomerId]);

  const removeVehicle = useCallback(async (id: string) => {
    if (!state.user) {
      throw new Error('User not authenticated');
    }

    try {
      await vehicleService.deleteVehicle(id);
      
      setState(prevState => {
        if (!prevState.user || !prevState.user.vehicles) return prevState;
        
        const updatedVehicles = prevState.user.vehicles.filter(v => v.id !== id);
        
        const updatedUser = { ...prevState.user, vehicles: updatedVehicles };
        return { ...prevState, user: updatedUser };
      });
    } catch (error) {
      console.error('Error removing vehicle:', error);
      throw error;
    }
  }, [state.user]);
  const updateProfilePicture = useCallback((imageUrl: string | null) => {
    setState(prevState => {
      if (!prevState.user) return prevState;
      const updatedUser = { ...prevState.user, profilePictureUrl: imageUrl };
      return { ...prevState, user: updatedUser };
    });
   
    console.log("Updated profile picture URL:", imageUrl);
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    clearError,
    updateUser,
    addVehicle,
    updateVehicle,
    removeVehicle,
    updateProfilePicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};