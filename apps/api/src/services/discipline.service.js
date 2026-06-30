const { pool } = require('../config/db');
const socketService = require('./socket.service');
const notificationService = require('./notification.service');

class DisciplineService {
  async processCard(matchId, playerId, teamId, cardType, minute, competitionId) {
    const cardResult = await pool.query(
      `INSERT INTO cards (match_id, player_id, team_id, type, minute, competition_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [matchId, playerId, teamId, cardType, minute, competitionId]
    );
    const card = cardResult.rows[0];

    const compResult = await pool.query(
      `SELECT rules FROM competitions WHERE id = $1`, [competitionId]
    );
    const rules = compResult.rows[0]?.rules || {};
    const yellowThreshold = rules.yellowCardsForSuspension ?? 2;
    const suspensionDuration = rules.suspensionMatches ?? 1;
    const redImmediate = rules.redCardImmediateSuspension ?? true;

    if (cardType === 'yellow') {
      const countResult = await pool.query(
        `SELECT COUNT(*) as yellow_count FROM cards
         WHERE player_id = $1 AND competition_id = $2 AND type = 'yellow'`,
        [playerId, competitionId]
      );
      const yellowCount = parseInt(countResult.rows[0].yellow_count, 10);

      if (yellowCount >= yellowThreshold) {
        const existingActive = await pool.query(
          `SELECT id FROM suspensions
           WHERE player_id = $1 AND competition_id = $2 AND is_served = FALSE`,
          [playerId, competitionId]
        );
        if (existingActive.rows.length === 0) {
          await this.createSuspension(
            playerId,
            competitionId,
            `${yellowCount} yellow cards accumulated (threshold: ${yellowThreshold})`,
            suspensionDuration,
            card.id
          );
        }
      }
    }

    if (cardType === 'red' && redImmediate) {
      const existingActive = await pool.query(
        `SELECT id FROM suspensions
         WHERE player_id = $1 AND competition_id = $2 AND is_served = FALSE`,
        [playerId, competitionId]
      );
      if (existingActive.rows.length === 0) {
        await this.createSuspension(
          playerId,
          competitionId,
          `Red card (immediate suspension)`,
          suspensionDuration,
          card.id
        );
      }
    }

    return card;
  }

  async createSuspension(playerId, competitionId, reason, matchesCount, cardId) {
    const result = await pool.query(
      `INSERT INTO suspensions (player_id, competition_id, reason, matches_count, card_id, start_date)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [playerId, competitionId, reason, matchesCount, cardId || null]
    );
    const suspension = result.rows[0];

    await pool.query(
      `UPDATE players SET status = 'suspended', suspension_details = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify({ suspensionId: suspension.id, reason, matchesCount }), playerId]
    );

    socketService.broadcastToAll('suspension_applied', {
      playerId,
      competitionId,
      reason,
      matchesCount,
    });

    // Look up team_id for the player to trigger notifications
    const playerResult = await pool.query(`SELECT team_id FROM players WHERE id = $1`, [playerId]);
    const teamId = playerResult.rows[0]?.team_id;
    if (teamId) {
      await notificationService.suspensionApplied(playerId, teamId, reason, matchesCount);
    }

    console.log(`[DISCIPLINE] Suspension created for player ${playerId}: ${reason} (${matchesCount} matches)`);

    return suspension;
  }

  async isPlayerSuspended(playerId, competitionId) {
    const result = await pool.query(
      `SELECT id, reason, matches_count, matches_served
       FROM suspensions
       WHERE player_id = $1 AND competition_id = $2 AND is_served = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [playerId, competitionId]
    );
    if (result.rows.length === 0) return null;
    const suspension = result.rows[0];
    if (suspension.matches_served >= suspension.matches_count) return null;
    return suspension;
  }

  async getActiveSuspensions(competitionId) {
    const result = await pool.query(
      `SELECT s.*, p.first_name, p.last_name, p.jersey_number, t.name as team_name
       FROM suspensions s
       JOIN players p ON p.id = s.player_id
       JOIN teams t ON t.id = p.team_id
       WHERE s.competition_id = $1 AND s.is_served = FALSE
       ORDER BY s.created_at DESC`,
      [competitionId]
    );
    return result.rows;
  }

