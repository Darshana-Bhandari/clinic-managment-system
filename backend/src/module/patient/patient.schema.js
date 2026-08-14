 import { z } from "zod"



 export const createPatientSchema = z.object({
    // userId is NOT in the body — it comes from req.user.id (auth token)
    dateOfBirth: z.string().datetime({ offset: true }).optional(),
    gender: z.enum(["Male", "Female", "others"]).optional(),
    bloodGroup: z.string().optional(),
    allergies: z.union([z.string(), z.array(z.string())]).optional(),
    medicalHistory: z.any().optional(),
    emergencyContact: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional()
    }).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insuranceNumber: z.string().optional()
 })


 /// update patient schema — all fields optional, userId comes from URL param /:id
 export const updatePatientSchema = z.object({
    dateOfBirth: z.string().datetime({ offset: true }).optional(),
    gender: z.enum(["Male", "Female", "others"]).optional(),
    bloodGroup: z.string().optional(),
    allergies: z.union([z.string(), z.array(z.string())]).optional(),
    medicalHistory: z.any().optional(),
    emergencyContact: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional()
    }).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insuranceNumber: z.string().optional()
 }).partial();




 // get patients query schema
 export const getPatientQuerySchema = z.object({
    page: z.string().optional().transform(Number).default('1'),
    limit: z.string().optional().transform(Number).default("10"),
    search: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", 'OTHER']).optional(),   // FIX: was missing ()
    bloodGroup: z.string().optional()                          // FIX: was missing ()
 })

 // patient id param schema
 export const patientSchema = z.object({
    id: z.string().min(1, 'Patient ID is required')
 })