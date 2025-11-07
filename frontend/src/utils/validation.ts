export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export interface ValidationRule {
  validate: (value: any, allValues?: any) => boolean;
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
  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value: string) => {
       
        if (!value) return true; 
        return /^[+]?[0-9]{10,15}$/.test(value);
    },
    message,
  }),
  number: (message = 'Must be a valid number'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return false;
      return !isNaN(Number(value));
    },
    message,
  }),
  minValue: (min: number, message?: string): ValidationRule => ({
    validate: (value: string | number) => {
      const num = typeof value === 'string' ? Number(value) : value;
      return !isNaN(num) && num >= min;
    },
    message: message || `Must be at least ${min}`,
  }),
  maxValue: (max: number, message?: string): ValidationRule => ({
    validate: (value: string | number) => {
      const num = typeof value === 'string' ? Number(value) : value;
      return !isNaN(num) && num <= max;
    },
    message: message || `Must be no more than ${max}`,
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
  rulesMap: Partial<Record<keyof T, ValidationRule[]>>
): Partial<T> {
  const errors: Partial<T> = {};
  
  for (const field in rulesMap) {
    const rules = rulesMap[field];
    if (rules) {
      const error = validateField(values[field], rules, values);
      if (error) {
        (errors as any)[field] = error;
      }
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

  profile: {
      phoneNumber: [
          validationRules.phone('Please enter a valid phone number (e.g., +1234567890)'),
      ],

      address: [
          validationRules.minLength(10, 'Address must be at least 10 characters long'),
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

  vehicle: {
    registrationNumber: [
      validationRules.required('Registration number is required'),
    ],
    make: [
      validationRules.required('Make is required'),
    ],
    model: [
      validationRules.required('Model is required'),
    ],
    year: [
      validationRules.required('Year is required'),
      validationRules.number('Year must be a valid number'),
      validationRules.minValue(1900, 'Year must be after 1900'),
      validationRules.maxValue(2100, 'Year must be before 2100'),
    ],
  },
};