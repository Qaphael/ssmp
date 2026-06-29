const { pool } = require('../../config/db');
const notificationService = require('../../services/notification.service');

const VALID_TRANSITIONS = {
  scheduled: ['officials_assigned', 'cancelled', 'postponed'],
  officials_assigned: ['scheduled', 'cancelled', 'postponed'],
};

class FixtureService {
  async list(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.competitionId) {
      conditions.push(`f.competition_id = $${paramIndex++}`);
      params.push(filters.competitionId);
    }
    if (filters.matchday) {
      conditions.push(`f.matchday = $${paramIndex++}`);
      params.push(filters.matchday);
    }
    if (filters.status) {
      conditions.push(`f.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.dateFrom) {
      conditions.push(`f.scheduled_at >= $${paramIndex++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`f.scheduled_at <= $${paramIndex++}`);
      params.push(filters.dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortBy = filters.sortBy || 'matchday';
    const sortOrder = filters.sortOrder || 'asc';
    const limit = filters.limit || 50;
    const offset = ((filters.page || 1) - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM fixtures f ${where}`, params
    );

    const result = await pool.query(
      `SELECT f.*,
              ht.name as home_team_name,
              at.name as away_team_name,
              p.name as pitch_name,
              o.name as official_name
       FROM fixtures f
       LEFT JOIN teams ht ON ht.id = f.home_team_id
       LEFT JOIN teams at ON at.id = f.away_team_id
       LEFT JOIN pitches p ON p.id = f.pitch_id
       LEFT JOIN officials o ON o.id = f.official_id
       ${where}
       ORDER BY f.${sortBy} ${sortOrder}
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
      `SELECT f.*,
              ht.name as home_team_name,
              at.name as away_team_name,
              p.name as pitch_name,
              o.name as official_name
       FROM fixtures f
       LEFT JOIN teams ht ON ht.id = f.home_team_id
       LEFT JOIN teams at ON at.id = f.away_team_id
       LEFT JOIN pitches p ON p.id = f.pitch_id
       LEFT JOIN officials o ON o.id = f.official_id
       WHERE f.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const result = await pool.query(
      `INSERT INTO fixtures (competition_id, matchday, home_team_id, away_team_id, scheduled_at, pitch_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled') RETURNING *`,
      [data.competitionId, data.matchday, data.homeTeamId, data.awayTeamId, data.scheduledAt, data.pitchId || null]
    );
    return result.rows[0];
  }

  async bulkCreate(data) {
    const created = [];
    for (const fixture of data.fixtures) {
      const result = await pool.query(
        `INSERT INTO fixtures (competition_id, matchday, home_team_id, away_team_id, scheduled_at, pitch_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled') RETURNING *`,
        [data.competitionId, fixture.matchday, fixture.homeTeamId, fixture.awayTeamId, fixture.scheduledAt, fixture.pitchId || null]
      );
      created.push(result.rows[0]);
    }
    return created;
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      matchday: 'matchday',
      homeTeamId: 'home_team_id',
      awayTeamId: 'away_team_id',
      scheduledAt: 'scheduled_at',
      pitchId: 'pitch_id',
      status: 'status',
      officialId: 'official_id',
      postponedReason: 'postponed_reason',
      walkoverTeamId: 'walkover_team_id',
      walkoverReason: 'walkover_reason',
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
      `UPDATE fixtures SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
    );

    const updated = result.rows[0];
    if (updated && data.officialId) {
      notificationService.officialAssigned(updated, data.officialId);
    }
    if (updated && (data.scheduledAt || data.pitchId || data.homeTeamId || data.awayTeamId)) {
      notificationService.fixtureChanged(updated, data);
    }

    return updated || null;
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM fixtures WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async generateRoundRobin(competitionId, startDate) {
    const teamsResult = await pool.query(
      `SELECT id FROM teams WHERE competition_id = $1 AND registration_status = 'approved'`,
      [competitionId]
    );
    const teams = teamsResult.rows.map((t) => t.id);

    if (teams.length < 2) {
      throw new Error('At least 2 teams required for round-robin generation');
    }

    const existingResult = await pool.query(
      `SELECT COUNT(*) FROM fixtures WHERE competition_id = $1`, [competitionId]
    );
    if (parseInt(existingResult.rows[0].count, 10) > 0) {
      throw new Error('Competition already has fixtures. Delete existing fixtures first.');
    }

    const schedule = roundRobinSchedule(teams);
    const created = [];
    const baseDate = new Date(startDate);

    for (let matchday = 0; matchday < schedule.length; matchday++) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + matchday * 7);

      for (const [homeIdx, awayIdx] of schedule[matchday]) {
        const result = await pool.query(
          `INSERT INTO fixtures (competition_id, matchday, home_team_id, away_team_id, scheduled_at, status)
           VALUES ($1, $2, $3, $4, $5, 'scheduled') RETURNING *`,
          [competitionId, matchday + 1, homeIdx, awayIdx, dayDate.toISOString()]
        );
        created.push(result.rows[0]);
      }
    }

    return created;
  }

  async detectConflicts(competitionId) {
    const result = await pool.query(
      `SELECT f.*,
              ht.name as home_team_name,
              at.name as away_team_name,
              p.name as pitch_name
       FROM fixtures f
       LEFT JOIN teams ht ON ht.id = f.home_team_id
       LEFT JOIN teams at ON at.id = f.away_team_id
       LEFT JOIN pitches p ON p.id = f.pitch_id
       WHERE f.competition_id = $1
       ORDER BY f.scheduled_at`,
      [competitionId]
    );

    const fixtures = result.rows;
    const conflicts = [];

    for (let i = 0; i < fixtures.length; i++) {
      for (let j = i + 1; j < fixtures.length; j++) {
        const a = fixtures[i];
        const b = fixtures[j];

        const timeOverlap = new Date(a.scheduled_at) < new Date(b.scheduled_at).getTime() + 90 * 60 * 1000 &&
                           new Date(b.scheduled_at) < new Date(a.scheduled_at).getTime() + 90 * 60 * 1000;

        if (!timeOverlap) continue;

        if (a.pitch_id && a.pitch_id === b.pitch_id) {
          conflicts.push({
            type: 'pitch_clash',
            fixture1: a,
            fixture2: b,
            reason: `Both fixtures assigned to pitch "${a.pitch_name || a.pitch_id}" at overlapping times`,
          });
        }

        const teams1 = [a.home_team_id, a.away_team_id];
        const teams2 = [b.home_team_id, b.away_team_id];
        const sharedTeams = teams1.filter((t) => teams2.includes(t));

        if (sharedTeams.length > 0) {
          conflicts.push({
            type: 'team_clash',
            fixture1: a,
            fixture2: b,
            reason: `Team(s) ${sharedTeams.join(', ')} play in both fixtures at overlapping times`,
          });
        }
      }
    }

    return conflicts;
  }
}

function roundRobinSchedule(teamIds) {
  const n = teamIds.length;
  const teams = [...teamIds];

  if (n % 2 !== 0) {
    teams.push(null);
  }

  const rounds = teams.length - 1;
  const matchesPerRound = teams.length / 2;
  const schedule = [];

  for (let round = 0; round < rounds; round++) {
    const roundMatches = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const home = teams[match];
      const away = teams[teams.length - 1 - match];

      if (home !== null && away !== null) {
        if (round % 2 === 0) {
          roundMatches.push([home, away]);
        } else {
          roundMatches.push([away, home]);
        }
      }
    }
    schedule.push(roundMatches);

    teams.splice(1, 0, teams.pop());
  }

  return schedule;
}

module.exports = new FixtureService();
