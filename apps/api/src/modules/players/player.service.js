const { pool } = require('../../config/db');
const { createAuditLog } = require('../../middleware/audit');

class PlayerService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.teamId) {
      conditions.push(`p.team_id = $${paramIndex++}`);
      params.push(filters.teamId);
    }
    if (filters.status) {
      conditions.push(`p.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.position) {
      conditions.push(`p.position = $${paramIndex++}`);
      params.push(filters.position);
    }
    if (filters.search) {
      conditions.push(`(p.first_name ILIKE $${paramIndex} OR p.last_name ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'last_name';
    const sortOrder = filters.sortOrder || 'asc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM players p ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT p.*, t.name as team_name
       FROM players p
       LEFT JOIN teams t ON t.id = p.team_id
       ${where}
       ORDER BY p.${sortBy} ${sortOrder}
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
      `SELECT p.*, t.name as team_name, t.competition_id
       FROM players p
       LEFT JOIN teams t ON t.id = p.team_id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data, auditCtx) {
    await this._checkRegistrationWindow(data.teamId);

    const result = await pool.query(
      `INSERT INTO players (team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality, height, weight, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.teamId,
        data.firstName,
        data.lastName,
        data.jerseyNumber,
        data.position || null,
        data.dateOfBirth,
        data.nationality || null,
        data.height || null,
        data.weight || null,
        data.photoUrl || null,
      ]
    );
    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: 'player:create', entityType: 'player', entityId: result.rows[0].id, newValue: result.rows[0] });
    }
    return result.rows[0];
  }

  async createBulk(teamId, players, auditCtx) {
    await this._checkRegistrationWindow(teamId);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const created = [];
      for (const player of players) {
        const result = await client.query(
          `INSERT INTO players (team_id, first_name, last_name, jersey_number, position, date_of_birth, nationality, height, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            teamId,
            player.firstName,
            player.lastName,
            player.jerseyNumber,
            player.position || null,
            player.dateOfBirth,
            player.nationality || null,
            player.height || null,
            player.weight || null,
          ]
        );
        created.push(result.rows[0]);
      }

      await client.query('COMMIT');
      if (auditCtx) {
        for (const p of created) {
          await createAuditLog({ ...auditCtx, action: 'player:create', entityType: 'player', entityId: p.id, newValue: p });
        }
      }
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id, data, userId, userRole, auditCtx) {
    const existing = await this.getById(id);
    if (!existing) return null;

    await this._checkRegistrationWindow(existing.team_id);

    if (userRole === 'coach') {
      const team = await pool.query('SELECT coach_id FROM teams WHERE id = $1', [existing.team_id]);
      if (team.rows[0]?.coach_id !== userId) {
        throw Object.assign(new Error('Not authorized to edit this player'), { status: 403 });
      }
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      jerseyNumber: 'jersey_number',
      position: 'position',
      dateOfBirth: 'date_of_birth',
      nationality: 'nationality',
      height: 'height',
      weight: 'weight',
      photoUrl: 'photo_url',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE players SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'player:update', entityType: 'player', entityId: id, oldValue: existing, newValue: result.rows[0] });
    }
    return result.rows[0];
  }

  async updateInjuryStatus(id, data, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query(
      `UPDATE players
       SET status = 'injured',
           injury_details = jsonb_build_object(
             'description', $1,
             'expected_return_date', $2,
             'medical_notes', $3
           ),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [data.description, data.expectedReturnDate, data.medicalNotes || null, id]
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'player:update-injury', entityType: 'player', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    return result.rows[0] || null;
  }

  async clearInjury(id, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query(
      `UPDATE players
       SET status = 'active', injury_details = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'player:clear-injury', entityType: 'player', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    return result.rows[0] || null;
  }

  async delete(id, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query(
      'DELETE FROM players WHERE id = $1 RETURNING id',
      [id]
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'player:delete', entityType: 'player', entityId: id, oldValue: old });
    }
    return result.rows[0] || null;
  }

  async _checkRegistrationWindow(teamId) {
    const result = await pool.query(
      `SELECT c.registration_window
       FROM competitions c
       JOIN teams t ON t.competition_id = c.id
       WHERE t.id = $1`,
      [teamId]
    );

    if (result.rows.length === 0) {
      throw Object.assign(new Error('Team not found'), { status: 404 });
    }

    const window = result.rows[0].registration_window;
    if (!window) {
      throw Object.assign(new Error('No registration window configured for this competition'), { status: 400 });
    }

    const now = new Date();
    const opensAt = new Date(window.opensAt);
    const closesAt = new Date(window.closesAt);

    if (now < opensAt) {
      throw Object.assign(
        new Error(`Registration opens at ${opensAt.toISOString()}`),
        { status: 400 }
      );
    }

    if (now > closesAt) {
      throw Object.assign(
        new Error(`Registration closed at ${closesAt.toISOString()}`),
        { status: 400 }
      );
    }
  }
}

module.exports = new PlayerService();
