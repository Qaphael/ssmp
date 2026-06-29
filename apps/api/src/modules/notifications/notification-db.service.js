const { pool } = require('../../config/db');

class NotificationDbService {
  async create(userId, type, title, message, data) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );
    return result.rows[0];
  }

  async createBulk(entries) {
    if (entries.length === 0) return [];
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (const entry of entries) {
      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(
        entry.userId,
        entry.type,
        entry.title,
        entry.message,
        entry.data ? JSON.stringify(entry.data) : null
      );
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ${values.join(', ')} RETURNING *`,
      params
    );
    return result.rows;
  }

  async listByUser(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(filters.type);
    }
    if (filters.isRead !== undefined) {
      conditions.push(`is_read = $${paramIndex++}`);
      params.push(filters.isRead);
    }

    const where = conditions.join(' AND ');
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM notifications WHERE ${where}
       ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count, 10),
        page: filters.page || 1,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit),
      },
    };
  }

  async markAsRead(userId, notificationIds) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = ANY($1) AND user_id = $2 RETURNING *`,
      [notificationIds, userId]
    );
    return result.rows;
  }

  async getPushSubscriptions(userIds) {
    if (userIds.length === 0) return [];
    const result = await pool.query(
      `SELECT user_id, endpoint, p256dh, auth
       FROM push_subscriptions
       WHERE user_id = ANY($1)`,
      [userIds]
    );
    return result.rows;
  }

  async getDeviceTokens(userIds) {
    if (userIds.length === 0) return [];
    const result = await pool.query(
      `SELECT user_id, token, platform
       FROM device_tokens
       WHERE user_id = ANY($1)`,
      [userIds]
    );
    return result.rows;
  }

  async savePushSubscription(userId, subscription, userAgent) {
    const result = await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = $3, auth = $4, user_agent = $5
       RETURNING *`,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, userAgent || null]
    );
    return result.rows[0];
  }

  async removePushSubscription(userId, endpoint) {
    const result = await pool.query(
      `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2 RETURNING id`,
      [userId, endpoint]
    );
    return result.rows[0] || null;
  }

  async saveDeviceToken(userId, token, platform) {
    const result = await pool.query(
      `INSERT INTO device_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, token) DO NOTHING
       RETURNING *`,
      [userId, token, platform]
    );
    return result.rows[0] || null;
  }

  async removeDeviceToken(userId, token) {
    const result = await pool.query(
      `DELETE FROM device_tokens WHERE user_id = $1 AND token = $2 RETURNING id`,
      [userId, token]
    );
    return result.rows[0] || null;
  }
}

module.exports = new NotificationDbService();