  async getSuspensionsByPlayer(playerId, competitionId) {
    const result = await pool.query(
      `SELECT * FROM suspensions
       WHERE player_id = $1 AND competition_id = $2
       ORDER BY created_at DESC`,
      [playerId, competitionId]
    );
    return result.rows;
  }

  async serveSuspension(suspensionId) {
    const suspension = await pool.query(
      `SELECT * FROM suspensions WHERE id = $1`, [suspensionId]
    );
    if (!suspension.rows[0]) return null;

    const s = suspension.rows[0];
    const newServed = s.matches_served + 1;
    const isNowServed = newServed >= s.matches_count;

    const result = await pool.query(
      `UPDATE suspensions
       SET matches_served = $1, is_served = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [newServed, isNowServed, suspensionId]
    );

    if (isNowServed) {
      await pool.query(
        `UPDATE players SET status = 'active', suspension_details = NULL, updated_at = NOW()
         WHERE id = $1`,
        [s.player_id]
      );
      console.log(`[DISCIPLINE] Suspension ${suspensionId} fully served for player ${s.player_id}`);
    }

    return result.rows[0];
  }

  async autoServeSuspensionsAfterMatch(matchId) {
    const matchResult = await pool.query(
      `SELECT competition_id, home_team_id, away_team_id FROM matches WHERE id = $1`,
      [matchId]
    );
    if (!matchResult.rows[0]) return;

    const { competition_id, home_team_id, away_team_id } = matchResult.rows[0];

    const teamIds = [home_team_id, away_team_id];

    for (const teamId of teamIds) {
      const playersResult = await pool.query(
        `SELECT id FROM players WHERE team_id = $1`, [teamId]
      );
      for (const player of playersResult.rows) {
        const activeSuspension = await this.isPlayerSuspended(player.id, competition_id);
        if (activeSuspension) {
          await this.serveSuspension(activeSuspension.id);
        }
      }
    }
  }

  async getSuspendedPlayerIds(competitionId) {
    const result = await pool.query(
      `SELECT DISTINCT player_id FROM suspensions
       WHERE competition_id = $1 AND is_served = FALSE
       AND matches_served < matches_count`,
      [competitionId]
    );
    return result.rows.map((r) => r.player_id);
  }

  async listAllSuspensions() {
    const result = await pool.query(
      `SELECT s.*, p.first_name, p.last_name, p.jersey_number, t.name as team_name
       FROM suspensions s
       JOIN players p ON p.id = s.player_id
       JOIN teams t ON t.id = p.team_id
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  }

  async deleteSuspension(suspensionId) {
    const result = await pool.query(
      `DELETE FROM suspensions WHERE id = $1 RETURNING *`,
      [suspensionId]
    );
    return result.rows[0] || null;
  }

  async getPlayerCardCount(playerId, competitionId) {
    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE type = 'yellow') as yellow_cards,
         COUNT(*) FILTER (WHERE type = 'red') as red_cards
       FROM cards
       WHERE player_id = $1 AND competition_id = $2`,
      [playerId, competitionId]
    );
    return result.rows[0] || { yellow_cards: 0, red_cards: 0 };
  }

  async getCompetitionCardLeaderboard(competitionId) {
    const result = await pool.query(
      `SELECT
         c.player_id,
         p.first_name,
         p.last_name,
         p.jersey_number,
         t.name as team_name,
         COUNT(*) FILTER (WHERE c.type = 'yellow') as yellow_cards,
         COUNT(*) FILTER (WHERE c.type = 'red') as red_cards,
         COUNT(*) as total_cards
       FROM cards c
       JOIN players p ON p.id = c.player_id
       JOIN teams t ON t.id = c.team_id
       WHERE c.competition_id = $1
       GROUP BY c.player_id, p.first_name, p.last_name, p.jersey_number, t.name
       ORDER BY total_cards DESC, red_cards DESC, yellow_cards DESC`,
      [competitionId]
    );
    return result.rows;
  }
}

module.exports = new DisciplineService();
