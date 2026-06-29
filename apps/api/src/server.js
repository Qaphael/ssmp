const http = require('http');
const app = require('./app');
const { env } = require('./config/env');
const socketService = require('./services/socket.service');

const httpServer = http.createServer(app);
socketService.init(httpServer);

const server = httpServer.listen(env.port, () => {
  console.log(`SSMP API running on port ${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
