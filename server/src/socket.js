import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Initializes Socket.IO with CORS and event dispatchers
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Fallback to polling on rural 2G/3G networks
    pingTimeout: 30000,
    pingInterval: 25000
  });

  ioInstance.on('connection', (socket) => {
    // console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join specific student communication room
    socket.on('join_student_room', (studentId) => {
      if (studentId) {
        const roomName = `student_${studentId}`;
        socket.join(roomName);
        // console.log(`[Socket.IO] Socket ${socket.id} joined ${roomName}`);
        socket.emit('room_joined', { room: roomName, status: 'active' });
      }
    });

    // Join class teacher room
    socket.on('join_class_room', (classLevel) => {
      if (classLevel) {
        const roomName = `class_${classLevel}`;
        socket.join(roomName);
        // console.log(`[Socket.IO] Socket ${socket.id} joined ${roomName}`);
        socket.emit('room_joined', { room: roomName, status: 'active' });
      }
    });

    // Join institutional role channel
    socket.on('join_role_room', (role) => {
      if (role) {
        const roomName = `role_${role}`;
        socket.join(roomName);
        socket.emit('room_joined', { room: roomName, status: 'active' });
      }
    });

    // Leave room
    socket.on('leave_room', (roomName) => {
      if (roomName) {
        socket.leave(roomName);
      }
    });

    // Direct peer-to-peer messaging event between Teacher & Parent
    socket.on('send_chat_message', (payload) => {
      const { studentId, message, senderName, senderRole, timestamp } = payload;
      if (studentId && message) {
        const roomName = `student_${studentId}`;
        ioInstance.to(roomName).emit('receive_chat_message', {
          studentId,
          message,
          senderName,
          senderRole,
          timestamp: timestamp || new Date().toISOString()
        });
      }
    });

    // Real-time typing status
    socket.on('typing_indicator', ({ studentId, isTyping, user }) => {
      if (studentId) {
        socket.to(`student_${studentId}`).emit('typing_status', { isTyping, user });
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

/**
 * Returns active Socket.IO server instance
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Helper to broadcast an event to a student room
 */
export const broadcastToStudent = (studentId, event, data) => {
  if (ioInstance && studentId) {
    ioInstance.to(`student_${studentId}`).emit(event, data);
    // Also notify general listeners
    ioInstance.emit(`student_${studentId}_event`, { event, data });
  }
};

/**
 * Helper to broadcast an event to an entire grade
 */
export const broadcastToClass = (classLevel, event, data) => {
  if (ioInstance && classLevel) {
    ioInstance.to(`class_${classLevel}`).emit(event, data);
  }
};

/**
 * Helper to broadcast to all connected clients
 */
export const broadcastToAll = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};
