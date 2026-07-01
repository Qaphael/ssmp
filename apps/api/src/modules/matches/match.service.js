const { pool } = require('../../config/db');
const notificationService = require('../../services/notification.service');
const socketService = require('../../services/socket.service');
const disciplineService = require('../../services/discipline.service');
const { createAuditLog } = require('../../middleware/audit');

const VALID_TRANSITIONS = {
  scheduled: ['officials_assigned', 'cancelled', 'postponed', 'walkover'],
  officials_assigned: ['scheduled', 'lineups_submitted', 'cancelled', 'postponed', 'walkover'],
  lineups_submitted: ['officials_assigned', 'lineups_locked', 'cancelled', 'postponed', 'walkover'],
  lineups_locked: ['kickoff', 'cancelled', 'postponed', 'walkover'],
  kickoff: ['half_time', 'cancelled', 'abandoned'],
  half_time: ['second_half', 'cancelled', 'abandoned'],
  second_half: ['extra_time', 'full_time', 'cancelled', 'abandoned'],
  extra_time: ['penalties', 'full_time', 'cancelled', 'abandoned'],
  penalties: ['full_time', 'cancelled', 'abandoned'],
  full_time: ['report_submitted', 'walkover'],
  report_submitted: ['verified'],
  verified: ['published'],
  published: [],
  postponed: ['scheduled', 'cancelled'],
  cancelled: [],
  abandoned: [],
  walkover: [],
};

const REPORT_REQUIRED_TRANSITIONS = ['report_submitted'];

