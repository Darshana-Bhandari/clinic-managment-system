import { z } from 'zod';

export const createStaffSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),

  email: z
    .string()
    .email('Please enter a valid email')
    .transform((val) => val.toLowerCase().trim()),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-]{7,}$/, 'Please enter a valid phone number'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  confirmPassword: z
    .string()
    .min(1, 'Confirm password is required'),

  role: z
    .enum(['DOCTOR', 'RECEPTIONIST'], {
      required_error: 'Staff role is required',
      invalid_type_error: 'Invalid staff role',
    })
    .default('RECEPTIONIST'),

  isActive: z.boolean().optional().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updateStaffSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),

  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,}$/, 'Please enter a valid phone number')
    .optional(),

  email: z
    .string()
    .email('Please enter a valid email')
    .transform((val) => val.toLowerCase().trim())
    .optional(),

  role: z
    .enum(['DOCTOR', 'RECEPTIONIST'], {
      invalid_type_error: 'Invalid staff role',
    })
    .optional(),

  isActive: z.boolean().optional(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .optional()
    .or(z.literal('').transform(() => undefined)),
}).partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const queryStaffSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().max(50).optional(),
  role: z.enum(['DOCTOR', 'RECEPTIONIST']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export const inviteStaffSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .transform((val) => val.toLowerCase().trim()),
});