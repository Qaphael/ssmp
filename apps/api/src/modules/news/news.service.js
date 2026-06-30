const { pool } = require('../../config/db');

class NewsService {
  async list(filters = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.competitionId) {
      conditions.push(`n.competition_id = $${idx++}`);
      params.push(filters.competitionId);
    }
    if (filters.teamId) {
      conditions.push(`n.team_id = $${idx++}`);
      params.push(filters.teamId);
    }
    if (filters.isPublished !== undefined) {
      conditions.push(`n.is_published = $${idx++}`);
      params.push(filters.isPublished);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) FROM news_articles n ${where}`, params);
    const result = await pool.query(
      `SELECT n.*, u.first_name as author_first_name, u.last_name as author_last_name
       FROM news_articles n
       LEFT JOIN users u ON u.id = n.author_id
       ${where}
       ORDER BY n.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
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
      `SELECT n.*, u.first_name as author_first_name, u.last_name as author_last_name
       FROM news_articles n
       LEFT JOIN users u ON u.id = n.author_id
       WHERE n.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const result = await pool.query(
      `INSERT INTO news_articles (title, content, excerpt, author_id, is_published, published_at, competition_id, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        data.title,
        data.content,
        data.excerpt || null,
        data.authorId,
        data.isPublished || false,
        data.publishedAt || null,
        data.competitionId || null,
        data.teamId || null,
      ]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); params.push(data.title); }
    if (data.content !== undefined) { fields.push(`content = $${idx++}`); params.push(data.content); }
    if (data.excerpt !== undefined) { fields.push(`excerpt = $${idx++}`); params.push(data.excerpt); }
    if (data.isPublished !== undefined) { fields.push(`is_published = $${idx++}`); params.push(data.isPublished); }
    if (data.publishedAt !== undefined) { fields.push(`published_at = $${idx++}`); params.push(data.publishedAt); }
    fields.push(`updated_at = NOW()`);

    if (fields.length <= 1) return this.getById(id);

    params.push(id);
    const result = await pool.query(
      `UPDATE news_articles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM news_articles WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new NewsService();
