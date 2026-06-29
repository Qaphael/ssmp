const { pool } = require('../../config/db');
const socketService = require('../../services/socket.service');
const notificationService = require('../../services/notification.service');
const { createAuditLog } = require('../../middleware/audit');

class TransferService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.competitionId) {
      conditions.push(`tr.competition_id = $${paramIndex++}`);
      params.push(filters.competitionId);
    }
    if (filters.status) {
      conditions.push(`tr.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.playerId) {
      conditions.push(`tr.player_id = $${paramIndex++}`);
      params.push(filters.playerId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transfer_requests tr ${where}`, params
    );

    const result = await pool.query(
      `SELECT tr.*,
              p.first_name as player_first_name,
              p.last_name as player_last_name,
              p.jersey_number as player_jersey_number,
              ht.name as from_team_name,
              tt.name as to_team_name,
              c.name as competition_name
       FROM transfer_requests tr
       LEFT JOIN players p ON p.id = tr.player_id
       LEFT JOIN teams ht ON ht.id = tr.from_team_id
       LEFT JOIN teams tt ON tt.id = tr.to_team_id
       LEFT JOIN competitions c ON c.id = tr.competition_id
       ${where}
       ORDER BY tr.${sortBy} ${sortOrder}
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
      `SELECT tr.*,
              p.first_name as player_first_name,
              p.last_name as player_last_name,
              ht.name as from_team_name,
              tt.name as to_team_name,
              c.name as competition_name
       FROM transfer_requests tr
       LEFT JOIN players p ON p.id = tr.player_id
       LEFT JOIN teams ht ON ht.id = tr.from_team_id
       LEFT JOIN teams tt ON tt.id = tr.to_team_id
       LEFT JOIN competitions c ON c.id = tr.competition_id
       WHERE tr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data, requestedBy, auditCtx) {
    const result = await pool.query(
      `INSERT INTO transfer_requests (player_id, from_team_id, to_team_id, competition_id, reason, requested_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [data.playerId, data.fromTeamId, data.toTeamId, data.competitionId, data.reason, requestedBy]
    );
    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: 'transfer:create', entityType: 'transfer_request', entityId: result.rows[0].id, newValue: result.rows[0] });
    }
    return result.rows[0];
  }

  async review(id, status, rejectionReason, reviewedBy, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const transfer = await this.getById(id);
    if (!transfer) return null;
    if (transfer.status !== 'pending') {
      throw Object.assign(new Error('Transfer request has already been reviewed'), { status: 400 });
    }

    const result = await pool.query(
      `UPDATE transfer_requests
       SET status = $1,
           reviewed_by = $2,
           reviewed_at = NOW(),
           rejection_reason = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, reviewedBy, rejectionReason || null, id]
    );

    const updated = result.rows[0];
    if (!updated) return null;

    if (status === 'approved') {
      await pool.query(
        `UPDATE players SET team_id = $1, updated_at = NOW() WHERE id = $2`,
        [transfer.to_team_id, transfer.player_id]
      );

      socketService.broadcastToAll('transfer_approved', {
        transferId: id,
        playerId: transfer.player_id,
        fromTeamId: transfer.from_team_id,
        toTeamId: transfer.to_team_id,
      });

      await notificationService.transferApproved(updated);
    } else {
      socketService.broadcastToAll('transfer_rejected', {
        transferId: id,
        playerId: transfer.player_id,
        rejectionReason,
      });

      await notificationService.transferRejected(updated, rejectionReason);
    }

    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: `transfer:${status}`, entityType: 'transfer_request', entityId: id, oldValue: old, newValue: updated });
    }

    return updated;
  }
}

module.exports = new TransferService();
