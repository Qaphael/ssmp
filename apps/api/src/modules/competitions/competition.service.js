const { pool } = require('../../config/db');
const { createAuditLog } = require('../../middleware/audit');

class CompetitionService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.seasonId) {
      conditions.push(`c.season_id = $${paramIndex++}`);
      params.push(filters.seasonId);
    }
    if (filters.sport) {
      conditions.push(`c.sport = $${paramIndex++}`);
      params.push(filters.sport);
    }
    if (filters.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.search) {
      conditions.push(`c.name ILIKE $${paramIndex++}`);
      params.push(`%${filters.search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) FROM competitions c ${where}`, params);

    const result = await pool.query(
      `SELECT c.*, s.name as season_name, o.name as organization_name,
              (SELECT COUNT(*) FROM teams WHERE competition_id = c.id) as team_count
       FROM competitions c
       LEFT JOIN seasons s ON s.id = c.season_id
       LEFT JOIN organizations o ON o.id = s.organization_id
       ${where}
       ORDER BY c.${sortBy} ${sortOrder}
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
      `SELECT c.*, s.name as season_name, o.name as organization_name
       FROM competitions c
       LEFT JOIN seasons s ON s.id = c.season_id
       LEFT JOIN organizations o ON o.id = s.organization_id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data, auditCtx) {
    const rules = data.rules || {};
    const registrationWindow = data.registrationWindow;

    const result = await pool.query(
      `INSERT INTO competitions (season_id, name, sport, division, status, rules, registration_window, enable_groups, enable_knockouts)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8) RETURNING *`,
      [
        data.seasonId,
        data.name,
        data.sport,
        data.division || null,
        JSON.stringify(rules),
        registrationWindow ? JSON.stringify(registrationWindow) : null,
        data.enableGroups || false,
        data.enableKnockouts || false,
      ]
    );
    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: 'competition:create', entityType: 'competition', entityId: result.rows[0].id, newValue: result.rows[0] });
    }
    return result.rows[0];
  }

  async update(id, data, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      name: 'name', sport: 'sport', division: 'division', status: 'status',
      enableGroups: 'enable_groups', enableKnockouts: 'enable_knockouts',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (data.rules) {
      fields.push(`rules = $${paramIndex++}`);
      values.push(JSON.stringify(data.rules));
    }
    if (data.registrationWindow) {
      fields.push(`registration_window = $${paramIndex++}`);
      values.push(JSON.stringify(data.registrationWindow));
    }

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE competitions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'competition:update', entityType: 'competition', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    return result.rows[0] || null;
  }

  async delete(id, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query('DELETE FROM competitions WHERE id = $1 RETURNING id', [id]);
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'competition:delete', entityType: 'competition', entityId: id, oldValue: old });
    }
    return result.rows[0] || null;
  }
}

module.exports = new CompetitionService();
