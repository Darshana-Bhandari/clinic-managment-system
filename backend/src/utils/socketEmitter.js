import { SOCKET_EVENTS, SOCKET_ROOMS } from '../config/socketEvents.js';

class SocketEmitter {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;
  }

  emitToRoom(room, event, payload) {
    if (!this.io || !room) return;
    this.io.to(room).emit(event, payload);
  }

  emitNotification(recipientId, notification) {
    this.emitToRoom(SOCKET_ROOMS.user(recipientId), SOCKET_EVENTS.NOTIFICATION, notification);
  }

  emitChatMessageRead(userId, conversationUserId, messageIds = []) {
    this.emitToRoom(SOCKET_ROOMS.user(conversationUserId), SOCKET_EVENTS.CHAT_MESSAGE_READ, {
      userId,
      conversationUserId,
      messageIds,
      readAt: new Date().toISOString(),
    });
  }

  emitChatTyping(userId, recipientId) {
    this.emitToRoom(SOCKET_ROOMS.user(recipientId), SOCKET_EVENTS.CHAT_TYPING, {
      senderId: userId,
      recipientId,
      timestamp: new Date().toISOString(),
    });
  }

  emitChatStopTyping(userId, recipientId) {
    this.emitToRoom(SOCKET_ROOMS.user(recipientId), SOCKET_EVENTS.CHAT_STOP_TYPING, {
      senderId: userId,
      recipientId,
      timestamp: new Date().toISOString(),
    });
  }

  emitPaymentReceived(payment) {
    const payload = { payment, timestamp: new Date().toISOString() };
    this.emitToRoom(SOCKET_ROOMS.DASHBOARD, SOCKET_EVENTS.PAYMENT_RECEIVED, payload);
    if (payment?.bill?.patient?.userId) {
      this.emitToRoom(SOCKET_ROOMS.user(payment.bill.patient.userId), SOCKET_EVENTS.PAYMENT_RECEIVED, payload);
    }
  }

  emitPaymentFailed(payment, error) {
    const payload = {
      payment,
      error,
      timestamp: new Date().toISOString(),
    };
    this.emitToRoom(SOCKET_ROOMS.DASHBOARD, SOCKET_EVENTS.PAYMENT_FAILED, payload);
    if (payment?.bill?.patient?.userId) {
      this.emitToRoom(SOCKET_ROOMS.user(payment.bill.patient.userId), SOCKET_EVENTS.PAYMENT_FAILED, payload);
    }
  }

  emitBookingCreated(appointment) {
    const payload = { appointment, timestamp: new Date().toISOString() };
    this.emitToRoom(SOCKET_ROOMS.DASHBOARD, SOCKET_EVENTS.BOOKING_CREATED, payload);
    this.emitToRoom(SOCKET_ROOMS.doctor(appointment.doctorId), SOCKET_EVENTS.BOOKING_CREATED, payload);
  }

  emitAppointmentStatusChanged(appointment, previousStatus) {
    const payload = {
      appointment,
      previousStatus,
      timestamp: new Date().toISOString(),
    };
    this.emitToRoom(SOCKET_ROOMS.doctor(appointment.doctorId), SOCKET_EVENTS.APPOINTMENT_STATUS_CHANGED, payload);
    if (appointment?.patient?.userId) {
      this.emitToRoom(SOCKET_ROOMS.user(appointment.patient.userId), SOCKET_EVENTS.APPOINTMENT_STATUS_CHANGED, payload);
    }
  }

  emitAppointmentSlotsChanged(doctorId, appointmentDate, slots = []) {
    this.emitToRoom(SOCKET_ROOMS.doctor(doctorId), SOCKET_EVENTS.APPOINTMENT_SLOTS_CHANGED, {
      doctorId,
      appointmentDate,
      slots,
      timestamp: new Date().toISOString(),
    });
  }

  emitQueueUpdate(doctorId, tokenNumber = null, queue = [], activePatients = []) {
    this.emitToRoom(SOCKET_ROOMS.doctor(doctorId), SOCKET_EVENTS.QUEUE_UPDATE, {
      doctorId,
      tokenNumber,
      queue,
      activePatients,
      timestamp: new Date().toISOString(),
    });
    this.emitToRoom(SOCKET_ROOMS.PUBLIC_QUEUE, SOCKET_EVENTS.QUEUE_UPDATE, {
      doctorId,
      tokenNumber,
      queue,
      activePatients,
      timestamp: new Date().toISOString(),
    });
  }
}

const socketEmitter = new SocketEmitter();

export default socketEmitter;