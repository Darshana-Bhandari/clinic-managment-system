import { z } from 'zod';

// ==================== MEDICAL RECORD SCHEMAS ====================

export const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentId: z.string().optional(),
  diagnosis: z.string().optional(),
  diagnosisDate: z.string().datetime().optional(),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().optional(),
  diagnosisDate: z.string().datetime().optional(),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// ==================== PRESCRIPTION SCHEMAS ====================

export const createPrescriptionSchema = z.object({
  medicalRecordId: z.string().min(1, 'Medical record ID is required'),
  medication: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  refills: z.number().int().min(0).default(0),
});

export const updatePrescriptionSchema = z.object({
  medication: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  refills: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED']).optional(),
});

// ==================== REPORT SCHEMAS ====================

export const createReportSchema = z.object({
  medicalRecordId: z.string().min(1, 'Medical record ID is required'),
  name: z.string().min(1, 'Report name is required'),
  type: z.enum(['LAB_REPORT', 'X_RAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'BLOOD_TEST', 'URINE_TEST', 'ECG', 'OTHER']),
  date: z.string().datetime().optional(),
  result: z.string().optional(),
  fileUrl: z.string().url().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const updateReportSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['LAB_REPORT', 'X_RAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'BLOOD_TEST', 'URINE_TEST', 'ECG', 'OTHER']).optional(),
  date: z.string().datetime().optional(),
  result: z.string().optional(),
  fileUrl: z.string().url().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
});

// ==================== QUERY SCHEMAS ====================

export const getMedicalRecordsQuerySchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().optional(),
});
