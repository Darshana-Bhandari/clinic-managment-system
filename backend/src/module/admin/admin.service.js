import prisma from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../../utils/hash.js';
import { MESSAGES } from '../../constans/messages.js';

const sanitizeUser = (record) => {
  if (!record) return record;
  const { password, ...rest } = record;
  return rest;
};

// ==================== ADMIN: CREATE ADMIN USER ====================
export const createAdmin = async (payload, actorId) => {
  const { fullName, email, phone, password } = payload;

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phone } }),
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
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: createdUser.id,
        action: 'ADMIN_CREATED',
        resource: 'User',
        details: {
          email: createdUser.email,
          createdBy: actorId,
        },
      },
    });

    return createdUser;
  });

  return sanitizeUser(user);
};

// ==================== ADMIN: LIST USERS ====================
export const listUsers = async (query = {}) => {
  const { page = 1, limit = 10, search, role, isActive } = query;
  const skip = (page - 1) * limit;

  const where = {};

  if (role) where.role = role.toUpperCase();
  if (typeof isActive === 'boolean') where.isActive = isActive;

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
        _count: {
          select: { sessions: true, refreshTokens: true, auditLogs: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: rows.map(sanitizeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== ADMIN: GET USER BY ID ====================
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sessions: { where: { isActive: true } },
      refreshTokens: { where: { revoked: false } },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');
  return sanitizeUser(user);
};

// ==================== ADMIN: UPDATE USER ====================
export const updateUser = async (userId, payload, actorId) => {
  const { fullName, email, phone, isActive, password } = payload;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');

  if (email && email !== existing.email) {
    const dup = await prisma.user.findUnique({ where: { email } });
    if (dup && dup.id !== userId) {
      throw new Error(MESSAGES.EMAIL_ALREADY_EXIST || 'Email already exists');
    }
  }
  if (phone && phone !== existing.phone) {
    const dup = await prisma.user.findUnique({ where: { phone } });
    if (dup && dup.id !== userId) {
      throw new Error(MESSAGES.PHONE_ALREADY_EXIST || 'Phone number already exists');
    }
  }

  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (typeof isActive === 'boolean') updates.isActive = isActive;
  if (password) updates.password = await hashPassword(password);

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: userId },
      data: updates,
    });

    await tx.auditLog.create({
      data: {
        userId: saved.id,
        action: 'USER_UPDATED',
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

// ==================== ADMIN: UPDATE USER ROLE ====================
export const updateUserRole = async (userId, newRole, actorId) => {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');

  const role = newRole.toUpperCase();

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: userId },
      data: { role },
    });

    if (role === 'PATIENT') {
      const profile = await tx.patient.findUnique({ where: { userId: saved.id } });
      if (!profile) await tx.patient.create({ data: { userId: saved.id } });
    } else if (role === 'DOCTOR') {
      const profile = await tx.doctor.findUnique({ where: { userId: saved.id } });
      if (!profile) await tx.doctor.create({ data: { userId: saved.id } });
    }

    await tx.auditLog.create({
      data: {
        userId: saved.id,
        action: 'ROLE_UPDATED',
        resource: 'User',
        details: {
          oldRole: existing.role,
          newRole: role,
          email: saved.email,
          updatedBy: actorId,
        },
      },
    });

    return saved;
  });

  return sanitizeUser(updated);
};

// ==================== ADMIN: TOGGLE USER STATUS ====================
export const toggleUserStatus = async (userId, actorId) => {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: userId },
      data: { isActive: !existing.isActive },
    });

    await tx.auditLog.create({
      data: {
        userId: saved.id,
        action: 'USER_STATUS_TOGGLED',
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

// ==================== ADMIN: DELETE USER ====================
export const deleteUser = async (userId, actorId) => {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');

  try {
    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.refreshToken.deleteMany({ where: { userId } }),
      prisma.oTP.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === 'P2014' || err.code === 'P2003')
    ) {
      throw new Error(
        'Cannot delete user because they have related records (appointments, bills, etc.). Deactivate them instead.'
      );
    }
    throw err;
  }

  return { message: 'User deleted successfully' };
};

// ==================== ADMIN: GET AUDIT LOGS ====================
export const getAuditLogs = async (query = {}) => {
  const { page = 1, limit = 30, userId, action } = query || {};
  const skip = (page - 1) * limit;

  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { email: true, fullName: true, role: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};