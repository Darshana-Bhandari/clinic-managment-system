import { Server } from 'socket.io';
import cookie from 'cookie';
import { SOCKET_EVENTS, SOCKET_ROOMS, PRESENCE_STATES, SOCKET_CONFIG } from './socketEvents.js';
import { ENV } from './env.js';
import prisma from './database.js';
import jwtService from '../utils/jwt.js';
import socketEmitter from '../utils/socketEmitter.js';

class SocketManager {
  constructor() {
    this.io = null;
    this.userSockets = new Map();
    this.userPresence = new Map();
    this.rateLimitStore = new Map();
    this.connectionTimestamps = new Map();
  }

  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = [
            ENV.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
          ].filter(Boolean);

          if (!origin || allowedOrigins.includes(origin) || ENV.NODE_ENV === 'development') {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST'],
      },
      pingInterval: SOCKET_CONFIG.HEARTBEAT_INTERVAL,
      pingTimeout: SOCKET_CONFIG.HEARTBEAT_TIMEOUT,
      maxHttpBufferSize: 1e7,
      allowRequest: (req, callback) => {
        const noOriginHeader = req.headers.origin === undefined;
        callback(null, noOriginHeader || ENV.NODE_ENV !== 'production');
      },
      transports: ['websocket', 'polling'],
      upgradeTimeout: 30000,
      allowUpgrades: true,
      httpCompression: {
        threshold: 1024,
        level: 6,
      },
      perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        clientMaxWindowBits: 10,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
      },
    });

    socketEmitter.initialize(this.io);

    this.io.use(this.authenticateMiddleware.bind(this));
    this.io.on(SOCKET_EVENTS.CONNECTION, this.handleConnection.bind(this));

    this._startPresenceCleanup();
    this._startRateLimitCleanup();

    console.log(`[Socket.IO] ✅ Server initialized with CORS origin: ${ENV.FRONTEND_URL || '*'}`);
    return this.io;
  }

  _extractToken(socket) {
    let token = null;

    if (socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    } else if (socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    } else if (socket.handshake.headers?.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.accessToken;
    }

    return token;
  }

  async authenticateMiddleware(socket, next) {
    try {
      const token = this._extractToken(socket);

      if (!token) {
        const err = new Error('Authentication token missing');
        err.data = { code: 'NO_TOKEN' };
        return next(err);
      }

      let decoded;
      try {
        decoded = jwtService.verifyAccessToken(token);
      } catch (jwtError) {
        if (jwtError.message === 'ACCESS_TOKEN_EXPIRED') {
          const err = new Error('Access token expired');
          err.data = { code: 'TOKEN_EXPIRED' };
          return next(err);
        }
        const err = new Error('Invalid access token');
        err.data = { code: 'INVALID_TOKEN' };
        return next(err);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          avatar: true,
        },
      });

      if (!user) {
        const err = new Error('User not found');
        err.data = { code: 'USER_NOT_FOUND' };
        return next(err);
      }

      if (!user.isActive) {
        const err = new Error('Account is disabled');
        err.data = { code: 'ACCOUNT_DISABLED' };
        return next(err);
      }

      const currentConnections = this.userSockets.get(user.id) || new Set();
      if (currentConnections.size >= SOCKET_CONFIG.MAX_CONNECTIONS_PER_USER) {
        const err = new Error('Too many connections from this user');
        err.data = { code: 'MAX_CONNECTIONS' };
        return next(err);
      }

      socket.user = user;
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.clientIP =
        socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() ||
        socket.handshake.address;

      next();
    } catch (error) {
      console.error('[Socket.IO] Auth middleware error:', error);
      const err = new Error('Authentication failed');
      err.data = { code: 'AUTH_FAILED', reason: error.message };
      next(err);
    }
  }

  handleConnection(socket) {
    const { userId, userRole } = socket;
    const socketId = socket.id;
    const connectTime = Date.now();

    this.connectionTimestamps.set(socketId, connectTime);

    const sockets = this.userSockets.get(userId) || new Set();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);

    this._registerUserRooms(socket, userRole);

    this.userPresence.set(userId, {
      state: PRESENCE_STATES.ONLINE,
      lastSeen: connectTime,
      sockets: Array.from(sockets),
    });
    this._broadcastPresence(userId, PRESENCE_STATES.ONLINE);

    socket.emit(SOCKET_EVENTS.AUTHENTICATED, {
      user: socket.user,
      socketId,
      connectedAt: new Date(connectTime).toISOString(),
      serverTime: new Date().toISOString(),
    });

    this._attachEventHandlers(socket);

    console.log(
      `[Socket.IO] 🟢 Connected [${socketId}] user=${userId} role=${userRole} ip=${socket.clientIP} sockets=${sockets.size}`
    );

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) =>
      this.handleDisconnect(socket, reason)
    );
    socket.on(SOCKET_EVENTS.DISCONNECTING, () => this.handleDisconnecting(socket));
    socket.on(SOCKET_EVENTS.ERROR, (err) => this.handleSocketError(socket, err));
  }

  _registerUserRooms(socket, role) {
    const userRoom = SOCKET_ROOMS.user(socket.userId);
    socket.join(userRoom);

    switch (role.toUpperCase()) {
      case 'ADMIN':
        socket.join(SOCKET_ROOMS.ADMIN);
        socket.join(SOCKET_ROOMS.DASHBOARD);
        break;
      case 'DOCTOR':
        socket.join(SOCKET_ROOMS.DOCTORS);
        prisma.doctor
          .findUnique({ where: { userId: socket.userId }, select: { id: true, departmentId: true } })
          .then((doctor) => {
            if (doctor) {
              socket.join(SOCKET_ROOMS.doctor(doctor.id));
              if (doctor.departmentId) {
                socket.join(SOCKET_ROOMS.department(doctor.departmentId));
              }
            }
          })
          .catch((err) => console.error('[Socket.IO] Doctor room join error:', err));
        break;
      case 'RECEPTIONIST':
      case 'STAFF':
        socket.join(SOCKET_ROOMS.STAFF);
        socket.join(SOCKET_ROOMS.DASHBOARD);
        break;
      case 'PATIENT':
        socket.join(SOCKET_ROOMS.PATIENTS);
        prisma.patient
          .findUnique({ where: { userId: socket.userId }, select: { id: true } })
          .then((patient) => {
            if (patient) {
              socket.join(SOCKET_ROOMS.patient(patient.id));
            }
          })
          .catch((err) => console.error('[Socket.IO] Patient room join error:', err));
        break;
    }

    socket.join(SOCKET_ROOMS.PUBLIC_QUEUE);
  }

  _attachEventHandlers(socket) {
    socket.on(SOCKET_EVENTS.JOIN_ROOM, this._handleJoinRoom.bind(this, socket));
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, this._handleLeaveRoom.bind(this, socket));

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, this._handleChatMessage.bind(this, socket));
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE_READ, this._handleChatRead.bind(this, socket));
    socket.on(SOCKET_EVENTS.CHAT_TYPING, this._handleChatTyping.bind(this, socket));
    socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, this._handleChatStopTyping.bind(this, socket));
    socket.on(SOCKET_EVENTS.CHAT_HISTORY, this._handleChatHistory.bind(this, socket));
    socket.on(SOCKET_EVENTS.CHAT_CONVERSATIONS, this._handleChatConversations.bind(this, socket));

    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, this._handleNotificationRead.bind(this, socket));
    socket.on(SOCKET_EVENTS.NOTIFICATION_MARK_ALL_READ, this._handleNotificationMarkAllRead.bind(this, socket));

    socket.on(SOCKET_EVENTS.PRESENCE_STATUS, this._handlePresenceStatus.bind(this, socket));
    socket.on(SOCKET_EVENTS.PING, this._handlePing.bind(this, socket));
  }

  _isRateLimited(socket, key, config) {
    const now = Date.now();
    const storeKey = `${socket.userId}:${key}`;
    const entry = this.rateLimitStore.get(storeKey) || { count: 0, windowStart: now };

    if (now - entry.windowStart > config.windowMs) {
      entry.count = 1;
      entry.windowStart = now;
    } else {
      entry.count += 1;
    }

    this.rateLimitStore.set(storeKey, entry);

    if (entry.count > config.max) {
      socket.emit(SOCKET_EVENTS.RATE_LIMITED, {
        event: key,
        limit: config.max,
        windowMs: config.windowMs,
        retryAfterMs: config.windowMs - (now - entry.windowStart),
      });
      return true;
    }
    return false;
  }

  async _handleJoinRoom(socket, { room }) {
    if (!room) return;
    try {
      await socket.join(room);
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room, success: true });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR_EVENT, { message: 'Failed to join room', room });
    }
  }

  async _handleLeaveRoom(socket, { room }) {
    if (!room) return;
    try {
      await socket.leave(room);
      socket.emit(SOCKET_EVENTS.ROOM_LEFT, { room, success: true });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR_EVENT, { message: 'Failed to leave room', room });
    }
  }

  async _handleChatMessage(socket, payload) {
    if (this._isRateLimited(socket, 'chat', SOCKET_CONFIG.MESSAGE_RATE_LIMIT.CHAT)) return;

    try {
      const { recipientId, message, type = 'text' } = payload;

      if (!recipientId || !message) {
        return socket.emit(SOCKET_EVENTS.ERROR_EVENT, {
          code: 'INVALID_PAYLOAD',
          message: 'recipientId and message are required',
        });
      }

      if (message.length > 5000) {
        return socket.emit(SOCKET_EVENTS.ERROR_EVENT, {
          code: 'MESSAGE_TOO_LONG',
          message: 'Message exceeds 5000 characters',
        });
      }

      const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
      if (!recipient) {
        return socket.emit(SOCKET_EVENTS.ERROR_EVENT, {
          code: 'RECIPIENT_NOT_FOUND',
          message: 'Recipient not found',
        });
      }

      const chatMessage = await prisma.chatMessage.create({
        data: {
          senderId: socket.userId,
          recipientId,
          message: String(message).trim(),
          type,
        },
        include: {
          sender: { select: { id: true, fullName: true, avatar: true } },
          recipient: { select: { id: true, fullName: true, avatar: true } },
        },
      });

      const chatRoom = SOCKET_ROOMS.chat(socket.userId, recipientId);
      await socket.join(chatRoom);

      this.io.to(chatRoom).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMessage);
      this.io.to(SOCKET_ROOMS.user(recipientId)).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMessage);

      socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SENT, {
        id: chatMessage.id,
        delivered: true,
        timestamp: new Date().toISOString(),
      });

      await prisma.notification.create({
        data: {
          userId: recipientId,
          title: `New message from ${chatMessage.sender.fullName}`,
          message: chatMessage.message.slice(0, 100),
          type: 'INFO',
          link: `/chat/${socket.userId}`,
        },
      }).then((n) => socketEmitter.emitNotification(recipientId, n)).catch(() => {});
    } catch (err) {
      console.error('[Socket.IO] Chat message error:', err);
      socket.emit(SOCKET_EVENTS.ERROR_EVENT, {
        code: 'CHAT_ERROR',
        message: err.message || 'Failed to send message',
      });
    }
  }

  async _handleChatRead(socket, payload) {
    try {
      const { conversationUserId, messageIds } = payload;
      if (!conversationUserId) return;

      const where = messageIds && messageIds.length > 0
        ? { id: { in: messageIds }, recipientId: socket.userId, read: false }
        : { senderId: conversationUserId, recipientId: socket.userId, read: false };

      const now = new Date();
      const result = await prisma.chatMessage.updateMany({
        where,
        data: { read: true, readAt: now },
      });

      if (result.count > 0) {
        socketEmitter.emitChatMessageRead(socket.userId, conversationUserId, messageIds);
      }
    } catch (err) {
      console.error('[Socket.IO] Chat read error:', err);
    }
  }

  async _handleChatTyping(socket, { recipientId }) {
    if (!recipientId) return;
    socketEmitter.emitChatTyping(socket.userId, recipientId);
  }

  async _handleChatStopTyping(socket, { recipientId }) {
    if (!recipientId) return;
    socketEmitter.emitChatStopTyping(socket.userId, recipientId);
  }

  async _handleChatHistory(socket, payload) {
    try {
      const { withUserId, page = 1, limit = 50 } = payload;
      if (!withUserId) return;

      const skip = (page - 1) * limit;
      const where = {
        OR: [
          { senderId: socket.userId, recipientId: withUserId },
          { senderId: withUserId, recipientId: socket.userId },
        ],
      };

      const [messages, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where,
          include: {
            sender: { select: { id: true, fullName: true, avatar: true } },
            recipient: { select: { id: true, fullName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.chatMessage.count({ where }),
      ]);

      socket.emit(SOCKET_EVENTS.CHAT_HISTORY, {
        withUserId,
        messages: messages.reverse(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error('[Socket.IO] Chat history error:', err);
      socket.emit(SOCKET_EVENTS.ERROR_EVENT, { code: 'HISTORY_ERROR', message: err.message });
    }
  }

  async _handleChatConversations(socket) {
    try {
      const userId = socket.userId;

      const rawConversations = await prisma.$queryRaw`
        SELECT 
          CASE WHEN senderId = ${userId} THEN recipientId ELSE senderId END as otherUserId,
          MAX(createdAt) as lastMessageAt
        FROM chat_messages
        WHERE senderId = ${userId} OR recipientId = ${userId}
        GROUP BY CASE WHEN senderId = ${userId} THEN recipientId ELSE senderId END
        ORDER BY lastMessageAt DESC
      `;

      const conversations = [];
      for (const conv of rawConversations) {
        const otherUserId = conv.otherUserId;
        const [user, lastMessage, unreadCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, fullName: true, avatar: true, role: true },
          }),
          prisma.chatMessage.findFirst({
            where: {
              OR: [
                { senderId: userId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.chatMessage.count({
            where: { senderId: otherUserId, recipientId: userId, read: false },
          }),
        ]);

        if (user) {
          conversations.push({
            user,
            lastMessage,
            unreadCount,
            lastMessageAt: conv.lastMessageAt,
          });
        }
      }

      socket.emit(SOCKET_EVENTS.CHAT_CONVERSATIONS, { conversations });
    } catch (err) {
      console.error('[Socket.IO] Chat conversations error:', err);
      socket.emit(SOCKET_EVENTS.ERROR_EVENT, { code: 'CONVERSATIONS_ERROR', message: err.message });
    }
  }

  async _handleNotificationRead(socket, { notificationId }) {
    if (!notificationId) return;
    try {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: socket.userId, read: false },
        data: { read: true, readAt: new Date() },
      });
    } catch (err) {
      console.error('[Socket.IO] Notification read error:', err);
    }
  }

  async _handleNotificationMarkAllRead(socket) {
    try {
      await prisma.notification.updateMany({
        where: { userId: socket.userId, read: false },
        data: { read: true, readAt: new Date() },
      });
    } catch (err) {
      console.error('[Socket.IO] Mark all read error:', err);
    }
  }

  async _handlePresenceStatus(socket, { state }) {
    if (!Object.values(PRESENCE_STATES).includes(state)) return;
    this.userPresence.set(socket.userId, {
      state,
      lastSeen: Date.now(),
      sockets: Array.from(this.userSockets.get(socket.userId) || []),
    });
    this._broadcastPresence(socket.userId, state);
  }

  async _handlePing(socket) {
    socket.emit(SOCKET_EVENTS.PONG, { serverTime: new Date().toISOString() });
  }

  handleDisconnecting(socket) {
    const activeRooms = Array.from(socket.rooms).filter(
      (room) => room !== socket.id
    );
    console.log(
      `[Socket.IO] 🔄 Disconnecting [${socket.id}] rooms=[${activeRooms.join(', ')}]`
    );
  }

  handleDisconnect(socket, reason) {
    const { userId } = socket;
    const sockets = this.userSockets.get(userId) || new Set();
    sockets.delete(socket.id);
    this.connectionTimestamps.delete(socket.id);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      this.userPresence.set(userId, {
        state: PRESENCE_STATES.OFFLINE,
        lastSeen: Date.now(),
        sockets: [],
      });
      this._broadcastPresence(userId, PRESENCE_STATES.OFFLINE);
    } else {
      this.userSockets.set(userId, sockets);
      const presence = this.userPresence.get(userId);
      if (presence) {
        presence.sockets = Array.from(sockets);
        this.userPresence.set(userId, presence);
      }
    }

    const duration = this.connectionTimestamps.get(socket.id)
      ? Date.now() - this.connectionTimestamps.get(socket.id)
      : 0;

    console.log(
      `[Socket.IO] 🔴 Disconnected [${socket.id}] user=${userId} reason=${reason} duration=${Math.round(duration / 1000)}s remaining=${sockets.size}`
    );
  }

  handleSocketError(socket, error) {
    console.error(`[Socket.IO] ❌ Error on [${socket.id}]:`, error.message || error);
    socket.emit(SOCKET_EVENTS.ERROR_EVENT, {
      message: error.message || 'An unexpected error occurred',
    });
  }

  _broadcastPresence(userId, state) {
    this.io.emit(SOCKET_EVENTS.PRESENCE_STATUS, {
      userId,
      state,
      timestamp: new Date().toISOString(),
    });
  }

  _startPresenceCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [userId, presence] of this.userPresence.entries()) {
        const sockets = this.userSockets.get(userId);
        if (!sockets || sockets.size === 0) {
          if (now - presence.lastSeen > 5 * 60 * 1000) {
            this.userPresence.delete(userId);
          }
        }
      }
    }, 5 * 60 * 1000);
  }

  _startRateLimitCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.rateLimitStore.entries()) {
        if (now - entry.windowStart > 2 * 60 * 1000) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 2 * 60 * 1000);
  }

  getUserConnections(userId) {
    return this.userSockets.get(userId) || new Set();
  }

  getConnectedUserCount() {
    return this.userSockets.size;
  }

  getTotalConnectionCount() {
    let total = 0;
    for (const sockets of this.userSockets.values()) {
      total += sockets.size;
    }
    return total;
  }

  getPresence(userId) {
    return this.userPresence.get(userId) || null;
  }

  isUserOnline(userId) {
    const sockets = this.userSockets.get(userId);
    return sockets && sockets.size > 0;
  }
}

const socketManager = new SocketManager();

export const initializeSocket = (httpServer) => {
  return socketManager.initialize(httpServer);
};

export default socketManager;