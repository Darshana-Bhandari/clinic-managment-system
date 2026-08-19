import prisma from "../../config/database.js";
import { MESSAGES } from "../../constans/messages.js";

// ==================== CREATE DOCTOR ====================
export const createDoctor = async (doctorData) => {
  const { userId, ...data } = doctorData;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user already has a doctor profile
  const existingDoctor = await prisma.doctor.findUnique({
    where: { userId },
  });

  if (existingDoctor) {
    throw new Error('Doctor profile already exists for this user');
  }

  // Check if user is already a patient
  const existingPatient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (existingPatient) {
    throw new Error('User is already registered as a patient');
  }

  // Check if license number is unique
  if (data.licenseNumber) {
    const existingLicense = await prisma.doctor.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existingLicense) {
      throw new Error('License number already exists');
    }
  }

  // Create doctor
  const doctor = await prisma.doctor.create({
    data: {
      userId,
      ...data,
      qualifications: data.qualifications || [],
      availableDays: data.availableDays || [],
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

  // Update user role if not already DOCTOR
  if (user.role !== 'DOCTOR') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'DOCTOR' },
    });
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: userId,
      action: 'CREATE',
      description: `Doctor profile created with ID: ${doctor.id}`,
    },
  });

  return doctor;
};

// ==================== GET ALL DOCTORS ====================
export const getAllDoctors = async (page = 1, limit = 10, search = null, specialization = null, hospital = null, minRating = null) => {
  const skip = (page - 1) * limit;   // 1-1 10 = 0 2-1 *10 = 10

  const where = {};
  if (search) {
    where.OR = [
      { user: { fullName: { contains: search } } },
      { user: { email: { contains: search } } },
      { user: { phone: { contains: search } } },
      { specialization: { contains: search } },
      { hospital: { contains: search } },
    ];
  }
  if (specialization) {
    where.specialization = { contains: specialization };
  }
  if (hospital) {
    where.hospital = { contains: hospital };
  }
  if (minRating) {
    where.rating = { gte: minRating };
  }

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
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
        appointments: {
          where: {
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
            date: {
              gte: new Date(),
            },
          },
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.doctor.count({ where }),
  ]);

  return {
    doctors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== GET DOCTOR BY ID ====================
export const getDoctorById = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
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
        include: {
          patient: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  return doctor;
};

// ==================== GET DOCTOR BY USER ID ====================
export const getDoctorByUserId = async (userId) => {
  const doctor = await prisma.doctor.findUnique({
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
        include: {
          patient: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!doctor) {
    throw new Error('Doctor not found for this user');
  }

  return doctor;
};

// ==================== UPDATE DOCTOR ====================
export const updateDoctor = async (doctorId, updateData) => {
  // Check if doctor exists
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!existingDoctor) {
    throw new Error('Doctor not found');
  }

  // Check if license number is unique (if being updated)
  if (updateData.licenseNumber && updateData.licenseNumber !== existingDoctor.licenseNumber) {
    const existingLicense = await prisma.doctor.findUnique({
      where: { licenseNumber: updateData.licenseNumber },
    });

    if (existingLicense) {
      throw new Error('License number already exists');
    }
  }

  const doctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: updateData,
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
      userId: doctor.userId,
      action: 'UPDATE',
      description: `Doctor profile updated with ID: ${doctor.id}`,
    },
  });

  return doctor;
};

// ==================== DELETE DOCTOR ====================
export const deleteDoctor = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      appointments: true,
    },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Delete all related records
  await prisma.$transaction([
    prisma.appointment.deleteMany({
      where: { doctorId },
    }),
    prisma.doctor.delete({
      where: { id: doctorId },
    }),
  ]);

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: doctor.userId,
      action: 'DELETE',
      description: `Doctor profile deleted with ID: ${doctor.id}`,
    },
  });

  return { message: 'Doctor deleted successfully' };
};

// ==================== RATE DOCTOR ====================
export const rateDoctor = async (doctorId, userId, rating, review) => {
  // Check if doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Check if patient exists
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  // Check if patient has completed appointment with this doctor
  const hasCompletedAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: patient.id,
      doctorId,
      status: 'COMPLETED',
    },
  });

  if (!hasCompletedAppointment) {
    throw new Error('You can only rate doctors after a completed appointment');
  }

  // Update doctor rating
  const newTotalReviews = doctor.totalReviews + 1;
  const newRating = ((doctor.rating * doctor.totalReviews) + rating) / newTotalReviews;

  const updatedDoctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: {
      rating: newRating,
      totalReviews: newTotalReviews,
    },
    include: {
      user: {
        select: {
          fullName: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: patient.userId,
      action: 'UPDATE',
      description: `Doctor ${doctor.id} rated by patient ${patient.id} with rating ${rating}`,
    },
  });

  return updatedDoctor;
};

// ==================== GET DOCTOR STATISTICS ====================
export const getDoctorStatistics = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      appointments: true,
    },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const totalAppointments = doctor.appointments.length;
  const completedAppointments = doctor.appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledAppointments = doctor.appointments.filter(a => a.status === 'CANCELLED').length;
  const upcomingAppointments = doctor.appointments.filter(a => 
    ['SCHEDULED', 'CONFIRMED'].includes(a.status) && new Date(a.date) > new Date()
  ).length;

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    upcomingAppointments,
    rating: doctor.rating,
    totalReviews: doctor.totalReviews,
    recentAppointments: doctor.appointments.slice(0, 5),
  };
};

// ==================== GET DOCTOR AVAILABILITY ====================
export const getDoctorAvailability = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      availableDays: true,
      appointments: {
        where: {
          date: {
            gte: new Date(),
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
        select: {
          date: true,
          time: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  return {
    availableDays: doctor.availableDays,
    bookedSlots: doctor.appointments.map(apt => ({
      date: apt.date,
      time: apt.time,
    })),
  };
};