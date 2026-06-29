/**
 * In-memory mock database for integration tests.
 * Simulates PostgreSQL queries with Map-based storage.
 */

class MockDB {
  constructor() {
    this.tables = {
      organizations: new Map(),
      seasons: new Map(),
      competitions: new Map(),
      teams: new Map(),
      players: new Map(),
      fixtures: new Map(),
      matches: new Map(),
      match_events: new Map(),
      cards: new Map(),
      suspensions: new Map(),
      standings: new Map(),
      notifications: new Map(),
    };
    this.autoId = 1;
  }

  reset() {
    for (const table of Object.values(this.tables)) table.clear();
    this.autoId = 1;
  }

  uuid() {
    return `00000000-0000-0000-0000-${String(this.autoId++).padStart(12, '0')}`;
  }

  insert(table, data) {
    const id = data.id || this.uuid();
    const now = new Date().toISOString();
    const row = { id, created_at: now, updated_at: now, ...data };
    this.tables[table].set(id, row);
    return row;
  }

  findAll(table, filters = {}) {
    let rows = Array.from(this.tables[table].values());
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        rows = rows.filter((r) => r[key] === value);
      }
    }
    return rows;
  }

  findById(table, id) {
    return this.tables[table].get(id) || null;
  }

  update(table, id, data) {
    const existing = this.tables[table].get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.tables[table].set(id, updated);
    return updated;
  }

  delete(table, id) {
    return this.tables[table].delete(id);
  }
}

const db = new MockDB();

