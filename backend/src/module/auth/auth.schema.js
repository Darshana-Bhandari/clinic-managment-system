import { z } from 'zod';
import { ROLES } from '../../constants/roles.js';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Registration Schema
export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email').min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase, one lowercase, one number, and one special character'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits').optional().nullable().transform(val => val || null),
  role: z.enum([ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT, ROLES.RECEPTIONIST]).optional().default(ROLES.PATIENT),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Update Profile Schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters').optional(),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits').optional().nullable().transform(val => val || null),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex, 'Password must contain at least one uppercase, one lowercase, one number, and one special character').optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, { message: 'Current password is required to change password', path: ['currentPassword'] }).refine((data) => {
  if (data.currentPassword && !data.newPassword) return false;
  return true;
}, { message: 'New password is required when changing password', path: ['newPassword'] });