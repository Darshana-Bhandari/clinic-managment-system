import prisma from '../../config/database.js';
import { uploadToCloudinarySingle, deleteFromCloudinaryFn } from '../../config/multer.js';

// ==================== MEDICAL RECORDS ====================

export const createMedicalRecord = async (recordData) => {
  const { patientId, doctorId, appointmentId, ...data } = recordData;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('patient not found');

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw new Error('doctor not found');

  if (appointmentId) {
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new Error('appointment not found');
  }

  return await prisma.medicalRecord.create({
    data: {
      patientId,
      doctorId,
      appointmentId: appointmentId || undefined,
      symptoms: data.symptoms || [],
      ...data,
    },
    include: {
      patient: { include: { user: { select: { fullName: true, email: true } } } },
      doctor: { include: { user: { select: { fullName: true } } } },
    },
  });
};

export const getAllMedicalRecords = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.doctorId) where.doctorId = filters.doctorId;
  if (filters.fromDate) where.diagnosisDate = { gte: new Date(filters.fromDate) };
  if (filters.toDate) where.diagnosisDate = { ...where.diagnosisDate, lte: new Date(filters.toDate) };
  if (filters.search) {
    where.OR = [
      { diagnosis: { contains: filters.search } },
      { notes: { contains: filters.search } },
      { patient: { user: { fullName: { contains: filters.search } } } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { include: { user: { select: { fullName: true, email: true } } } },
        doctor: { include: { user: { select: { fullName: true, email: true } } } },
        prescriptions: { where: { status: 'ACTIVE' } },
        reports: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.medicalRecord.count({ where }),
  ]);

  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getMedicalRecordById = async (id) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { fullName: true, email: true } } } },
      doctor: { include: { user: { select: { fullName: true } } } },
      appointment: true,
      prescriptions: true,
      reports: true,
    },
  });
  if (!record) throw new Error('medical record not found');
  return record;
};

export const updateMedicalRecordById = async (id, updateData) => {
  const existing = await prisma.medicalRecord.findUnique({ where: { id } });
  if (!existing) throw new Error('medical record not found');

  return await prisma.medicalRecord.update({ where: { id }, data: updateData });
};

export const deleteMedicalRecordById = async (id) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: { reports: true },
  });
  if (!record) throw new Error('medical record not found');

  // Delete all report files from Cloudinary
  for (const report of record.reports) {
    if (report.fileUrl) {
      try {
        const urlParts = report.fileUrl.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        await deleteFromCloudinaryFn(publicId);
      } catch (e) {
        console.error('Failed to delete report file:', e.message);
      }
    }
  }

  return await prisma.medicalRecord.delete({ where: { id } });
};

// ==================== PATIENT HISTORY ====================

export const getPatientHistory = async (patientId) => {
  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { fullName: true } } } },
      appointment: true,
      prescriptions: true,
      reports: true,
    },
  });

  if (!records || records.length === 0) throw new Error('No medical records found for this patient');
  return records;
};

export const getPatientMedicalHistory = async (patientId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: { select: { fullName: true } } } },
        prescriptions: { where: { status: 'ACTIVE' } },
        reports: { where: { status: { in: ['PENDING', 'COMPLETED'] } } },
      },
      skip,
      take: limit,
      orderBy: { diagnosisDate: 'desc' },
    }),
    prisma.medicalRecord.count({ where: { patientId } }),
  ]);

  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

// ==================== PRESCRIPTIONS ====================

export const createPrescription = async (prescriptionData) => {
  const { medicalRecordId, ...data } = prescriptionData;
  const record = await prisma.medicalRecord.findUnique({ where: { id: medicalRecordId } });
  if (!record) throw new Error('medical record not found');

  return await prisma.prescription.create({
    data: { medicalRecordId, ...data },
    include: {
      medicalRecord: {
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
        },
      },
    },
  });
};

export const getPrescriptionById = async (prescriptionId) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      medicalRecord: {
        include: {
          patient: { include: { user: { select: { fullName: true, email: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
        },
      },
    },
  });
  if (!prescription) throw new Error('prescription not found');
  return prescription;
};

export const updatePrescription = async (prescriptionId, updateData) => {
  const existing = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
  if (!existing) throw new Error('prescription not found');

  return await prisma.prescription.update({
    where: { id: prescriptionId },
    data: updateData,
    include: {
      medicalRecord: {
        include: { patient: { include: { user: { select: { fullName: true } } } } },
      },
    },
  });
};

export const prescriptiondelete = async (prescriptionId) => {
  const prescription = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
  if (!prescription) throw new Error('Prescription not found');

  await prisma.prescription.delete({ where: { id: prescriptionId } });
  return { message: 'Prescription deleted successfully' };
};

// ==================== REPORTS (with Cloudinary upload) ====================

/**
 * @param {object} reportData
 * @param {object|null} file - Multer file object (req.file) for the report document/image
 */
export const createReport = async (reportData, file = null) => {
  const { medicalRecordId, ...data } = reportData;

  // Verify medical record exists
  const record = await prisma.medicalRecord.findUnique({ where: { id: medicalRecordId } });
  if (!record) throw new Error('medical record not found');

  // Upload report file if provided
  let fileUrl = null;
  let filePublicId = null;
  if (file) {
    const uploadResult = await uploadToCloudinarySingle(file, 'healthcare/reports');
    fileUrl = uploadResult.url;
    filePublicId = uploadResult.publicId;
  }

  return await prisma.report.create({
    data: {
      medicalRecordId,
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      fileUrl,
      // Store publicId as custom field for deletion — use notes or a dedicated field
    },
    include: {
      medicalRecord: {
        include: { patient: { include: { user: { select: { fullName: true } } } } },
      },
    },
  });
};

export const getReportById = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      medicalRecord: {
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
        },
      },
    },
  });
  if (!report) throw new Error('Report not found');
  return report;
};

/**
 * @param {string} reportId
 * @param {object} updateData
 * @param {object|null} file - Multer file object for replacing the report file
 */
export const updateReport = async (reportId, updateData, file = null) => {
  const existing = await prisma.report.findUnique({ where: { id: reportId } });
  if (!existing) throw new Error('Report not found');

  // Replace report file if new file is provided
  if (file) {
    // Delete old file from Cloudinary if it exists
    if (existing.fileUrl) {
      try {
        const urlParts = existing.fileUrl.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        await deleteFromCloudinaryFn(publicId);
      } catch (e) {
        console.error('Failed to delete old report file:', e.message);
      }
    }

    const uploadResult = await uploadToCloudinarySingle(file, 'healthcare/reports');
    updateData.fileUrl = uploadResult.url;
  }

  return await prisma.report.update({ where: { id: reportId }, data: updateData });
};

export const deleteReport = async (reportId) => {
  const existing = await prisma.report.findUnique({ where: { id: reportId } });
  if (!existing) throw new Error('Report not found');

  // Delete associated file from Cloudinary
  if (existing.fileUrl) {
    try {
      const urlParts = existing.fileUrl.split('/');
      const publicIdWithExt = urlParts.slice(-2).join('/');
      const publicId = publicIdWithExt.split('.')[0];
      await deleteFromCloudinaryFn(publicId);
    } catch (e) {
      console.error('Failed to delete report file on record delete:', e.message);
    }
  }

  await prisma.report.delete({ where: { id: reportId } });
  return { message: 'Report deleted successfully' };
};