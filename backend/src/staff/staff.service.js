import prisma from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../../utils/hash.js';
import { MESSAGES } from '../../constans/messages.js';

const sanitizeUser = (record) => {
  if (!record) return record;
  const { password, ...rest } = record;
  return rest;
};

const STAFF_ROLES = ['DOCTOR', 'RECEPTIONIST'];

// ==================== ADMIN: CREATE STAFF ====================
export const createStaff = async (payload, actorId) => {
  const {
    fullName,
    email,
    phone,
    password,
    role,
    isActive,
  } = payload;

  const effectiveRole = role ? role.toUpperCase() : 'RECEPTIONIST';
  if (!STAFF_ROLES.includes(effectiveRole)) {
    throw new Error('Invalid staff role. Must be DOCTOR or RECEPTIONIST');
  }

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    phone ? prisma.user.findFirst({ where: { phone } }) : Promise.resolve(null),
  ]);

  if (existingEmail) {
    throw new Error(MESSAGES.EMAIL_ALREADY_EXIST || 'Email already exists');
  }
  if (existingPhone) {
    throw new Error(MESSAGES.PHONE_ALREADY_EXIST || 'Phone number already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: effectiveRole,
        isActive: isActive ?? true,
        isEmailVerified: true,
      },
    });

    if (effectiveRole === 'DOCTOR') {
      await tx.doctor.create({
        data: { userId: createdUser.id },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: createdUser.id,
        action: 'STAFF_CREATED',
        resource: 'User',
        details: {
          email: createdUser.email,
          role: effectiveRole,
          createdBy: actorId,
        },
      },
    });

    return createdUser;
  });

  return sanitizeUser(user);
};

// ==================== ADMIN: LIST STAFF ====================
export const listStaff = async (query = {}) => {
  const { page = 1, limit = 10, search, role, isActive } = query;
  const skip = (page - 1) * limit;

  const where = {
    role: { in: STAFF_ROLES },
  };

  if (role && STAFF_ROLES.includes(role.toUpperCase())) {
    where.role = role.toUpperCase();
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        doctor: role?.toUpperCase() === 'DOCTOR'
          ? { select: { id: true, specialization: true, departmentId: true } }
          : false,
        _count: {
          select: { auditLogs: true, sessions: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    staff: rows.map(sanitizeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== ADMIN: GET STAFF BY ID ====================
export const getStaffById = async (staffId) => {
  const staff = await prisma.user.findFirst({
    where: { id: staffId, role: { in: STAFF_ROLES } },
    include: {
      doctor: true,
      _count: {
        select: { auditLogs: true, sessions: true },
      },
    },
  });

  if (!staff) {
    throw new Error(MESSAGES.USER_NOT_FOUND || 'Staff member not found');
  }

  return sanitizeUser(staff);
};

// ==================== ADMIN: UPDATE STAFF ====================
export const updateStaff = async (staffId, payload, actorId) => {
  const {
    fullName,
    email,
    phone,
    role,
    isActive,
    password,
  } = payload;

  const existing = await prisma.user.findFirst({
    where: { id: staffId, role: { in: STAFF_ROLES } },
  });

  if (!existing) {
    throw new Error(MESSAGES.USER_NOT_FOUND || 'Staff member not found');
  }

  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (password) updates.password = await hashPassword(password);
  if (typeof isActive === 'boolean') updates.isActive = isActive;

  let newRole = existing.role;
  if (role && STAFF_ROLES.includes(role.toUpperCase())) {
    newRole = role.toUpperCase();
    updates.role = newRole;
  }

  if (email && email !== existing.email) {
    const dup = await prisma.user.findUnique({ where: { email } });
    if (dup && dup.id !== staffId) {
      throw new Error(MESSAGES.EMAIL_ALREADY_EXIST || 'Email already exists');
    }
  }

  if (phone && phone !== existing.phone) {
    const dup = await prisma.user.findFirst({ where: { phone } });
    if (dup && dup.id !== staffId) {
      throw new Error(MESSAGES.PHONE_ALREADY_EXIST || 'Phone number already exists');
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: staffId },
      data: updates,
    });

    if (newRole === 'DOCTOR') {
      const doctorProfile = await tx.doctor.findUnique({
        where: { userId: saved.id },
      });
      if (!doctorProfile) {
        await tx.doctor.create({ data: { userId: saved.id } });
      }
    } else if (existing.role === 'DOCTOR' && newRole !== 'DOCTOR') {
      await tx.doctor.deleteMany({ where: { userId: saved.id } });
    }

    await tx.auditLog.create({
      data: {
        userId: saved.id,
        action: 'STAFF_UPDATED',
        resource: 'User',
        details: {
          email: saved.email,
          role: saved.role,
          fields: Object.keys(updates),
          updatedBy: actorId,
        },
      },
    });

    return saved;
  });

  return sanitizeUser(updated);
};

// ==================== ADMIN: TOGGLE STAFF STATUS ====================
export const toggleStaffStatus = async (staffId, actorId) => {
  const existing = await prisma.user.findFirst({
    where: { id: staffId, role: { in: STAFF_ROLES } },
  });

  if (!existing) {
    throw new Error(MESSAGES.USER_NOT_FOUND || 'Staff member not found');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: staffId },
      data: { isActive: !existing.isActive },
    });

    await tx.auditLog.create({
      data: {
        userId: saved.id,
        action: 'STAFF_STATUS_TOGGLED',
        resource: 'User',
        details: {
          email: saved.email,
          role: saved.role,
          newStatus: saved.isActive,
          toggledBy: actorId,
        },
      },
    });

    return saved;
  });

  return sanitizeUser(updated);
};

// ==================== ADMIN: DELETE STAFF ====================
export const deleteStaff = async (staffId, actorId) => {
  const existing = await prisma.user.findFirst({
    where: { id: staffId, role: { in: STAFF_ROLES } },
  });

  if (!existing) {
    throw new Error(MESSAGES.USER_NOT_FOUND || 'Staff member not found');
  }

  try {
    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: { userId: staffId } }),
      prisma.session.deleteMany({ where: { userId: staffId } }),
      prisma.refreshToken.deleteMany({ where: { userId: staffId } }),
      prisma.oTP.deleteMany({ where: { userId: staffId } }),
      prisma.user.delete({ where: { id: staffId } }),
      prisma.auditLog.create({
        data: {
          userId: actorId,
          action: 'STAFF_DELETED',
          resource: 'User',
          details: {
            deletedEmail: existing.email,
            deletedRole: existing.role,
            deletedBy: actorId,
          },
        },
      }),
    ]);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === 'P2014' || err.code === 'P2003')
    ) {
      throw new Error('Cannot delete staff member because they have related records (appointments, bills, etc.). Deactivate them instead.');
    }
    throw err;
  }

  return { message: 'Staff member deleted successfully' };
};