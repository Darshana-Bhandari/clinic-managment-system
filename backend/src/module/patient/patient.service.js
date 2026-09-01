import prisma from "../../config/database.js";
import { MESSAGES } from "../../constans/messages.js";
import {uploadMultipleToCloudinaryFn, deleteFromCloudinaryFn} from "../../config/multer.js";

// Helper — maps raw body data to Prisma-compatible types for Patient model
const mapPatientData = (data) => ({
  ...data,
  // allergies is String? in schema — join array to comma-separated string
  allergies: Array.isArray(data.allergies)
    ? data.allergies.join(', ')
    : (data.allergies ?? null),
  // medicalHistory is Json? — pass as-is or null
  medicalHistory: data.medicalHistory ?? null,
  // dateOfBirth is DateTime? — convert ISO string to Date object
  dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
});

// CREATE PATIENT
export const createPatient = async (patientData, files={}) => {
  const { userId, ...data } = patientData;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }
  // upload documents to cloudinary
  let uploadedFiles = [];
  if (files && files.length > 0) {  // Check if files are provided and not empty
    uploadedFiles = await uploadMultipleToCloudinaryFn(files);
  }

  // Check if user already has a patient profile
  const existingPatient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (existingPatient) {
    throw new Error('Patient profile already exists for this user');
  }

  // Create patient — map JS types to Prisma schema types
  const patient = await prisma.patient.create({
    data: {
      userId,
      ...mapPatientData(data),
      documents:uploadedFiles,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
        },
      },
    },
  });

  // Update user role if not already PATIENT
  if (user.role !== 'PATIENT') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PATIENT' },
    });
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: userId,
      action: 'CREATE',
      description: `Patient profile created with ID: ${patient.id}`,
      documents:uploadedFiles.length
    },
  });

  return patient;
};

// GET ALL PATIENTS
export const getAllPatients = async (page = 1, limit = 10, search = null, gender = null, bloodGroup = null) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.OR = [
      { user: { fullName: { contains: search } } },
      { user: { email: { contains: search } } },
      { user: { phone: { contains: search } } },
    ];
  }
  if (gender) {
    where.gender = gender;
  }
  if (bloodGroup) {
    where.bloodGroup = bloodGroup;
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            createdAt: true,
          },
        },
        // NOTE: doctor relation removed — Doctor model not yet in schema
        appointments: {
          where: {
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
          },
          select: {
            id: true,
            date: true,
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET PATIENT BY ID
export const getPatientById = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
        },
      },
      appointments: {
        select: {
          id: true,
          date: true,
          status: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  return patient;
};

// GET PATIENT BY USER ID
export const getPatientByUserId = async (userId) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
        },
      },
      appointments: {
        select: {
          id: true,
          date: true,
          status: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!patient) {
    throw new Error('Patient not found for this user');
  }

  return patient;
};



// UPDATE PATIENT
export const updatePatient = async (patientId, updateData, files) => {
  // Check if patient exists
  const existingPatient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!existingPatient) {
    throw new Error('Patient not found');
  }
  // uploaded new documents to cloudinary 
let uploadedDocuments = [];
if(files && files.length > 0){
  uploadedDocuments = await uploadMultipleToCloudinaryFn(files,'healthcare/patients');
}
// merge existing documents with newly uploaded documents
const existingDcouments = existingPatient.documents || [];
const allDocuments = [...existingDcouments, ...uploadedDocuments]; // Merge existing and newly uploaded documents
// if documents are removed, delete them from cloudinary
if(updatedData.removeDocuments){
  const removeDocPublicIds = updatedData.removeDocuments; // Array of public IDs to remove
  const remainingDocuments = allDocuments.filter(doc => !removeDocPublicIds.includes(doc.publicId)); // Filter out documents to be removed
  // Delete documents from cloudinary
  for(const publicId of removeDocPublicIds){
    await deleteFromCloudinaryFn(publicId);
  }
  updatedData.documents = remainingDocuments; // Update documents field with remaining documents

}

  const patient = await prisma.patient.update({
    where: { id: patientId },
    // Apply same type mapping as createPatient
    data: mapPatientData(updateData),

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: patient.userId,
      action: 'UPDATE',
      description: `Patient profile updated with ID: ${patient.id}`,
      documents: patient.documents ? patient.documents.length : 0,
    },
  });

  return patient;
};

// DELETE PATIENT
export const deletePatient = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }
// delete all patient docuents from cloudinary
if(patient.documents){
  for (const doc of patient.documents){
    await deleteFromCloudinaryFn(doc.publicId);
  }
}
  // Delete related appointments then patient
  await prisma.$transaction([
    prisma.appointment.deleteMany({
      where: { patientId },
    }),
    prisma.patient.delete({
      where: { id: patientId },
    }),
  ]);

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: patient.userId,
      action: 'DELETE',
      description: `Patient profile deleted with ID: ${patient.id}`,
      documents: patient.documents ? patient.documents.length : 0,
    },
  });

  return { message: 'Patient deleted successfully' };
};

// GET PATIENT STATISTICS
export const getPatientStatistics = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        select: {
          id: true,
          date: true,
          status: true,
        },
      },
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  const totalAppointments = patient.appointments.length;
  const completedAppointments = patient.appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledAppointments = patient.appointments.filter(a => a.status === 'CANCELLED').length;
  const upcomingAppointments = patient.appointments.filter(a =>
    ['SCHEDULED', 'CONFIRMED'].includes(a.status) && new Date(a.date) > new Date()
  ).length;

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    upcomingAppointments,
    recentAppointments: patient.appointments.slice(0, 5),
  };
};