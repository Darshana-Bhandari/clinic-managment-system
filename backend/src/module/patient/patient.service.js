import prisma from '../../config/database.js';
import { MESSAGES } from '../../constans/messages.js';
import { uploadMultipleToCloudinaryFn, deleteFromCloudinaryFn, deleteMultipleFromCloudinary } from '../../config/multer.js';

// ==================== HELPERS ====================

// Maps raw body data to Prisma-compatible types for Patient model
const mapPatientData = (data) => ({
  ...data,
  allergies: Array.isArray(data.allergies) ? data.allergies : (data.allergies ?? null),
  medicalHistory: data.medicalHistory ?? null,
  dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
});

// ==================== CREATE PATIENT ====================
export const createPatient = async (patientData, files = []) => {
  const { userId, ...data } = patientData;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Check for duplicate patient profile
  const existingPatient = await prisma.patient.findUnique({ where: { userId } });
  if (existingPatient) throw new Error('Patient profile already exists for this user');

  // Upload documents to Cloudinary
  let uploadedFiles = [];
  if (files && files.length > 0) {
    uploadedFiles = await uploadMultipleToCloudinaryFn(files, 'healthcare/patients/documents');
  }

  const patient = await prisma.patient.create({
    data: {
      userId,
      ...mapPatientData(data),
      documents: uploadedFiles,
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true },
      },
    },
  });

  // Ensure user role is PATIENT
  if (user.role !== 'PATIENT') {
    await prisma.user.update({ where: { id: userId }, data: { role: 'PATIENT' } });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      resource: 'Patient',
      details: { patientId: patient.id, documentsUploaded: uploadedFiles.length },
    },
  });

  return patient;
};

// ==================== GET ALL PATIENTS ====================
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
  if (gender) where.gender = gender;
  if (bloodGroup) where.bloodGroup = bloodGroup;

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true, createdAt: true },
        },
        appointments: {
          where: { status: { in: ['SCHEDULED', 'CONFIRMED'] } },
          select: { id: true, date: true, status: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  return { patients, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

// ==================== GET PATIENT BY ID ====================
export const getPatientById = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true, createdAt: true },
      },
      appointments: {
        select: { id: true, date: true, status: true },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!patient) throw new Error('Patient not found');
  return patient;
};

// ==================== GET PATIENT BY USER ID ====================
export const getPatientByUserId = async (userId) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true, createdAt: true },
      },
      appointments: {
        select: { id: true, date: true, status: true },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!patient) throw new Error('Patient not found for this user');
  return patient;
};

// ==================== UPDATE PATIENT ====================
export const updatePatient = async (patientId, updateData, files = []) => {
  const existingPatient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!existingPatient) throw new Error('Patient not found');

  // Upload newly provided documents
  let uploadedDocuments = [];
  if (files && files.length > 0) {
    uploadedDocuments = await uploadMultipleToCloudinaryFn(files, 'healthcare/patients/documents');
  }

  // Merge with existing documents
  const existingDocuments = Array.isArray(existingPatient.documents) ? existingPatient.documents : [];
  let allDocuments = [...existingDocuments, ...uploadedDocuments];

  // Handle document removals (pass removeDocuments as comma-separated string or JSON array)
  if (updateData.removeDocuments) {
    let removeIds = updateData.removeDocuments;
    if (typeof removeIds === 'string') {
      try { removeIds = JSON.parse(removeIds); } catch { removeIds = removeIds.split(',').map((s) => s.trim()); }
    }
    allDocuments = allDocuments.filter((doc) => !removeIds.includes(doc.publicId));
    await deleteMultipleFromCloudinary(removeIds);
  }
  delete updateData.removeDocuments;

  // Only set documents if there was any change
  if (uploadedDocuments.length > 0 || updateData.removeDocuments !== undefined) {
    updateData.documents = allDocuments;
  }

  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: mapPatientData({ ...updateData, documents: allDocuments }),
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true },
      },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: patient.userId,
      action: 'UPDATE',
      resource: 'Patient',
      details: { patientId: patient.id, newDocumentsUploaded: uploadedDocuments.length },
    },
  });

  return patient;
};

// ==================== DELETE PATIENT ====================
export const deletePatient = async (patientId) => {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  // Delete all patient documents from Cloudinary
  if (Array.isArray(patient.documents) && patient.documents.length > 0) {
    const publicIds = patient.documents.map((d) => d.publicId).filter(Boolean);
    await deleteMultipleFromCloudinary(publicIds);
  }

  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { patientId } }),
    prisma.patient.delete({ where: { id: patientId } }),
  ]);

  await prisma.auditLog.create({
    data: {
      userId: patient.userId,
      action: 'DELETE',
      resource: 'Patient',
      details: { patientId },
    },
  });

  return { message: 'Patient deleted successfully' };
};

// ==================== GET PATIENT STATISTICS ====================
export const getPatientStatistics = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        select: { id: true, date: true, status: true },
      },
    },
  });

  if (!patient) throw new Error('Patient not found');

  const totalAppointments = patient.appointments.length;
  const completedAppointments = patient.appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledAppointments = patient.appointments.filter((a) => a.status === 'CANCELLED').length;
  const upcomingAppointments = patient.appointments.filter(
    (a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status) && new Date(a.date) > new Date()
  ).length;

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    upcomingAppointments,
    recentAppointments: patient.appointments.slice(0, 5),
  };
};