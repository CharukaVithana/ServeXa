import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
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
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(credentials);
      
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
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, [navigate]);

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
  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id'>) => {
    setState(prevState => {
      if (!prevState.user) return prevState;
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: `v${Date.now()}`, // Create a simple unique ID
      };
      const updatedVehicles = [...(prevState.user.vehicles || []), newVehicle];
      const updatedUser = { ...prevState.user, vehicles: updatedVehicles };
      return { ...prevState, user: updatedUser };
    });
  }, []);
  const updateVehicle = useCallback((id: string, vehicleData: Omit<Vehicle, 'id'>) => {
    setState(prevState => {
      if (!prevState.user || !prevState.user.vehicles) return prevState;
      
      const updatedVehicles = prevState.user.vehicles.map(v => 
        v.id === id ? { ...v, ...vehicleData } : v
      );
      
      const updatedUser = { ...prevState.user, vehicles: updatedVehicles };
      return { ...prevState, user: updatedUser };
    });
  }, []);

  const removeVehicle = useCallback((id: string) => {
    setState(prevState => {
      if (!prevState.user || !prevState.user.vehicles) return prevState;
      
      const updatedVehicles = prevState.user.vehicles.filter(v => v.id !== id);
      
      const updatedUser = { ...prevState.user, vehicles: updatedVehicles };
      return { ...prevState, user: updatedUser };
    });
  }, []);
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