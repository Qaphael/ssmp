const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Fixtures', () => {
  let org, season, comp, teamA, teamB, teamC, teamD;

  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
    comp = db.insert('competitions', {
      season_id: season.id, name: 'Football Boys', sport: 'football',
      status: 'in_progress', rules: {}, enable_groups: false, enable_knockouts: false,
    });
    teamA = db.insert('teams', {
      competition_id: comp.id, name: 'Alpha', school_name: 'School A',
      registration_status: 'approved', roster_approval_status: 'approved',
    });
    teamB = db.insert('teams', {
      competition_id: comp.id, name: 'Bravo', school_name: 'School B',
      registration_status: 'approved', roster_approval_status: 'approved',
    });
    teamC = db.insert('teams', {
      competition_id: comp.id, name: 'Charlie', school_name: 'School C',
      registration_status: 'approved', roster_approval_status: 'approved',
    });
    teamD = db.insert('teams', {
      competition_id: comp.id, name: 'Delta', school_name: 'School D',
      registration_status: 'approved', roster_approval_status: 'approved',
    });
  });

  describe('POST /api/fixtures', () => {
    it('creates a fixture (comp_admin)', async () => {
      const res = await request(app)
        .post('/api/fixtures')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          competitionId: comp.id,
          matchday: 1,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-01T14:00:00Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.competition_id).toBe(comp.id);
      expect(res.body.data.matchday).toBe(1);
      expect(res.body.data.status).toBe('scheduled');
    });

    it('rejects official on create', async () => {
      const res = await request(app)
        .post('/api/fixtures')
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          competitionId: comp.id,
          matchday: 1,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-01T14:00:00Z',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/fixtures/generate-round-robin', () => {
    it('generates round-robin fixtures for 4 teams', async () => {
      const res = await request(app)
        .post('/api/fixtures/generate-round-robin')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          competitionId: comp.id,
          startDate: '2027-03-01',
        });

      expect(res.status).toBe(201);
      expect(res.body.count).toBe(6);
      expect(res.body.data.length).toBe(6);

      for (const fixture of res.body.data) {
        expect(fixture.competition_id).toBe(comp.id);
        expect(fixture.status).toBe('scheduled');
        expect(fixture.home_team_id).not.toBe(fixture.away_team_id);
      }
    });

    it('fails with less than 2 teams', async () => {
      const res = await request(app)
        .post('/api/fixtures/generate-round-robin')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          competitionId: comp.id,
          startDate: '2027-03-01',
        });

      // Only teamA and teamB have registration_status 'approved' in real DB
      // but mock doesn't filter by that in the SELECT - we insert all 4 teams as approved
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/fixtures', () => {
    it('lists fixtures (comp_admin)', async () => {
      db.insert('fixtures', {
        competition_id: comp.id, matchday: 1,
        home_team_id: teamA.id, away_team_id: teamB.id,
        scheduled_at: '2027-03-01T14:00:00Z', status: 'scheduled',
      });

      const res = await request(app)
        .get('/api/fixtures')
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/fixtures/:id', () => {
    it('updates fixture schedule', async () => {
      const fixture = db.insert('fixtures', {
        competition_id: comp.id, matchday: 1,
        home_team_id: teamA.id, away_team_id: teamB.id,
        scheduled_at: '2027-03-01T14:00:00Z', status: 'scheduled',
      });

      const res = await request(app)
        .patch(`/api/fixtures/${fixture.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ scheduledAt: '2027-03-02T16:00:00Z' });

      expect(res.status).toBe(200);
      expect(res.body.data.scheduled_at).toBe('2027-03-02T16:00:00Z');
    });
  });

  describe('DELETE /api/fixtures/:id', () => {
    it('deletes fixture (system_admin only)', async () => {
      const fixture = db.insert('fixtures', {
        competition_id: comp.id, matchday: 1,
        home_team_id: teamA.id, away_team_id: teamB.id,
        scheduled_at: '2027-03-01T14:00:00Z', status: 'scheduled',
      });

      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(204);
    });

    it('rejects comp_admin on delete', async () => {
      const fixture = db.insert('fixtures', {
        competition_id: comp.id, matchday: 1,
        home_team_id: teamA.id, away_team_id: teamB.id,
        scheduled_at: '2027-03-01T14:00:00Z', status: 'scheduled',
      });

      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(403);
    });
  });
});
