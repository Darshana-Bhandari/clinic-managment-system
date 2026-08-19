import prisma from "../../config/database.js";
import { MESSAGES } from "../../constans/messages.js";

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
export const createPatient = async (patientData) => {
  const { userId, ...data } = patientData;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
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
export const updatePatient = async (patientId, updateData) => {
  // Check if patient exists
  const existingPatient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!existingPatient) {
    throw new Error('Patient not found');
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