const { pool } = require('../../config/db');

class OrganizationService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${filters.search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM organizations ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM organizations ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
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
    const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(data) {
    const result = await pool.query(
      `INSERT INTO organizations (name, description, logo_url, contact_email, contact_phone, address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.name, data.description || null, data.logoUrl || null, data.contactEmail || null, data.contactPhone || null, data.address || null]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      name: 'name', description: 'description', logoUrl: 'logo_url',
      contactEmail: 'contact_email', contactPhone: 'contact_phone', address: 'address',
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
      `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM organizations WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new OrganizationService();
