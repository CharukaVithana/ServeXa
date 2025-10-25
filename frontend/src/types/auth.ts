export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  vehicles?: Vehicle[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  clearError: () => void;
  updateUser: (data: Partial<User>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicleData: Omit<Vehicle, 'id'>) => void;
  removeVehicle: (id: string) => void;
}

export type AuthFormErrors = {
  [key: string]: string | undefined;
};
export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  year: string;
  color?: string;
  imageUrl?: string;
}