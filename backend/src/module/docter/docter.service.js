import prisma from '../../config/database.js';
import {
  uploadToCloudinarySingle,
  uploadMultipleToCloudinaryFn,
  deleteFromCloudinaryFn,
  deleteMultipleFromCloudinary,
} from '../../config/multer.js';

// ==================== CREATE DOCTOR ====================
/**
 * @param {object} doctorData
 * @param {object} files - req.files from uploadFields: { profilePicture: [], certificates: [] }
 */
export const createDoctor = async (doctorData, files = {}) => {
  const { userId, ...data } = doctorData;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const existingDoctor = await prisma.doctor.findUnique({ where: { userId } });
  if (existingDoctor) throw new Error('Doctor profile already exists for this user');

  const existingPatient = await prisma.patient.findUnique({ where: { userId } });
  if (existingPatient) throw new Error('User is already registered as a patient');

  if (data.licenseNumber) {
    const existingLicense = await prisma.doctor.findUnique({ where: { licenseNumber: data.licenseNumber } });
    if (existingLicense) throw new Error('License number already exists');
  }

  // Upload profile picture (single, from 'profilePicture' or 'avatar' field)
  let profilePictureUrl = null;
  const profileFile = files?.profilePicture?.[0] || files?.avatar?.[0];
  if (profileFile) {
    const profileResult = await uploadToCloudinarySingle(profileFile, 'healthcare/doctors/profile');
    profilePictureUrl = profileResult.url;

    // Also update the User avatar
    await prisma.user.update({ where: { id: userId }, data: { avatar: profilePictureUrl } });
  }

  // Upload certificates (multiple files from 'certificates' field)
  let uploadedCertificates = [];
  if (files?.certificates && files.certificates.length > 0) {
    uploadedCertificates = await uploadMultipleToCloudinaryFn(files.certificates, 'healthcare/doctors/certificates');
  }

  const doctor = await prisma.doctor.create({
    data: {
      userId,
      ...data,
      qualifications: data.qualifications || [],
      availableDays: data.availableDays || [],
      certificates: uploadedCertificates,
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true },
      },
    },
  });

  // Ensure user role is DOCTOR
  if (user.role !== 'DOCTOR') {
    await prisma.user.update({ where: { id: userId }, data: { role: 'DOCTOR' } });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      resource: 'Doctor',
      details: { doctorId: doctor.id, certificatesUploaded: uploadedCertificates.length },
    },
  });

  return doctor;
};

// ==================== GET ALL DOCTORS ====================
export const getAllDoctors = async (
  page = 1,
  limit = 10,
  search = null,
  specialization = null,
  hospital = null,
  minRating = null
) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search } } },
      { user: { email: { contains: search } } },
      { specialization: { contains: search } },
      { hospital: { contains: search } },
    ];
  }
  if (specialization) where.specialization = { contains: specialization };
  if (hospital) where.hospital = { contains: hospital };
  if (minRating) where.rating = { gte: minRating };

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true, createdAt: true },
        },
        department: { select: { id: true, name: true } },
        appointments: {
          where: { status: { in: ['SCHEDULED', 'CONFIRMED'] }, date: { gte: new Date() } },
          select: { id: true, date: true, status: true },
        },
      },
      skip,
      take: limit,
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.doctor.count({ where }),
  ]);

  return { doctors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

// ==================== GET DOCTOR BY ID ====================
export const getDoctorById = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true, createdAt: true },
      },
      department: { select: { id: true, name: true } },
      appointments: {
        include: { patient: { include: { user: { select: { fullName: true } } } } },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!doctor) throw new Error('Doctor not found');
  return doctor;
};

// ==================== GET DOCTOR BY USER ID ====================
export const getDoctorByUserId = async (userId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true, createdAt: true },
      },
      department: { select: { id: true, name: true } },
    },
  });

  if (!doctor) throw new Error('Doctor not found for this user');
  return doctor;
};

// ==================== UPDATE DOCTOR ====================
/**
 * @param {string} doctorId
 * @param {object} updateData
 * @param {object} files - req.files from uploadFields: { profilePicture: [], certificates: [] }
 */
