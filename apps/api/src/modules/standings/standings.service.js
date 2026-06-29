const { pool } = require('../../config/db');

async function getByCompetition(competitionId) {
  const result = await pool.query(
    `SELECT s.*, t.name AS team_name, t.school_name, t.logo_url, t.primary_color, t.secondary_color
     FROM standings s
     JOIN teams t ON t.id = s.team_id
     WHERE s.competition_id = $1
     ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC`,
    [competitionId]
  );

  return result.rows.map((row) => ({
    team: {
      id: row.team_id,
      name: row.team_name,
      schoolName: row.school_name,
      logoUrl: row.logo_url,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
    },
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    points: row.points,
  }));
}

module.exports = { getByCompetition };
