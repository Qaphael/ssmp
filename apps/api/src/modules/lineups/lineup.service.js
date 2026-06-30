const { pool } = require('../../config/db');
const matchService = require('../matches/match.service');
const disciplineService = require('../../services/discipline.service');

class LineupService {
  async submit(matchId, data, userId) {
    const match = await matchService.getById(matchId);
    if (!match) {
      throw Object.assign(new Error('Match not found'), { status: 404 });
    }

    if (!['officials_assigned', 'lineups_submitted'].includes(match.status)) {
      throw Object.assign(
        new Error(`Cannot submit lineups when match status is ${match.status}`),
        { status: 400 }
      );
    }

    if (data.teamId !== match.home_team_id && data.teamId !== match.away_team_id) {
      throw Object.assign(new Error('Team is not part of this match'), { status: 400 });
    }

    const competitionId = match.competition_id;

    for (const player of data.players) {
      const suspension = await disciplineService.isPlayerSuspended(player.playerId, competitionId);
      if (suspension) {
        throw Object.assign(
          new Error(`Player ${player.playerId} is currently suspended: ${suspension.reason}`),
          { status: 400 }
        );
      }

      const playerResult = await pool.query(
        'SELECT id, status FROM players WHERE id = $1',
        [player.playerId]
      );
      if (playerResult.rows.length === 0) {
        throw Object.assign(new Error(`Player ${player.playerId} not found`), { status: 404 });
      }
      if (playerResult.rows[0].status === 'injured') {
        throw Object.assign(
          new Error(`Player ${player.playerId} is currently injured and cannot be included in the lineup`),
          { status: 400 }
        );
      }
    }

    await pool.query(
      'DELETE FROM lineups WHERE match_id = $1 AND team_id = $2',
      [matchId, data.teamId]
    );

    for (const player of data.players) {
      await pool.query(
        'INSERT INTO lineups (match_id, team_id, player_id, is_starting) VALUES ($1, $2, $3, $4)',
        [matchId, data.teamId, player.playerId, player.isStarting]
      );
    }

    if (match.status === 'officials_assigned') {
      await matchService.updateStatus(matchId, 'lineups_submitted', userId);
    }

    return this.getByMatch(matchId);
  }

  async getByMatch(matchId) {
    const match = await matchService.getById(matchId);
    if (!match) {
      throw Object.assign(new Error('Match not found'), { status: 404 });
    }

    const result = await pool.query(
      `SELECT l.id, l.match_id, l.team_id, l.player_id, l.is_starting, l.created_at,
              p.first_name, p.last_name, p.jersey_number
       FROM lineups l
       LEFT JOIN players p ON p.id = l.player_id
       WHERE l.match_id = $1
       ORDER BY l.team_id, l.is_starting DESC, p.jersey_number`,
      [matchId]
    );

    const entries = result.rows.map((row) => ({
      id: row.id,
      matchId: row.match_id,
      teamId: row.team_id,
      playerId: row.player_id,
      isStarting: row.is_starting,
      playerName: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : null,
      jerseyNumber: row.jersey_number,
      createdAt: row.created_at,
    }));

    return {
      matchId,
      isLocked: match.status === 'lineups_locked',
      entries,
    };
  }

  async lock(matchId, userId) {
    const match = await matchService.getById(matchId);
    if (!match) {
      throw Object.assign(new Error('Match not found'), { status: 404 });
    }

    if (match.status !== 'lineups_submitted') {
      throw Object.assign(
        new Error(`Cannot lock lineups when match status is ${match.status}`),
        { status: 400 }
      );
    }

    const lineupCount = await pool.query(
      'SELECT COUNT(*) FROM lineups WHERE match_id = $1',
      [matchId]
    );
    if (parseInt(lineupCount.rows[0].count, 10) === 0) {
      throw Object.assign(new Error('No lineups submitted for this match'), { status: 400 });
    }

    await matchService.updateStatus(matchId, 'lineups_locked', userId);

    return this.getByMatch(matchId);
  }
}

module.exports = new LineupService();
