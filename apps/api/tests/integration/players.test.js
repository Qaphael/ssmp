const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Players', () => {
  let org, season, comp, team;
  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
  });

  describe('Registration Window Enforcement', () => {
    it('allows player creation within registration window', async () => {
      const futureOpen = new Date(Date.now() - 86400000).toISOString();
      const futureClose = new Date(Date.now() + 86400000 * 30).toISOString();

      comp = db.insert('competitions', {
        season_id: season.id, name: 'Football', sport: 'football',
        status: 'draft', rules: {},
        registration_window: { opensAt: futureOpen, closesAt: futureClose },
        enable_groups: false, enable_knockouts: false,
      });
      team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'School',
        registration_status: 'approved', roster_approval_status: 'draft',
        coach_id: 'coach-001',
      });

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: team.id,
          firstName: 'John',
          lastName: 'Doe',
          jerseyNumber: 10,
          dateOfBirth: '2009-01-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.first_name).toBe('John');
    });

    it('rejects player creation outside registration window', async () => {
      const pastOpen = new Date(Date.now() - 86400000 * 60).toISOString();
      const pastClose = new Date(Date.now() - 86400000).toISOString();

      comp = db.insert('competitions', {
        season_id: season.id, name: 'Football', sport: 'football',
        status: 'draft', rules: {},
        registration_window: { opensAt: pastOpen, closesAt: pastClose },
        enable_groups: false, enable_knockouts: false,
      });
      team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'School',
        registration_status: 'approved', roster_approval_status: 'draft',
        coach_id: 'coach-001',
      });

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: team.id,
          firstName: 'John',
          lastName: 'Doe',
          jerseyNumber: 10,
          dateOfBirth: '2009-01-15',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('closed');
    });

    it('rejects player creation before registration opens', async () => {
      const futureOpen = new Date(Date.now() + 86400000 * 30).toISOString();
      const futureClose = new Date(Date.now() + 86400000 * 60).toISOString();

      comp = db.insert('competitions', {
        season_id: season.id, name: 'Football', sport: 'football',
        status: 'draft', rules: {},
        registration_window: { opensAt: futureOpen, closesAt: futureClose },
        enable_groups: false, enable_knockouts: false,
      });
      team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'School',
        registration_status: 'approved', roster_approval_status: 'draft',
        coach_id: 'coach-001',
      });

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: team.id,
          firstName: 'John',
          lastName: 'Doe',
          jerseyNumber: 10,
          dateOfBirth: '2009-01-15',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('opens');
    });

    it('rejects player creation with no registration window', async () => {
      comp = db.insert('competitions', {
        season_id: season.id, name: 'Football', sport: 'football',
        status: 'draft', rules: {}, registration_window: null,
        enable_groups: false, enable_knockouts: false,
      });
      team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'School',
        registration_status: 'approved', roster_approval_status: 'draft',
        coach_id: 'coach-001',
      });

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: team.id,
          firstName: 'John',
          lastName: 'Doe',
          jerseyNumber: 10,
          dateOfBirth: '2009-01-15',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No registration window');
    });
  });

  describe('RBAC for Players', () => {
    beforeEach(() => {
      const futureOpen = new Date(Date.now() - 86400000).toISOString();
      const futureClose = new Date(Date.now() + 86400000 * 30).toISOString();
      comp = db.insert('competitions', {
        season_id: season.id, name: 'Football', sport: 'football',
        status: 'draft', rules: {},
        registration_window: { opensAt: futureOpen, closesAt: futureClose },
        enable_groups: false, enable_knockouts: false,
      });
      team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'School',
        registration_status: 'approved', roster_approval_status: 'draft',
        coach_id: 'coach-001',
      });
    });

    it('allows comp_admin to create players', async () => {
      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          teamId: team.id,
          firstName: 'Jane',
          lastName: 'Smith',
          jerseyNumber: 7,
          dateOfBirth: '2009-03-20',
        });

      expect(res.status).toBe(201);
    });

    it('rejects registrar on player create', async () => {
      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({
          teamId: team.id,
          firstName: 'Jane',
          lastName: 'Smith',
          jerseyNumber: 7,
          dateOfBirth: '2009-03-20',
        });

      expect(res.status).toBe(403);
    });

    it('rejects official on player create', async () => {
      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          teamId: team.id,
          firstName: 'Jane',
          lastName: 'Smith',
          jerseyNumber: 7,
          dateOfBirth: '2009-03-20',
        });

      expect(res.status).toBe(403);
    });

    it('rejects media_officer on player create', async () => {
      const res = await request(app)
        .post('/api/players')
        .set('Authorization', `Bearer ${tokens.media_officer}`)
        .send({
          teamId: team.id,
          firstName: 'Jane',
          lastName: 'Smith',
          jerseyNumber: 7,
          dateOfBirth: '2009-03-20',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/players/:id', () => {
    it('deletes player (system_admin)', async () => {
      const player = db.insert('players', {
        team_id: 'team-001', first_name: 'To', last_name: 'Delete',
        jersey_number: 1, date_of_birth: '2009-01-01', status: 'active',
      });

      const res = await request(app)
        .delete(`/api/players/${player.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(204);
    });

    it('rejects coach on delete', async () => {
      const player = db.insert('players', {
        team_id: 'team-001', first_name: 'Test', last_name: 'Player',
        jersey_number: 1, date_of_birth: '2009-01-01', status: 'active',
      });

      const res = await request(app)
        .delete(`/api/players/${player.id}`)
        .set('Authorization', `Bearer ${tokens.coach}`);

      expect(res.status).toBe(403);
    });
  });
});
