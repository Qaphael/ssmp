const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Teams', () => {
  let org, season, comp;
  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
    comp = db.insert('competitions', {
      season_id: season.id, name: 'Football', sport: 'football',
      status: 'draft', rules: {}, registration_window: null,
      enable_groups: false, enable_knockouts: false,
    });
  });

  describe('POST /api/teams', () => {
    it('creates a team (comp_admin)', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          competitionId: comp.id,
          name: 'Lions',
          schoolName: 'Springfield High',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Lions');
      expect(res.body.data.registration_status).toBe('pending');
      expect(res.body.data.roster_approval_status).toBe('draft');
    });

    it('rejects coach on create', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          competitionId: comp.id,
          name: 'Lions',
          schoolName: 'Springfield High',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/teams/:id/registration', () => {
    it('approves registration (registrar)', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'pending', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .patch(`/api/teams/${team.id}/registration`)
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.data.registration_status).toBe('approved');
    });

    it('rejects coach on registration approval', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'pending', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .patch(`/api/teams/${team.id}/registration`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
    });

    it('rejects comp_admin on registration approval', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'pending', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .patch(`/api/teams/${team.id}/registration`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/teams/:id/roster-approval', () => {
    it('approves roster (registrar)', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'approved', roster_approval_status: 'submitted',
      });

      const res = await request(app)
        .patch(`/api/teams/${team.id}/roster-approval`)
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.data.roster_approval_status).toBe('approved');
    });

    it('rejects coach on roster approval', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'approved', roster_approval_status: 'submitted',
      });

      const res = await request(app)
        .patch(`/api/teams/${team.id}/roster-approval`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/teams/:id/assign-coach', () => {
    it('assigns a coach (comp_admin)', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'approved', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .post(`/api/teams/${team.id}/assign-coach`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ coachId: 'coach-user-001' });

      expect(res.status).toBe(200);
      expect(res.body.data.coach_id).toBe('coach-user-001');
    });

    it('rejects coach on assign-coach', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Lions', school_name: 'Springfield High',
        registration_status: 'approved', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .post(`/api/teams/${team.id}/assign-coach`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({ coachId: 'coach-user-001' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/teams/:id', () => {
    it('deletes team (system_admin only)', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'To Delete', school_name: 'School',
        registration_status: 'pending', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .delete(`/api/teams/${team.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(204);
    });

    it('rejects comp_admin on delete', async () => {
      const team = db.insert('teams', {
        competition_id: comp.id, name: 'Test', school_name: 'School',
        registration_status: 'pending', roster_approval_status: 'draft',
      });

      const res = await request(app)
        .delete(`/api/teams/${team.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(403);
    });
  });
});
