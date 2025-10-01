export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value: string) => emailRegex.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= length,
    message: message || `Must be at least ${length} characters long`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= length,
    message: message || `Must be no more than ${length} characters long`,
  }),

  password: (message = 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number'): ValidationRule => ({
    validate: (value: string) => passwordRegex.test(value),
    message,
  }),

  match: (fieldToMatch: string, fieldLabel = 'field'): ValidationRule => ({
    validate: (value: any, allValues: any) => value === allValues[fieldToMatch],
    message: `Must match ${fieldLabel}`,
  }),
};

export function validateField(value: any, rules: ValidationRule[], allValues?: any): string | undefined {
  for (const rule of rules) {
    if (!rule.validate(value, allValues)) {
      return rule.message;
    }
  }
  return undefined;
}

export function validateForm<T extends Record<string, any>>(
  values: T,
  rulesMap: Record<keyof T, ValidationRule[]>
): Partial<T> {
  const errors: Partial<T> = {};
  
  for (const field in rulesMap) {
    const rules = rulesMap[field];
    const error = validateField(values[field], rules, values);
    if (error) {
      (errors as any)[field] = error;
    }
  }
  
  return errors;
}

export const authValidation = {
  login: {
    email: [
      validationRules.required('Email is required'),
      validationRules.email(),
    ],
    password: [
      validationRules.required('Password is required'),
    ],
  },
  
  signup: {
    fullName: [
      validationRules.required('Full name is required'),
      validationRules.minLength(2, 'Name must be at least 2 characters'),
      validationRules.maxLength(50, 'Name must be less than 50 characters'),
    ],
    email: [
      validationRules.required('Email is required'),
      validationRules.email(),
    ],
    password: [
      validationRules.required('Password is required'),
      validationRules.password(),
    ],
  },
  
  resetPasswordRequest: {
    email: [
      validationRules.required('Email is required'),
      validationRules.email(),
    ],
  },
  
  resetPassword: {
    newPassword: [
      validationRules.required('Password is required'),
      validationRules.password(),
    ],
    confirmPassword: [
      validationRules.required('Please confirm your password'),
      validationRules.match('newPassword', 'password'),
    ],
  },
};