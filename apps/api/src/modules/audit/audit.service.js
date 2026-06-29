const { pool } = require('../../config/db');

class AuditService {
  async log({ userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent }) {
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
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
    return result.rows[0];
  }

  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`a.user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }
    if (filters.entityType) {
      conditions.push(`a.entity_type = $${paramIndex++}`);
      params.push(filters.entityType);
    }
    if (filters.entityId) {
      conditions.push(`a.entity_id = $${paramIndex++}`);
      params.push(filters.entityId);
    }
    if (filters.action) {
      conditions.push(`a.action = $${paramIndex++}`);
      params.push(filters.action);
    }
    if (filters.dateFrom) {
      conditions.push(`a.created_at >= $${paramIndex++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`a.created_at <= $${paramIndex++}`);
      params.push(filters.dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs a ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name, u.email
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.${sortBy} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
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

  async getById(id) {
    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name, u.email
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new AuditService();
