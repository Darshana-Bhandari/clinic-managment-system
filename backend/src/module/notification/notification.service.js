import prisma from '../../config/database.js';

export const listNotifications = async (userId, params = {}) => {
  const { page = 1, limit = 10, read, type } = params;
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const where = { userId };
  if (read !== undefined) {
    where.read = read;
  }
  if (type) {
    where.type = type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getNotificationById = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new Error('Forbidden');
  }

  return notification;
};

export const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new Error('Forbidden');
  }

  return await prisma.notification.update({
    where: { id },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
};

export const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return {
    updatedCount: result.count,
    message: result.count > 0
      ? `${result.count} notification(s) marked as read`
      : 'No unread notifications',
  };
};

export const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return { unreadCount: count };
};

export const deleteNotification = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new Error('Forbidden');
  }

  await prisma.notification.delete({
    where: { id },
  });

  return { message: 'Notification deleted successfully' };
};

export const clearAll = async (userId) => {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return {
    deletedCount: result.count,
    message: result.count > 0
      ? `${result.count} notification(s) cleared`
      : 'No notifications to clear',
  };
};

export const createNotification = async (payload) => {
  const { userId, title, message, type = 'INFO', link = null } = payload;

  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });
};