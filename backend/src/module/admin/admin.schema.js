import { z } from 'zod';

export const createAdminSchema = z.object({
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
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'], {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role selected',
  }),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().max(50).optional(),
  role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export const updateUserSchema = z.object({
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

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email')
    .transform((val) => val.toLowerCase()),

  password: z.string().min(1, 'Password is required'),
});