import { io } from 'socket.io-client';

let socket = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin
);

/**
 * Initializes or returns active socket connection
 */
export const initSocket = (authToken) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token: authToken },
    transports: ['websocket', 'polling'], // Fallback to HTTP polling on unstable village 2G/3G connections
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000
  });

  socket.on('connect', () => {
    // console.log('[Socket.IO Client] Connected successfully:', socket.id);
  });

  socket.on('connect_error', (err) => {
    // Graceful fallback notice for offline / low-bandwidth states
    // console.warn('[Socket.IO Client] Connection notice:', err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    return initSocket(token);
  }
  return socket;
};

/**
 * Join communication rooms
 */
export const joinStudentRoom = (studentId) => {
  const s = getSocket();
  if (s && studentId) {
    s.emit('join_student_room', studentId);
  }
};

export const joinClassRoom = (classLevel) => {
  const s = getSocket();
  if (s && classLevel) {
    s.emit('join_class_room', classLevel);
  }
};

export const joinRoleRoom = (role) => {
  const s = getSocket();
  if (s && role) {
    s.emit('join_role_room', role);
  }
};

/**
 * Send real-time peer-to-peer message
 */
export const sendLiveChatMessage = ({ studentId, message, senderName, senderRole }) => {
  const s = getSocket();
  if (s && studentId && message) {
    s.emit('send_chat_message', {
      studentId,
      message,
      senderName,
      senderRole,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Listeners for real-time events with auto-cleanup
 */
export const onInboundParentMessage = (callback) => {
  const s = getSocket();
  if (s) {
    s.on('inbound_parent_message', callback);
    return () => s.off('inbound_parent_message', callback);
  }
  return () => {};
};

export const onWhatsAppStatusUpdate = (callback) => {
  const s = getSocket();
  if (s) {
    s.on('whatsapp_status_update', callback);
    return () => s.off('whatsapp_status_update', callback);
  }
  return () => {};
};

export const onReceiveChatMessage = (callback) => {
  const s = getSocket();
  if (s) {
    s.on('receive_chat_message', callback);
    return () => s.off('receive_chat_message', callback);
  }
  return () => {};
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
