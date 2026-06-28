const { pool } = require('../../config/db');

class TeamService {
  async list(filters, userId, userRole) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.competitionId) {
      conditions.push(`t.competition_id = $${paramIndex++}`);
      params.push(filters.competitionId);
    }
    if (filters.groupId) {
      conditions.push(`t.group_id = $${paramIndex++}`);
      params.push(filters.groupId);
    }
    if (filters.registrationStatus) {
      conditions.push(`t.registration_status = $${paramIndex++}`);
      params.push(filters.registrationStatus);
    }
    if (filters.rosterApprovalStatus) {
      conditions.push(`t.roster_approval_status = $${paramIndex++}`);
      params.push(filters.rosterApprovalStatus);
    }
    if (filters.search) {
      conditions.push(`(t.name ILIKE $${paramIndex} OR t.school_name ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (userRole === 'coach') {
      conditions.push(`t.coach_id = $${paramIndex++}`);
      params.push(userId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM teams t ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT t.*, c.name as competition_name, c.sport
       FROM teams t
       LEFT JOIN competitions c ON c.id = t.competition_id
       ${where}
       ORDER BY t.${sortBy} ${sortOrder}
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
      `SELECT t.*, c.name as competition_name, c.sport,
              u.first_name as coach_first_name, u.last_name as coach_last_name, u.email as coach_email
       FROM teams t
       LEFT JOIN competitions c ON c.id = t.competition_id
       LEFT JOIN users u ON u.id = t.coach_id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const result = await pool.query(
      `INSERT INTO teams (competition_id, group_id, name, school_name, description, logo_url, primary_color, secondary_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.competitionId,
        data.groupId || null,
        data.name,
        data.schoolName,
        data.description || null,
        data.logoUrl || null,
        data.primaryColor || null,
        data.secondaryColor || null,
      ]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      groupId: 'group_id',
      name: 'name',
      schoolName: 'school_name',
      description: 'description',
      logoUrl: 'logo_url',
      primaryColor: 'primary_color',
      secondaryColor: 'secondary_color',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE teams SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async assignCoach(teamId, coachId) {
    const result = await pool.query(
      `UPDATE teams SET coach_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [coachId, teamId]
    );
    return result.rows[0] || null;
  }

  async approveRegistration(teamId, status) {
    const result = await pool.query(
      `UPDATE teams SET registration_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, teamId]
    );
    return result.rows[0] || null;
  }

  async approveRoster(teamId, status) {
    const result = await pool.query(
      `UPDATE teams SET roster_approval_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, teamId]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM teams WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new TeamService();
