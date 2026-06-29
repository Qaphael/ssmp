const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

let io = null;

function init(httpServer) {
  const { Server } = require('socket.io');
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      socket.userId = payload.id;
      socket.userRole = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Connected: ${socket.userId} (${socket.userRole})`);

    socket.on('join_match', (matchId) => {
      socket.join(`match:${matchId}`);
      console.log(`[SOCKET] ${socket.userId} joined match:${matchId}`);
    });

    socket.on('leave_match', (matchId) => {
      socket.leave(`match:${matchId}`);
      console.log(`[SOCKET] ${socket.userId} left match:${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Disconnected: ${socket.userId}`);
    });
  });

  console.log(`[SOCKET] Socket.IO initialized`);
  return io;
}

function getIo() {
  return io;
}

function broadcastToMatch(matchId, event, data) {
  if (!io) return;
  io.to(`match:${matchId}`).emit(event, data);
}

function broadcastToAll(event, data) {
  if (!io) return;
  io.emit(event, data);
}

module.exports = { init, getIo, broadcastToMatch, broadcastToAll };
