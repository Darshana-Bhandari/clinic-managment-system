import { z } from 'zod';

const parseMultipartJson = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const optionalNumber = z.preprocess(
  (value) => (value === '' ? undefined : typeof value === 'string' ? Number(value) : value),
  z.number().positive().optional()
);

const optionalInteger = z.preprocess(
  (value) => (value === '' ? undefined : typeof value === 'string' ? Number(value) : value),
  z.number().int().positive().optional()
);

const optionalStringArray = z.preprocess(parseMultipartJson, z.array(z.string()).optional());
const optionalAvailability = z.preprocess(
  parseMultipartJson,
  z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional()
);

// Create Doctor Schema
export const createDoctorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  qualifications: optionalStringArray,
  experience: optionalInteger,
  hospital: z.string().optional(),
  department: z.string().optional(),
  consultationFee: optionalNumber,
  availableDays: optionalAvailability,
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

// Update Doctor Schema
export const updateDoctorSchema = z.object({
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  qualifications: optionalStringArray,
  experience: optionalInteger,
  hospital: z.string().optional(),
  department: z.string().optional(),
  consultationFee: optionalNumber,
  availableDays: optionalAvailability,
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  removeDocuments: z.preprocess(parseMultipartJson, z.array(z.string()).optional()),
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
