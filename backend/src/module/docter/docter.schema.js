import { z } from 'zod';

// Create Doctor Schema
export const createDoctorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  experience: z.number().int().positive().optional(),
  hospital: z.string().optional(),
  department: z.string().optional(),
  consultationFee: z.number().positive().optional(),
  availableDays: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

// Update Doctor Schema
export const updateDoctorSchema = z.object({
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  experience: z.number().int().positive().optional(),
  hospital: z.string().optional(),
  department: z.string().optional(),
  consultationFee: z.number().positive().optional(),
  availableDays: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
}).partial();

// Get Doctors Query Schema
export const getDoctorsQuerySchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  minRating: z.string().optional().transform(Number),
});

export const doctorIdSchema = z.object({
  id: z.string().min(1, 'Doctor ID is required'),
});

// Rate Doctor Schema
export const rateDoctorSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  review: z.string().max(500, 'Review cannot exceed 500 characters').optional(),
});

// Validation middleware
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};