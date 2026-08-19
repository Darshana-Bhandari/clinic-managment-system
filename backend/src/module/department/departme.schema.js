import { z } from 'zod';

// Create Department Schema
export const createDepartmentSchema = z.object({
  name: z.string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  headDoctorId: z.string().optional(),
  hospital: z.string().optional(),
  phone: z.string()
    .regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number')
    .optional(),
  email: z.string()
    .email('Please enter a valid email')
    .optional(),
  location: z.string().optional(),
});

// Update Department Schema
export const updateDepartmentSchema = z.object({
  name: z.string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name cannot exceed 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  headDoctorId: z.string().optional(),
  hospital: z.string().optional(),
  phone: z.string()
    .regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number')
    .optional(),
  email: z.string()
    .email('Please enter a valid email')
    .optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Get Departments Query Schema
export const getDepartmentsQuerySchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
});

export const departmentIdSchema = z.object({
  id: z.string().min(1, 'Department ID is required'),
});