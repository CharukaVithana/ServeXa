export interface User {
  id: string;
  email: string;
  role: "customer" | "employee" | "admin";
  fullName: string;
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string | null;
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
  role?: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
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
  phoneNumber?: string;
  address?: string;
  imageUrl?: string;
  isEmailVerified?: boolean;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
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
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicleData: Omit<Vehicle, 'id'>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  updateProfilePicture: (imageUrl: string | null) => void;
}

export type AuthFormErrors = {
  [key: string]: string | undefined;
};
export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  color?: string;
  imageUrl?: string;
}