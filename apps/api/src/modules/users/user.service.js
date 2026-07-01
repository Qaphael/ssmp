const { pool } = require('../../config/db');

class UserService {
  async list(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    if (filters.role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(filters.role);
    }
    if (filters.isActive !== undefined) {
      conditions.push(`u.is_active = $${paramIndex++}`);
      params.push(filters.isActive);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) FROM users u ${where}`, params);

    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.last_login_at, u.created_at
       FROM users u ${where}
       ORDER BY u.created_at DESC
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
      `SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id, { role, isActive }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, role, is_active, last_login_at, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  async deactivate(id) {
    const result = await pool.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1
       RETURNING id, email, first_name, last_name, role, is_active`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new UserService();
