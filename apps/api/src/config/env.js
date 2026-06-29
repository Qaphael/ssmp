const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/ssmp',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || '*',

  // Web Push (VAPID)
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidEmail: process.env.VAPID_EMAIL || 'mailto:admin@ssmp.local',

  // SMTP Email
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'SSMP <noreply@ssmp.local>',

  // Firebase Cloud Messaging (Android push)
  fcmProjectId: process.env.FCM_PROJECT_ID || '',
  fcmPrivateKey: process.env.FCM_PRIVATE_KEY || '',
  fcmClientEmail: process.env.FCM_CLIENT_EMAIL || '',
};

if (env.nodeEnv === 'production' && (!process.env.JWT_SECRET || env.jwtSecret === 'dev-secret-change-in-production')) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = { env };
