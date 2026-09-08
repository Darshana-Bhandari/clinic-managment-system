import prisma from "../../config/database.js";
// import socketEmitter from "../../utils/socketEmitter.js";

export const bookAppointment = async (appointmentData) => {
    const { patientId, doctorId, date, time, ...data } = appointmentData;

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            user: {
                select: { fullName: true, email: true, phone: true }
            }
        }
    });

    if (!patient) {
        throw new Error("Patient not found");
    }

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
            user: {
                select: { fullName: true }
            }
        }
    });

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString("en-US", { weekday: 'long' });

    const availableDays = doctor.availableDays || [];
    const isAvailable = availableDays.some(day => day.day === dayOfWeek);

    if (!isAvailable) {
        throw new Error(`Doctor is not available on ${dayOfWeek}`);
    }

    const existingAppointment = await prisma.appointment.findFirst({
        where: {
            doctorId,
            date: appointmentDate,
            time,
            status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
    });

    if (existingAppointment) {
        throw new Error("This time slot is already booked");
    }

    const patientConflict = await prisma.appointment.findFirst({
        where: {
            patientId,
            date: appointmentDate,
            time,
            status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
    });

    if (patientConflict) {
        throw new Error("Patient already has an appointment at this time");
    }

    const appointment = await prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            date: appointmentDate,
            time,
            ...data,
            symptoms: data.symptoms || [],
            status: "SCHEDULED"
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true, phone: true }
                    }
                }
            },
            doctor: {
                include: {
                    user: {
                        select: { id: true, fullName: true }
                    }
                }
            }
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: patient.userId,
            action: 'APPOINTMENT_BOOKED',
            resource: 'Appointment',
            details: {
                appointmentId: appointment.id,
                doctorId,
                date: appointmentDate,
                time
            },
        },
    });

    await socketEmitter.emitBookingCreated(appointment);
    await socketEmitter.emitAppointmentSlotsChanged(doctorId, appointmentDate, []);

    return appointment;
};

export const getAllAppointments = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.doctorId) where.doctorId = filters.doctorId;
  if (filters.startDate) where.date = { ...where.date, gte: new Date(filters.startDate) };
  if (filters.endDate) where.date = { ...where.date, lte: new Date(filters.endDate) };

  if (filters.search) {
    where.OR = [
      { patient: { user: { fullName: { contains: filters.search } } } },
      { doctor: { user: { fullName: { contains: filters.search } } } },
      { patient: { user: { email: { contains: filters.search } } } },
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
        doctor: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
      },
      skip,
      take: Number(limit),
      orderBy: { date: "desc" },
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAppointmentById = async (appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
      doctor: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
    },
  });

  if (!appointment) throw new Error('Appointment not found');
  return appointment;
};

export const updateAppointment = async (appointmentId, updateData) => {
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existingAppointment) throw new Error('Appointment not found');
  if (existingAppointment.status === 'COMPLETED' || existingAppointment.status === 'CANCELLED') {
    throw new Error(`Cannot update a ${existingAppointment.status.toLowerCase()} appointment`);
  }

  const previousStatus = existingAppointment.status;
  let dateChanged = false;
  let timeChanged = false;

  if (updateData.date || updateData.time) {
    const newDate = updateData.date ? new Date(updateData.date) : existingAppointment.date;
    const newTime = updateData.time || existingAppointment.time;

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: existingAppointment.doctorId,
        date: newDate,
        time: newTime,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        NOT: { id: appointmentId },
      },
    });

    if (conflict) throw new Error('This time slot is already booked');
    updateData.date = newDate;
    updateData.time = newTime;
    dateChanged = true;
    timeChanged = true;
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
    include: {
      patient: { include: { user: { select: { fullName: true, email: true } } } },
      doctor: { include: { user: { select: { fullName: true } } } },
    },
  });

  if (updateData.status && updateData.status !== previousStatus) {
    await socketEmitter.emitAppointmentStatusChanged(updated, previousStatus);
  }

  if (dateChanged || timeChanged) {
    await socketEmitter.emitAppointmentSlotsChanged(updated.doctorId, updated.date, []);
    if (dateChanged) {
      await socketEmitter.emitAppointmentSlotsChanged(existingAppointment.doctorId, existingAppointment.date, []);
    }
  }

  return updated;
};

export const cancelAppointment = async (appointmentId, reason) => {
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existingAppointment) throw new Error('Appointment not found');
  if (existingAppointment.status === 'COMPLETED') throw new Error('Cannot cancel a completed appointment');
  if (existingAppointment.status === 'CANCELLED') throw new Error('Appointment is already cancelled');

  const previousStatus = existingAppointment.status;

  const cancelled = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
      notes: reason
        ? `${existingAppointment.notes || ''}\nCancellation reason: ${reason}`.trim()
        : existingAppointment.notes,
    },
    include: {
      patient: { include: { user: { select: { fullName: true, email: true } } } },
      doctor: { include: { user: { select: { fullName: true } } } },
    },
  });

  await socketEmitter.emitAppointmentStatusChanged(cancelled, previousStatus);
  await socketEmitter.emitAppointmentSlotsChanged(cancelled.doctorId, cancelled.date, []);

  return cancelled;
};

export const checkInAppointment = async (appointmentId, tokenNumber) => {
  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existing) throw new Error('Appointment not found');
  if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
    throw new Error(`Cannot check in a ${existing.status.toLowerCase()} appointment`);
  }

  const previousStatus = existing.status;

  const checkedIn = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CONFIRMED',
    },
    include: {
      patient: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      doctor: { include: { user: { select: { fullName: true } } } },
    },
  });

  await socketEmitter.emitAppointmentStatusChanged(checkedIn, previousStatus);
  await socketEmitter.emitQueueUpdate(checkedIn.doctorId, tokenNumber || null, [], []);

  return checkedIn;
};