import { z } from 'zod';

// Register Validation Schema
export const registerSchema = z.object({
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters')
        .min(1, 'Full name is required'),
    
    email: z.string()
        .email('Please enter a valid email')
        .min(1, 'Email is required')
        .transform(val => val.toLowerCase().trim()),
    
    phone: z.string()
        .min(1, 'Phone number is required')
        .regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'),
    
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
            'Password must contain at least one uppercase, one lowercase, and one number'),
    
    role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'])
        .optional()
        .default('PATIENT'),
});

// Login Validation Schema
export const loginSchema = z.object({
    email: z.string()
        .email('Please enter a valid email')
        .min(1, 'Email is required')
        .transform(val => val.toLowerCase().trim()),
    
    password: z.string()
        .min(1, 'Password is required'),
});

// Verify Email Validation Schema
export const verifyEmailSchema = z.object({
    email: z.string()
        .email('Please enter a valid email')
        .min(1, 'Email is required')
        .transform(val => val.toLowerCase().trim()),
    
    otp: z.string()
        .min(1, 'OTP is required')
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d+$/, 'OTP must be numeric'),
});

// Resend Verification Validation Schema
export const resendVerificationSchema = z.object({
    email: z.string()
        .email('Please enter a valid email')
        .min(1, 'Email is required')
        .transform(val => val.toLowerCase().trim()),
});

// Forgot Password Validation Schema
export const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Please enter a valid email')
        .min(1, 'Email is required')
        .transform(val => val.toLowerCase().trim()),
});

// Reset Password Validation Schema
export const resetPasswordSchema = z.object({
    email: z.string()
        .email('Please enter a valid email')
        .min(1, 'Email is required')
        .transform(val => val.toLowerCase().trim()),
    
    otp: z.string()
        .min(1, 'OTP is required')
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d+$/, 'OTP must be numeric'),
    
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
            'Password must contain at least one uppercase, one lowercase, and one number'),
    
    confirmPassword: z.string()
        .min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Change Password Validation Schema
export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required'),
    
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
            'Password must contain at least one uppercase, one lowercase, and one number'),
    
    confirmPassword: z.string()
        .min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Update Profile Validation Schema
export const updateProfileSchema = z.object({
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters')
        .optional(),
    
    phoneNumber: z.string()
        .regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number')
        .optional(),
}).partial();

// Update Role Validation Schema
export const updateRoleSchema = z.object({
    role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'], {
        required_error: 'Role is required',
        invalid_type_error: 'Invalid role selected',
    }),
});