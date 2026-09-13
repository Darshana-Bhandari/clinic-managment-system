export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  AUTHENTICATED: 'authenticated',
  DISCONNECT: 'disconnect',
  DISCONNECTING: 'disconnecting',
  ERROR: 'error',
  ERROR_EVENT: 'error_event',

  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  RATE_LIMITED: 'rate_limited',

  CHAT_MESSAGE: 'chat_message',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_MESSAGE_READ: 'chat_message_read',
  CHAT_TYPING: 'chat_typing',
  CHAT_STOP_TYPING: 'chat_stop_typing',
  CHAT_HISTORY: 'chat_history',
  CHAT_CONVERSATIONS: 'chat_conversations',

  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_MARK_ALL_READ: 'notification_mark_all_read',

  PRESENCE_STATUS: 'presence_status',
  PING: 'ping',
  PONG: 'pong',

  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  BOOKING_CREATED: 'booking_created',
  APPOINTMENT_STATUS_CHANGED: 'appointment_status_changed',
  APPOINTMENT_SLOTS_CHANGED: 'appointment_slots_changed',
  QUEUE_UPDATE: 'queue_update',
};

export const SOCKET_ROOMS = {
  ADMIN: 'admin',
  DASHBOARD: 'dashboard',
  DOCTORS: 'doctors',
  STAFF: 'staff',
  PATIENTS: 'patients',
  PUBLIC_QUEUE: 'public_queue',

  user: (userId) => `user:${userId}`,
  doctor: (doctorId) => `doctor:${doctorId}`,
  department: (departmentId) => `department:${departmentId}`,
  patient: (patientId) => `patient:${patientId}`,
  chat: (userA, userB) => `chat:${[userA, userB].sort((a, b) => String(a).localeCompare(String(b))).join(':')}`,
};

export const PRESENCE_STATES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
};

export const SOCKET_CONFIG = {
  HEARTBEAT_INTERVAL: 25000,
  HEARTBEAT_TIMEOUT: 60000,
  MAX_CONNECTIONS_PER_USER: 3,
  MESSAGE_RATE_LIMIT: {
    CHAT: {
      windowMs: 60 * 1000,
      max: 120,
    },
  },
};