export const updateDoctor = async (doctorId, updateData, files = {}) => {
  const existingDoctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!existingDoctor) throw new Error('Doctor not found');

  if (updateData.licenseNumber && updateData.licenseNumber !== existingDoctor.licenseNumber) {
    const existingLicense = await prisma.doctor.findUnique({ where: { licenseNumber: updateData.licenseNumber } });
    if (existingLicense) throw new Error('License number already exists');
  }

  // Handle profile picture upload
  const profileFile = files?.profilePicture?.[0] || files?.avatar?.[0];
  if (profileFile) {
    const profileResult = await uploadToCloudinarySingle(profileFile, 'healthcare/doctors/profile');
    // Also update the User's avatar field
    await prisma.user.update({ where: { id: existingDoctor.userId }, data: { avatar: profileResult.url } });
  }

  // Handle certificate uploads
  let uploadedCertificates = [];
  if (files?.certificates && files.certificates.length > 0) {
    uploadedCertificates = await uploadMultipleToCloudinaryFn(files.certificates, 'healthcare/doctors/certificates');
  }

  // Merge certificates
  const existingCertificates = Array.isArray(existingDoctor.certificates) ? existingDoctor.certificates : [];
  let allCertificates = [...existingCertificates, ...uploadedCertificates];

  // Handle certificate removals
  if (updateData.removeDocuments) {
    let removeIds = updateData.removeDocuments;
    if (typeof removeIds === 'string') {
      try { removeIds = JSON.parse(removeIds); } catch { removeIds = removeIds.split(',').map((s) => s.trim()); }
    }
    allCertificates = allCertificates.filter((cert) => !removeIds.includes(cert.publicId));
    await deleteMultipleFromCloudinary(removeIds);
  }
  delete updateData.removeDocuments;

  if (uploadedCertificates.length > 0 || files?.certificates) {
    updateData.certificates = allCertificates;
  }

  const doctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: updateData,
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, avatar: true },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: doctor.userId,
      action: 'UPDATE',
      resource: 'Doctor',
      details: { doctorId: doctor.id, newCertificatesUploaded: uploadedCertificates.length },
    },
  });

  return doctor;
};

// ==================== DELETE DOCTOR ====================
export const deleteDoctor = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { appointments: true },
  });

  if (!doctor) throw new Error('Doctor not found');

  // Delete all certificates from Cloudinary
  if (Array.isArray(doctor.certificates) && doctor.certificates.length > 0) {
    const publicIds = doctor.certificates.map((c) => c.publicId).filter(Boolean);
    await deleteMultipleFromCloudinary(publicIds);
  }

  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { doctorId } }),
    prisma.doctor.delete({ where: { id: doctorId } }),
  ]);

  await prisma.auditLog.create({
    data: {
      userId: doctor.userId,
      action: 'DELETE',
      resource: 'Doctor',
      details: { doctorId },
    },
  });

  return { message: 'Doctor deleted successfully' };
};

// ==================== RATE DOCTOR ====================
export const rateDoctor = async (doctorId, userId, rating, review) => {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw new Error('Doctor not found');

  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const hasCompletedAppointment = await prisma.appointment.findFirst({
    where: { patientId: patient.id, doctorId, status: 'COMPLETED' },
  });

  if (!hasCompletedAppointment) {
    throw new Error('You can only rate doctors after a completed appointment');
  }

  const newTotalReviews = doctor.totalReviews + 1;
  const newRating = (doctor.rating * doctor.totalReviews + rating) / newTotalReviews;

  const updatedDoctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: { rating: newRating, totalReviews: newTotalReviews },
    include: { user: { select: { fullName: true } } },
  });

  await prisma.auditLog.create({
    data: {
      userId: patient.userId,
      action: 'RATE',
      resource: 'Doctor',
      details: { doctorId, rating },
    },
  });

  return updatedDoctor;
};

// ==================== GET DOCTOR STATISTICS ====================
export const getDoctorStatistics = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { appointments: true },
  });

  if (!doctor) throw new Error('Doctor not found');

  const totalAppointments = doctor.appointments.length;
  const completedAppointments = doctor.appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledAppointments = doctor.appointments.filter((a) => a.status === 'CANCELLED').length;
  const upcomingAppointments = doctor.appointments.filter(
    (a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status) && new Date(a.date) > new Date()
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
        where: { date: { gte: new Date() }, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
        select: { date: true, time: true },
      },
    },
  });

  if (!doctor) throw new Error('Doctor not found');

  return {
    availableDays: doctor.availableDays,
    bookedSlots: doctor.appointments.map((apt) => ({ date: apt.date, time: apt.time })),
  };
};