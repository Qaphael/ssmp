const { pool } = require('../config/db');
const { env } = require('../config/env');

async function createAuditLog({ userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        action,
        entityType,
        entityId,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress || null,
        userAgent || null,
      ]
    );
  } catch (err) {
    console.error(`[AUDIT] FAILED: ${action} on ${entityType}:${entityId} by user ${userId} — ${err.message}`);
    if (env.nodeEnv !== 'production') {
      throw err;
    }
  }
}

module.exports = { createAuditLog };