// Mock the pg pool to intercept queries
const mockPool = {
  query: async (sql, params) => {
    // Route queries to the in-memory mock based on table detection
    const lowerSql = sql.toLowerCase();

    if (lowerSql.includes('insert into organizations')) {
      const row = db.insert('organizations', {
        name: params[0],
        description: params[1],
        logo_url: params[2],
        contact_email: params[3],
        contact_phone: params[4],
        address: params[5],
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from organizations')) {
      const rows = db.findAll('organizations');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('select * from organizations')) {
      if (lowerSql.includes('where id =')) {
        const row = db.findById('organizations', params[0]);
        return { rows: row ? [row] : [] };
      }
      return { rows: db.findAll('organizations') };
    }

    if (lowerSql.includes('update organizations')) {
      const id = params[params.length - 1];
      const data = {};
      if (lowerSql.includes('name =')) data.name = params[0];
      if (lowerSql.includes('description =')) data.description = params[1];
      const row = db.update('organizations', id, data);
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('delete from organizations')) {
      db.delete('organizations', params[0]);
      return { rows: [{ id: params[0] }] };
    }

    // Seasons
    if (lowerSql.includes('insert into seasons')) {
      const row = db.insert('seasons', {
        organization_id: params[0],
        name: params[1],
        start_date: params[2],
        end_date: params[3],
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from seasons')) {
      const rows = db.findAll('seasons');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('from seasons')) {
      if (lowerSql.includes('where id =')) {
        const row = db.findById('seasons', params[0]);
        return { rows: row ? [row] : [] };
      }
      return { rows: db.findAll('seasons') };
    }

    if (lowerSql.includes('update seasons')) {
      const id = params[params.length - 1];
      const row = db.update('seasons', id, { is_archived: true });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('delete from seasons')) {
      db.delete('seasons', params[0]);
      return { rows: [{ id: params[0] }] };
    }

    // Competitions
    if (lowerSql.includes('insert into competitions')) {
      const row = db.insert('competitions', {
        season_id: params[0],
        name: params[1],
        sport: params[2],
        division: params[3],
        status: 'draft',
        rules: params[4] ? JSON.parse(params[4]) : {},
        registration_window: params[5] ? JSON.parse(params[5]) : null,
        enable_groups: params[6] || false,
        enable_knockouts: params[7] || false,
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from competitions')) {
      const rows = db.findAll('competitions');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('from competitions')) {
      if (lowerSql.includes('where id =')) {
        const row = db.findById('competitions', params[0]);
        return { rows: row ? [row] : [] };
      }
      return { rows: db.findAll('competitions') };
    }

    if (lowerSql.includes('update competitions')) {
      const id = params[params.length - 1];
      const data = {};
      if (lowerSql.includes('name =')) data.name = params[0];
      if (lowerSql.includes('sport =')) data.sport = params[0];
      const row = db.update('competitions', id, data);
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('delete from competitions')) {
      db.delete('competitions', params[0]);
      return { rows: [{ id: params[0] }] };
    }

    // Teams
    if (lowerSql.includes('insert into teams')) {
      const row = db.insert('teams', {
        competition_id: params[0],
        group_id: params[1],
        name: params[2],
        school_name: params[3],
        description: params[4],
        logo_url: params[5],
        primary_color: params[6],
        secondary_color: params[7],
        registration_status: 'pending',
        roster_approval_status: 'draft',
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from teams')) {
      const rows = db.findAll('teams');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('from teams t')) {
      if (lowerSql.includes('where t.id =')) {
        const row = db.findById('teams', params[0]);
        return { rows: row ? [row] : [] };
      }
      return { rows: db.findAll('teams') };
    }

    if (lowerSql.includes('select id from teams where competition_id')) {
      let rows = db.findAll('teams').filter((r) => r.competition_id === params[0]);
      if (lowerSql.includes('registration_status')) {
        rows = rows.filter((r) => r.registration_status === 'approved');
      }
      return { rows: rows.map((r) => ({ id: r.id })) };
    }

    if (lowerSql.includes('update teams set coach_id')) {
      const row = db.update('teams', params[1], { coach_id: params[0] });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('update teams set registration_status')) {
      const row = db.update('teams', params[1], { registration_status: params[0] });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('update teams set roster_approval_status')) {
      const row = db.update('teams', params[1], { roster_approval_status: params[0] });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('update teams set')) {
      const id = params[params.length - 1];
      const data = {};
      if (lowerSql.includes('name =')) data.name = params[0];
      if (lowerSql.includes('school_name =')) data.school_name = params[1];
      const row = db.update('teams', id, data);
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('delete from teams')) {
      db.delete('teams', params[0]);
      return { rows: [{ id: params[0] }] };
    }

    // Players
    if (lowerSql.includes('select c.registration_window')) {
      const compId = params[0];
      const comp = db.findById('competitions', compId);
      if (!comp) return { rows: [] };
      return { rows: [{ registration_window: comp.registration_window }] };
    }

    if (lowerSql.includes('select coach_id from teams')) {
      const team = db.findById('teams', params[0]);
      return { rows: team ? [{ coach_id: team.coach_id }] : [] };
    }

    if (lowerSql.includes('insert into players')) {
      const row = db.insert('players', {
        team_id: params[0],
        first_name: params[1],
        last_name: params[2],
        jersey_number: params[3],
        position: params[4],
        date_of_birth: params[5],
        nationality: params[6],
        height: params[7],
        weight: params[8],
        photo_url: params[9],
        status: 'active',
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from players')) {
      const rows = db.findAll('players');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('from players p')) {
      if (lowerSql.includes('where p.id =')) {
        const row = db.findById('players', params[0]);
        return { rows: row ? [row] : [] };
      }
      return { rows: db.findAll('players') };
    }

    if (lowerSql.includes('update players set')) {
      const id = params[params.length - 1];
      const data = {};
      if (lowerSql.includes('first_name =')) data.first_name = params[0];
      if (lowerSql.includes('last_name =')) data.last_name = params[1];
      const row = db.update('players', id, data);
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('delete from players')) {
      db.delete('players', params[0]);
      return { rows: [{ id: params[0] }] };
    }

    // Fixtures
    if (lowerSql.includes('insert into fixtures')) {
      const row = db.insert('fixtures', {
        competition_id: params[0],
        matchday: params[1],
        home_team_id: params[2],
        away_team_id: params[3],
        scheduled_at: params[4],
        pitch_id: params[5] || null,
        status: params[6] || 'scheduled',
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from fixtures')) {
      const rows = db.findAll('fixtures');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('from fixtures f')) {
      if (lowerSql.includes('where f.id =')) {
        const row = db.findById('fixtures', params[0]);
        return { rows: row ? [row] : [] };
      }
      let rows = db.findAll('fixtures');
      if (lowerSql.includes('where f.competition_id')) {
        rows = rows.filter((r) => r.competition_id === params[0]);
      }
      return { rows };
    }

    if (lowerSql.includes('delete from fixtures')) {
      db.delete('fixtures', params[0]);
      return { rows: [{ id: params[0] }] };
    }

    if (lowerSql.includes('update fixtures')) {
      const id = params[params.length - 1];
      const data = {};
      if (lowerSql.includes('status = $1') || lowerSql.includes('status = $')) data.status = params[0];
      if (lowerSql.includes('pitch_id =')) data.pitch_id = params[0];
      if (lowerSql.includes('official_id =')) data.official_id = params[0];
      if (lowerSql.includes('matchday =')) data.matchday = params[0];
      if (lowerSql.includes('home_team_id =')) data.home_team_id = params[0];
      if (lowerSql.includes('away_team_id =')) data.away_team_id = params[0];
      if (lowerSql.includes('scheduled_at =')) data.scheduled_at = params[0];
      const row = db.update('fixtures', id, data);
      return { rows: row ? [row] : [] };
    }

    // Matches
    if (lowerSql.includes('insert into matches')) {
      const row = db.insert('matches', {
        fixture_id: params[0],
        competition_id: params[1],
        home_team_id: params[2],
        away_team_id: params[3],
        scheduled_at: params[4],
        pitch_id: params[5] || null,
        official_id: params[6] || null,
        status: params[7] || 'scheduled',
        home_score: 0,
        away_score: 0,
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) from matches')) {
      const rows = db.findAll('matches');
      return { rows: [{ count: rows.length }] };
    }

    if (lowerSql.includes('from matches m')) {
      if (lowerSql.includes('where m.id =')) {
        const row = db.findById('matches', params[0]);
        return { rows: row ? [row] : [] };
      }
      let rows = db.findAll('matches');
      if (lowerSql.includes('where m.competition_id')) {
        rows = rows.filter((r) => r.competition_id === params[0]);
      }
      return { rows };
    }

    if (lowerSql.includes('update matches')) {
      const id = params[params.length - 1];
      const data = {};
      if (lowerSql.includes('status = $1')) {
        data.status = params[0];
      } else {
        const statusMatch = lowerSql.match(/status\s*=\s*'([^']+)'/);
        if (statusMatch) data.status = statusMatch[1];
      }
      if (lowerSql.includes('home_score =')) data.home_score = params[0];
      if (lowerSql.includes('away_score =')) data.away_score = params[1];
      if (lowerSql.includes('official_id =') && lowerSql.includes('status = $1')) data.official_id = params[1];
      if (lowerSql.includes('official_id =') && !lowerSql.includes('status = $1')) data.official_id = params[0];
      if (lowerSql.includes('walkover_team_id =')) data.walkover_team_id = params[0];
      if (lowerSql.includes('walkover_reason =')) data.walkover_reason = params[1];
      if (lowerSql.includes('postponed_reason =')) data.postponed_reason = params[0];
      if (lowerSql.includes('started_at =')) data.started_at = new Date().toISOString();
      if (lowerSql.includes('half_time_at =')) data.half_time_at = new Date().toISOString();
      if (lowerSql.includes('ended_at =')) data.ended_at = new Date().toISOString();
      if (lowerSql.includes('report_submitted_at =')) data.report_submitted_at = new Date().toISOString();
      if (lowerSql.includes('verified_at =')) data.verified_at = new Date().toISOString();
      if (lowerSql.includes('verified_by =')) data.verified_by = params[0];
      if (lowerSql.includes('published_at =')) data.published_at = new Date().toISOString();
      const row = db.update('matches', id, data);
      return { rows: row ? [row] : [] };
    }

    // Standings
    if (lowerSql.includes('insert into standings')) {
      const compId = params[0];
      const teamId = params[1];
      const key = `${compId}:${teamId}`;
      const existing = db.tables.standings.get(key);
      if (existing) {
        existing.played += params[2] || 0;
        existing.won += params[3] || 0;
        existing.drawn += params[4] || 0;
        existing.lost += params[5] || 0;
        existing.goals_for += params[6] || 0;
        existing.goals_against += params[7] || 0;
        existing.goal_difference = existing.goals_for - existing.goals_against;
        existing.points += params[9] || 0;
        db.tables.standings.set(key, existing);
        return { rows: [existing] };
      }
      const row = db.insert('standings', {
        competition_id: compId,
        team_id: teamId,
        played: params[2] || 0,
        won: params[3] || 0,
        drawn: params[4] || 0,
        lost: params[5] || 0,
        goals_for: params[6] || 0,
        goals_against: params[7] || 0,
        goal_difference: (params[6] || 0) - (params[7] || 0),
        points: params[9] || 0,
      });
      db.tables.standings.set(key, row);
      return { rows: [row] };
    }

    if (lowerSql.includes('select rules from competitions')) {
      const comp = db.findById('competitions', params[0]);
      return { rows: comp ? [{ rules: comp.rules || {} }] : [] };
    }

    // Notifications
    if (lowerSql.includes('insert into notifications')) {
      const row = db.insert('notifications', {
        user_id: params[0],
        type: params[1],
        title: params[2],
        message: params[3],
        data: params[4] ? JSON.parse(params[4]) : null,
      });
      return { rows: [row] };
    }

    // Match Events
    if (lowerSql.includes('insert into match_events')) {
      const row = db.insert('match_events', {
        match_id: params[0],
        type: params[1],
        minute: params[2],
        player_id: params[3] || null,
        team_id: params[4] || null,
        description: params[5] || null,
        recorded_by: params[6],
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('from match_events me')) {
      let rows = db.findAll('match_events');
      if (lowerSql.includes('where me.match_id')) {
        rows = rows.filter((r) => r.match_id === params[0]);
      }
      return { rows };
    }

    if (lowerSql.includes('select * from match_events where match_id')) {
      const rows = db.findAll('match_events').filter((r) => r.match_id === params[0]);
      return { rows };
    }

    // Cards
    if (lowerSql.includes('insert into cards')) {
      const row = db.insert('cards', {
        match_id: params[0],
        player_id: params[1],
        team_id: params[2],
        type: params[3],
        minute: params[4],
        competition_id: params[5],
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select count(*) as yellow_count from cards')) {
      const rows = db.findAll('cards').filter(
        (r) => r.player_id === params[0] && r.competition_id === params[1] && r.type === 'yellow'
      );
      return { rows: [{ yellow_count: rows.length }] };
    }

    if (lowerSql.includes('select count(*) filter') && lowerSql.includes('from cards')) {
      const rows = db.findAll('cards').filter(
        (r) => r.player_id === params[0] && r.competition_id === params[1]
      );
      const yellow = rows.filter((r) => r.type === 'yellow').length;
      const red = rows.filter((r) => r.type === 'red').length;
      return { rows: [{ yellow_cards: yellow, red_cards: red }] };
    }

    if (lowerSql.includes('from cards c') && lowerSql.includes('group by')) {
      const rows = db.findAll('cards').filter((r) => r.competition_id === params[0]);
      const grouped = {};
      for (const r of rows) {
        if (!grouped[r.player_id]) {
          grouped[r.player_id] = { player_id: r.player_id, yellow_cards: 0, red_cards: 0, total_cards: 0 };
        }
        grouped[r.player_id].total_cards++;
        if (r.type === 'yellow') grouped[r.player_id].yellow_cards++;
        if (r.type === 'red') grouped[r.player_id].red_cards++;
      }
      return { rows: Object.values(grouped).sort((a, b) => b.total_cards - a.total_cards) };
    }

    // Suspensions
    if (lowerSql.includes('insert into suspensions')) {
      const row = db.insert('suspensions', {
        player_id: params[0],
        competition_id: params[1],
        reason: params[2],
        matches_count: params[3],
        card_id: params[4] || null,
        matches_served: 0,
        is_served: false,
      });
      return { rows: [row] };
    }

    if (lowerSql.includes('select id from suspensions') && lowerSql.includes('is_served = false')) {
      const rows = db.findAll('suspensions').filter(
        (r) => r.player_id === params[0] && r.competition_id === params[1] && !r.is_served
      );
      return { rows };
    }

    if (lowerSql.includes('select id from suspensions') && lowerSql.includes('is_served')) {
      const rows = db.findAll('suspensions').filter(
        (r) => r.player_id === params[0] && r.competition_id === params[1] && !r.is_served
      );
      return { rows };
    }

    if (lowerSql.includes('from suspensions s') && lowerSql.includes('join players p')) {
      const rows = db.findAll('suspensions').filter(
        (r) => r.competition_id === params[0] && !r.is_served
      );
      return { rows };
    }

    if (lowerSql.includes('select * from suspensions') && lowerSql.includes('where player_id')) {
      const rows = db.findAll('suspensions').filter(
        (r) => r.player_id === params[0] && r.competition_id === params[1]
      );
      return { rows };
    }

    if (lowerSql.includes('select * from suspensions where id')) {
      const row = db.findById('suspensions', params[0]);
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('update suspensions set matches_served')) {
      const id = params[params.length - 1];
      const isServed = params[1] === true || params[1] === 'true';
      const row = db.update('suspensions', id, { matches_served: params[0], is_served: isServed });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('update players set status') && lowerSql.includes('suspended')) {
      const id = params[params.length - 1];
      const row = db.update('players', id, { status: 'suspended', suspension_details: params[0] ? JSON.parse(params[0]) : null });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('update players set status') && lowerSql.includes('active') && lowerSql.includes('suspension_details')) {
      const id = params[params.length - 1];
      const row = db.update('players', id, { status: 'active', suspension_details: null });
      return { rows: row ? [row] : [] };
    }

    if (lowerSql.includes('select distinct player_id from suspensions')) {
      const rows = db.findAll('suspensions').filter(
        (r) => r.competition_id === params[0] && !r.is_served && r.matches_served < r.matches_count
      );
      const playerIds = [...new Set(rows.map((r) => r.player_id))];
      return { rows: playerIds.map((id) => ({ player_id: id })) };
    }

    if (lowerSql.includes('select competition_id from matches') && lowerSql.includes('where id')) {
      const row = db.findById('matches', params[0]);
      return { rows: row ? [{ competition_id: row.competition_id, home_team_id: row.home_team_id, away_team_id: row.away_team_id }] : [] };
    }

    if (lowerSql.includes('select id from players where team_id')) {
      const rows = db.findAll('players').filter((r) => r.team_id === params[0]);
      return { rows: rows.map((r) => ({ id: r.id })) };
    }

    // Default
    return { rows: [] };
  },
};

module.exports = { db, mockPool };
