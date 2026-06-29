const { pool } = require('../../config/db');

class MediaService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.competitionId) {
      conditions.push(`m.competition_id = $${paramIndex++}`);
      params.push(filters.competitionId);
    }
    if (filters.matchId) {
      conditions.push(`m.match_id = $${paramIndex++}`);
      params.push(filters.matchId);
    }
    if (filters.teamId) {
      conditions.push(`m.team_id = $${paramIndex++}`);
      params.push(filters.teamId);
    }
    if (filters.playerId) {
      conditions.push(`m.player_id = $${paramIndex++}`);
      params.push(filters.playerId);
    }
    if (filters.type) {
      conditions.push(`m.type = $${paramIndex++}`);
      params.push(filters.type);
    }
    if (filters.isApproved !== undefined) {
      conditions.push(`m.is_approved = $${paramIndex++}`);
      params.push(filters.isApproved);
    }
    if (filters.uploadedBy) {
      conditions.push(`m.uploaded_by = $${paramIndex++}`);
      params.push(filters.uploadedBy);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM media m ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT m.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
       FROM media m
       LEFT JOIN users u ON u.id = m.uploaded_by
       ${where}
       ORDER BY m.${sortBy} ${sortOrder}
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
      `SELECT m.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
       FROM media m
       LEFT JOIN users u ON u.id = m.uploaded_by
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const result = await pool.query(
      `INSERT INTO media (uploaded_by, type, url, filename, file_size, mime_type, caption, match_id, team_id, player_id, competition_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        data.uploadedBy,
        data.type,
        data.url,
        data.filename,
        data.fileSize || 0,
        data.mimeType || '',
        data.caption || null,
        data.matchId || null,
        data.teamId || null,
        data.playerId || null,
        data.competitionId || null,
      ]
    );
    return result.rows[0];
  }

  async approve(id, approvedBy) {
    const result = await pool.query(
      `UPDATE media SET is_approved = TRUE, approved_by = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [approvedBy, id]
    );
    return result.rows[0] || null;
  }

  async reject(id) {
    const result = await pool.query(
      'DELETE FROM media WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM media WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new MediaService();
