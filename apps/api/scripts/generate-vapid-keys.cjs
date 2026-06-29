/**
 * Generate VAPID keys for Web Push notifications.
 * Run: node scripts/generate-vapid-keys.cjs
 * Add the output to your .env file.
 */

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys for Web Push ===\n');
console.log('Add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:your-email@domain.com`);
console.log('\n================================\n');