class MatchService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.competitionId) {
      conditions.push(`m.competition_id = $${paramIndex++}`);
      params.push(filters.competitionId);
    }
    if (filters.teamId) {
      conditions.push(`(m.home_team_id = $${paramIndex} OR m.away_team_id = $${paramIndex})`);
      params.push(filters.teamId);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`m.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.dateFrom) {
      conditions.push(`m.scheduled_at >= $${paramIndex++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`m.scheduled_at <= $${paramIndex++}`);
      params.push(filters.dateTo);
    }
    if (filters.matchday) {
      conditions.push(`f.matchday = $${paramIndex++}`);
      params.push(filters.matchday);
    }
    if (filters.officialId) {
      conditions.push(`m.official_id = $${paramIndex++}`);
      params.push(filters.officialId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'scheduled_at';
    const sortOrder = filters.sortOrder || 'desc';
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM matches m
       LEFT JOIN fixtures f ON f.id = m.fixture_id
       ${where}`, params
    );

    const result = await pool.query(
      `SELECT m.*,
              ht.name as home_team_name,
              at.name as away_team_name,
              p.name as pitch_name,
              o.name as official_name,
              f.matchday
       FROM matches m
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       LEFT JOIN pitches p ON p.id = m.pitch_id
       LEFT JOIN officials o ON o.id = m.official_id
       LEFT JOIN fixtures f ON f.id = m.fixture_id
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
      `SELECT m.*,
              ht.name as home_team_name,
              at.name as away_team_name,
              p.name as pitch_name,
              o.name as official_name,
              f.matchday
       FROM matches m
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       LEFT JOIN pitches p ON p.id = m.pitch_id
       LEFT JOIN officials o ON o.id = m.official_id
       LEFT JOIN fixtures f ON f.id = m.fixture_id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data, auditCtx) {
    const result = await pool.query(
      `INSERT INTO matches (fixture_id, competition_id, home_team_id, away_team_id, scheduled_at, pitch_id, official_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled') RETURNING *`,
      [
        data.fixtureId,
        data.competitionId,
        data.homeTeamId,
        data.awayTeamId,
        data.scheduledAt,
        data.pitchId || null,
        data.officialId || null,
      ]
    );
    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: 'match:create', entityType: 'match', entityId: result.rows[0].id, newValue: result.rows[0] });
    }
    return result.rows[0];
  }

  async updateStatus(id, newStatus, userId, userRole, auditCtx) {
    const match = await this.getById(id);
    if (!match) return null;

    if (userRole === 'official') {
      if (match.official_id !== userId) {
        throw Object.assign(new Error('Not authorized to update this match'), { status: 403 });
      }
    }

    const allowed = VALID_TRANSITIONS[match.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${match.status} → ${newStatus}. Allowed: ${allowed ? allowed.join(', ') : 'none'}`
      );
    }

    const now = new Date().toISOString();
    const updates = { status: newStatus };

    if (newStatus === 'kickoff') updates.started_at = now;
    if (newStatus === 'half_time') updates.half_time_at = now;
    if (newStatus === 'full_time') updates.ended_at = now;
    if (newStatus === 'officials_assigned' && match.status === 'scheduled') {
      // Track official assignment
    }

    const fields = ['status = $1'];
    const values = [newStatus];
    let paramIndex = 2;

    if (updates.started_at) {
      fields.push(`started_at = $${paramIndex++}`);
      values.push(updates.started_at);
    }
    if (updates.half_time_at) {
      fields.push(`half_time_at = $${paramIndex++}`);
      values.push(updates.half_time_at);
    }
    if (updates.ended_at) {
      fields.push(`ended_at = $${paramIndex++}`);
      values.push(updates.ended_at);
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE matches SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );

    const updated = result.rows[0];
    if (updated) {
      socketService.broadcastToMatch(id, 'match_status_change', {
        matchId: id,
        status: newStatus,
        timestamp: new Date().toISOString(),
      });

      if (newStatus === 'full_time') {
        await disciplineService.autoServeSuspensionsAfterMatch(id);
      }

      if (newStatus === 'cancelled') {
        notificationService.matchCancelled(updated, null);
      }
      if (newStatus === 'abandoned') {
        notificationService.matchAbandoned(updated, null);
      }
      if (auditCtx) {
        await createAuditLog({ ...auditCtx, action: 'match:update-status', entityType: 'match', entityId: id, oldValue: match, newValue: updated });
      }
    }

    return updated || null;
  }

  async assignOfficial(id, officialId, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const result = await pool.query(
      `UPDATE matches SET official_id = $1, status = 'officials_assigned', updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [officialId, id]
    );

    if (result.rows[0]) {
      notificationService.officialAssigned(result.rows[0], officialId);
      socketService.broadcastToMatch(id, 'match_status_change', {
        matchId: id,
        status: 'officials_assigned',
        timestamp: new Date().toISOString(),
      });
      if (auditCtx) {
        await createAuditLog({ ...auditCtx, action: 'match:assign-official', entityType: 'match', entityId: id, oldValue: old, newValue: result.rows[0] });
      }
    }

    return result.rows[0] || null;
  }

  async submitReport(id, reportData, userId, userRole, auditCtx) {
    const match = await this.getById(id);
    if (!match) return null;

    if (userRole === 'official') {
      if (match.official_id !== userId) {
        throw Object.assign(new Error('Not authorized to submit report for this match'), { status: 403 });
      }
    }

    if (match.status !== 'full_time') {
      throw new Error(`Match must be full_time to submit report. Current status: ${match.status}`);
    }

    const result = await pool.query(
      `UPDATE matches
       SET status = 'report_submitted',
           home_score = $1,
           away_score = $2,
           report_submitted_at = NOW(),
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
       [reportData.homeScore, reportData.awayScore, id]
    );

    const updated = result.rows[0];
    if (updated) {
      socketService.broadcastToMatch(id, 'match_status_change', {
        matchId: id,
        status: 'report_submitted',
        timestamp: new Date().toISOString(),
      });
      socketService.broadcastToMatch(id, 'score_update', {
        matchId: id,
        homeScore: reportData.homeScore,
        awayScore: reportData.awayScore,
      });
      if (auditCtx) {
        await createAuditLog({ ...auditCtx, action: 'match:submit-report', entityType: 'match', entityId: id, oldValue: match, newValue: updated });
      }
    }

    return updated || null;
  }

  async verify(id, verifiedBy, auditCtx) {
    const match = await this.getById(id);
    if (!match) return null;

    if (match.status !== 'report_submitted') {
      throw new Error(`Match must be report_submitted to verify. Current status: ${match.status}`);
    }

    const result = await pool.query(
      `UPDATE matches
       SET status = 'verified',
           verified_at = NOW(),
           verified_by = $1,
           updated_at = NOW()
       WHERE id = $2 RETURNING *`,
       [verifiedBy, id]
    );

    const updated = result.rows[0];
    if (updated) {
      socketService.broadcastToMatch(id, 'match_status_change', {
        matchId: id,
        status: 'verified',
        timestamp: new Date().toISOString(),
      });
      if (auditCtx) {
        await createAuditLog({ ...auditCtx, action: 'match:verify', entityType: 'match', entityId: id, oldValue: match, newValue: updated });
      }
    }

    return updated || null;
  }

  async publish(id, auditCtx) {
    const match = await this.getById(id);
    if (!match) return null;

    if (match.status !== 'verified') {
      throw new Error(`Match must be verified to publish. Current status: ${match.status}`);
    }

    const result = await pool.query(
      `UPDATE matches
       SET status = 'published',
           published_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    const published = result.rows[0];
    if (published) {
      await this.updateStandings(published);
      socketService.broadcastToMatch(id, 'match_status_change', {
        matchId: id,
        status: 'published',
        timestamp: new Date().toISOString(),
      });
      if (auditCtx) {
        await createAuditLog({ ...auditCtx, action: 'match:publish', entityType: 'match', entityId: id, oldValue: match, newValue: published });
      }
    }

    return published || null;
  }

  async recordWalkover(id, walkoverTeamId, walkoverReason, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const match = await this.getById(id);
    if (!match) return null;

    const result = await pool.query(
      `UPDATE matches
       SET status = 'walkover',
           walkover_team_id = $1,
           walkover_reason = $2,
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [walkoverTeamId, walkoverReason, id]
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'match:walkover', entityType: 'match', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    if (result.rows[0]) {
      notificationService.matchWalkover(result.rows[0], walkoverTeamId, walkoverReason);
    }
    return result.rows[0] || null;
  }

  async postpone(id, postponedReason, newScheduledAt, auditCtx) {
    const old = auditCtx ? await this.getById(id) : null;
    const match = await this.getById(id);
    if (!match) return null;

    const fields = [`status = 'postponed'`, `postponed_reason = $1`];
    const values = [postponedReason];
    let paramIndex = 2;

    if (newScheduledAt) {
      fields.push(`scheduled_at = $${paramIndex++}`);
      values.push(newScheduledAt);
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE matches SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );
    if (auditCtx && result.rows[0]) {
      await createAuditLog({ ...auditCtx, action: 'match:postpone', entityType: 'match', entityId: id, oldValue: old, newValue: result.rows[0] });
    }
    if (result.rows[0]) {
      notificationService.matchPostponed(result.rows[0], postponedReason, newScheduledAt);
    }
    return result.rows[0] || null;
  }

  async correctScore(id, homeScore, awayScore, auditCtx) {
    const match = await this.getById(id);
    if (!match) return null;

    if (match.status !== 'published') {
      throw Object.assign(
        new Error(`Match must be published to correct score. Current status: ${match.status}`),
        { status: 422 }
      );
    }

    const oldHomeScore = match.home_score;
    const oldAwayScore = match.away_score;

    const result = await pool.query(
      `UPDATE matches SET home_score = $1, away_score = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [homeScore, awayScore, id]
    );
    const updated = result.rows[0];
    if (!updated) return null;

    await this._recomputeStandings(match, oldHomeScore, oldAwayScore, homeScore, awayScore);

    socketService.broadcastToMatch(id, 'score_update', {
      matchId: id,
      homeScore,
      awayScore,
    });

    if (auditCtx) {
      await createAuditLog({
        ...auditCtx,
        action: 'match:correct-score',
        entityType: 'match',
        entityId: id,
        oldValue: { home_score: oldHomeScore, away_score: oldAwayScore },
        newValue: { home_score: homeScore, away_score: awayScore },
      });
    }

    return updated;
  }

  async _recomputeStandings(match, oldHome, oldAway, newHome, newAway) {
    const compResult = await pool.query(
      `SELECT rules FROM competitions WHERE id = $1`, [match.competition_id]
    );
    const rules = compResult.rows[0]?.rules || {};
    const ptsWin = rules.pointsForWin ?? 3;
    const ptsDraw = rules.pointsForDraw ?? 1;
    const ptsLoss = rules.pointsForLoss ?? 0;

    const outcome = (gf, ga) => {
      if (gf > ga) return { w: 1, d: 0, l: 0, pts: ptsWin };
      if (gf < ga) return { w: 0, d: 0, l: 1, pts: ptsLoss };
      return { w: 0, d: 1, l: 0, pts: ptsDraw };
    };

    const oh = outcome(oldHome, oldAway);
    const oa = outcome(oldAway, oldHome);
    const nh = outcome(newHome, newAway);
    const na = outcome(newAway, newHome);

    const applyDelta = async (teamId, old, fresh, teamGfOld, teamGaOld, teamGfNew, teamGaNew) => {
      await pool.query(
        `UPDATE standings SET
           won = won + $1, drawn = drawn + $2, lost = lost + $3,
           goals_for = goals_for + $4, goals_against = goals_against + $5,
           goal_difference = goal_difference + $6, points = points + $7,
           updated_at = NOW()
         WHERE competition_id = $8 AND team_id = $9`,
        [
          fresh.w - old.w,
          fresh.d - old.d,
          fresh.l - old.l,
          teamGfNew - teamGfOld,
          teamGaNew - teamGaOld,
          (teamGfNew - teamGaNew) - (teamGfOld - teamGaOld),
          fresh.pts - old.pts,
          match.competition_id,
          teamId,
        ]
      );
    };

    await applyDelta(match.home_team_id, oh, nh, oldHome, oldAway, newHome, newAway);
    await applyDelta(match.away_team_id, oa, na, oldAway, oldHome, newAway, newHome);

    console.log(`[STANDINGS] Recomputed standings for competition ${match.competition_id} after score correction on match ${match.id}`);
  }

  async updateStandings(match) {
    const compResult = await pool.query(
      `SELECT rules FROM competitions WHERE id = $1`, [match.competition_id]
    );
    const rules = compResult.rows[0]?.rules || {};
    const pointsForWin = rules.pointsForWin ?? 3;
    const pointsForDraw = rules.pointsForDraw ?? 1;
    const pointsForLoss = rules.pointsForLoss ?? 0;

    const homeScore = match.home_score;
    const awayScore = match.away_score;

    let homePoints, awayPoints;
    if (homeScore > awayScore) {
      homePoints = pointsForWin;
      awayPoints = pointsForLoss;
    } else if (homeScore < awayScore) {
      homePoints = pointsForLoss;
      awayPoints = pointsForWin;
    } else {
      homePoints = pointsForDraw;
      awayPoints = pointsForDraw;
    }

    const upsertStanding = async (teamId, won, drawn, lost, gf, ga, points) => {
      await pool.query(
        `INSERT INTO standings (competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
         VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (competition_id, team_id)
         DO UPDATE SET
           played = standings.played + 1,
           won = standings.won + $3,
           drawn = standings.drawn + $4,
           lost = standings.lost + $5,
           goals_for = standings.goals_for + $6,
           goals_against = standings.goals_against + $7,
           goal_difference = standings.goal_difference + $8,
           points = standings.points + $9,
           updated_at = NOW()`,
        [match.competition_id, teamId, won, drawn, lost, gf, ga, ga > gf ? -(ga - gf) : gf - ga, points]
      );
    };

    const homeWon = homeScore > awayScore ? 1 : 0;
    const homeDrawn = homeScore === awayScore ? 1 : 0;
    const homeLost = homeScore < awayScore ? 1 : 0;
    const awayWon = awayScore > homeScore ? 1 : 0;
    const awayDrawn = awayScore === homeScore ? 1 : 0;
    const awayLost = awayScore < homeScore ? 1 : 0;

    await upsertStanding(match.home_team_id, homeWon, homeDrawn, homeLost, homeScore, awayScore, homePoints);
    await upsertStanding(match.away_team_id, awayWon, awayDrawn, awayLost, awayScore, homeScore, awayPoints);

    console.log(`[STANDINGS] Updated standings for competition ${match.competition_id} after match ${match.id}`);
  }
}

module.exports = new MatchService();
