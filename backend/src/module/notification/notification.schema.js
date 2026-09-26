import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  page: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) || num < 1 ? 1 : num;
  }).default('1'),
  limit: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) || num < 1 ? 10 : Math.min(num, 100);
  }).default('10'),
  read: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  type: z.string().optional(),
});

export const notificationIdSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
  type: z.string().optional().default('INFO'),
  link: z.string().optional().nullable(),
});