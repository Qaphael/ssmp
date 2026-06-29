const { pool } = require('../../config/db');
const { createAuditLog } = require('../../middleware/audit');

class SeasonService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.organizationId) {
      conditions.push(`s.organization_id = $${paramIndex++}`);
      params.push(filters.organizationId);
    }
    if (filters.isArchived !== undefined) {
      conditions.push(`s.is_archived = $${paramIndex++}`);
      params.push(filters.isArchived);
    }
    if (filters.search) {
      conditions.push(`s.name ILIKE $${paramIndex++}`);
      params.push(`%${filters.search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'start_date';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) FROM seasons s ${where}`, params);

    const result = await pool.query(
      `SELECT s.*, o.name as organization_name,
              (SELECT COUNT(*) FROM competitions WHERE season_id = s.id) as competition_count
       FROM seasons s
       LEFT JOIN organizations o ON o.id = s.organization_id
       ${where}
       ORDER BY s.${sortBy} ${sortOrder}
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
      `SELECT s.*, o.name as organization_name
       FROM seasons s
       LEFT JOIN organizations o ON o.id = s.organization_id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data, auditCtx) {
    const result = await pool.query(
      `INSERT INTO seasons (organization_id, name, start_date, end_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.organizationId, data.name, data.startDate, data.endDate]
    );
    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: 'season:create', entityType: 'season', entityId: result.rows[0].id, newValue: result.rows[0] });
    }
    return result.rows[0];
  }

  async update(id, data, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      name: 'name', startDate: 'start_date', endDate: 'end_date', isArchived: 'is_archived',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE seasons SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'season:update', entityType: 'season', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    return result.rows[0] || null;
  }

  async archive(id, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query(
      `UPDATE seasons SET is_archived = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`, [id]
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'season:archive', entityType: 'season', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    return result.rows[0] || null;
  }

  async delete(id, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query('DELETE FROM seasons WHERE id = $1 RETURNING id', [id]);
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'season:delete', entityType: 'season', entityId: id, oldValue: old });
    }
    return result.rows[0] || null;
  }
}

module.exports = new SeasonService();
