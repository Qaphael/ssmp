const { pool } = require('../../config/db');
const socketService = require('../../services/socket.service');
const disciplineService = require('../../services/discipline.service');
const { createAuditLog } = require('../../middleware/audit');

class MatchEventService {
  async create(matchId, data, recordedBy, auditCtx) {
    const matchResult = await pool.query(
      `SELECT competition_id FROM matches WHERE id = $1`, [matchId]
    );
    const competitionId = matchResult.rows[0]?.competition_id;

    const result = await pool.query(
      `INSERT INTO match_events (match_id, type, minute, player_id, team_id, description, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [matchId, data.type, data.minute, data.playerId || null, data.teamId || null, data.description || null, recordedBy]
    );
    const event = result.rows[0];

    socketService.broadcastToMatch(matchId, 'match_event', { matchId, event });

    if (auditCtx) {
      await createAuditLog({ ...auditCtx, action: 'match:record-event', entityType: 'match_event', entityId: event.id, newValue: event });
    }

    if (data.type === 'goal' || data.type === 'own_goal' || data.type === 'penalty_scored') {
      const score = await this.recalculateScore(matchId);
      if (score) {
        socketService.broadcastToMatch(matchId, 'score_update', {
          matchId,
          homeScore: score.homeScore,
          awayScore: score.awayScore,
        });
      }
    }

    if ((data.type === 'yellow_card' || data.type === 'red_card') && data.playerId && competitionId) {
      const cardType = data.type === 'yellow_card' ? 'yellow' : 'red';
      const card = await disciplineService.processCard(
        matchId, data.playerId, data.teamId, cardType, data.minute, competitionId
      );
      socketService.broadcastToMatch(matchId, 'card_issued', {
        matchId,
        card,
        playerId: data.playerId,
        cardType,
      });
    }

    return event;
  }

  async listByMatch(matchId) {
    const result = await pool.query(
      `SELECT me.*, p.first_name, p.last_name, t.name as team_name
       FROM match_events me
       LEFT JOIN players p ON p.id = me.player_id
       LEFT JOIN teams t ON t.id = me.team_id
       WHERE me.match_id = $1
       ORDER BY me.minute ASC, me.created_at ASC`,
      [matchId]
    );
    return result.rows;
  }

  async recalculateScore(matchId) {
    const eventsResult = await pool.query(
      `SELECT * FROM match_events WHERE match_id = $1`, [matchId]
    );
    const matchResult = await pool.query(
      `SELECT * FROM matches WHERE id = $1`, [matchId]
    );
    if (!matchResult.rows[0]) return null;

    const match = matchResult.rows[0];
    const events = eventsResult.rows;

    let homeScore = 0;
    let awayScore = 0;

    for (const event of events) {
      const isGoal = event.type === 'goal' || event.type === 'penalty_scored';
      const isOwnGoal = event.type === 'own_goal';

      if (isGoal) {
        if (event.team_id === match.home_team_id) homeScore++;
        else if (event.team_id === match.away_team_id) awayScore++;
      } else if (isOwnGoal) {
        if (event.team_id === match.home_team_id) awayScore++;
        else if (event.team_id === match.away_team_id) homeScore++;
      }
    }

    await pool.query(
      `UPDATE matches SET home_score = $1, away_score = $2, updated_at = NOW() WHERE id = $3`,
      [homeScore, awayScore, matchId]
    );

    return { homeScore, awayScore };
  }
}

module.exports = new MatchEventService();
