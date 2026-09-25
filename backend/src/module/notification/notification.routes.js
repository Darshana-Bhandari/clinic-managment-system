import express from 'express';
import * as notificationController from './notification.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { createNotificationSchema } from './notification.schema.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', notificationController.listNotifications);

router.get('/unread-count', notificationController.getUnreadCount);

router.get('/:id', notificationController.getNotificationById);

router.patch('/:id/read', notificationController.markAsRead);

router.patch('/mark-all-read', notificationController.markAllAsRead);

router.delete('/:id', notificationController.deleteNotification);

router.delete('/clear-all', notificationController.clearAll);

router.post('/', validate(createNotificationSchema), notificationController.createNotification);

export default router;