export interface User {
  id: string;
  email: string;
  role: "customer" | "employee" | "admin";
  fullName: string;
  phone?: string; // ✅ add this line
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
}

export type AuthFormErrors = {
  [key: string]: string | undefined;
};