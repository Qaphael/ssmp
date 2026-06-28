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

    // Default
    return { rows: [] };
  },
};

module.exports = { db, mockPool };
