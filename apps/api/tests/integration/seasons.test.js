const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Seasons', () => {
  let org;
  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
  });

  describe('POST /api/seasons', () => {
    it('creates a season (system_admin)', async () => {
      const res = await request(app)
        .post('/api/seasons')
        .set('Authorization', `Bearer ${tokens.system_admin}`)
        .send({
          organizationId: org.id,
          name: '2027 Season',
          startDate: '2027-01-01',
          endDate: '2027-12-31',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('2027 Season');
    });

    it('creates a season (comp_admin)', async () => {
      const res = await request(app)
        .post('/api/seasons')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          organizationId: org.id,
          name: '2027 Season',
          startDate: '2027-01-01',
          endDate: '2027-12-31',
        });

      expect(res.status).toBe(201);
    });

    it('rejects registrar on create', async () => {
      const res = await request(app)
        .post('/api/seasons')
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({
          organizationId: org.id,
          name: '2027 Season',
          startDate: '2027-01-01',
          endDate: '2027-12-31',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/seasons', () => {
    it('lists seasons', async () => {
      db.insert('seasons', { organization_id: org.id, name: 'S1', start_date: '2027-01-01', end_date: '2027-12-31' });

      const res = await request(app)
        .get('/api/seasons')
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PATCH /api/seasons/:id/archive', () => {
    it('archives a season', async () => {
      const season = db.insert('seasons', {
        organization_id: org.id, name: 'Old Season',
        start_date: '2026-01-01', end_date: '2026-12-31',
      });

      const res = await request(app)
        .patch(`/api/seasons/${season.id}/archive`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.is_archived).toBe(true);
    });

    it('rejects coach on archive', async () => {
      const season = db.insert('seasons', {
        organization_id: org.id, name: 'S1',
        start_date: '2027-01-01', end_date: '2027-12-31',
      });

      const res = await request(app)
        .patch(`/api/seasons/${season.id}/archive`)
        .set('Authorization', `Bearer ${tokens.coach}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/seasons/:id', () => {
    it('deletes a season (system_admin only)', async () => {
      const season = db.insert('seasons', {
        organization_id: org.id, name: 'To Delete',
        start_date: '2027-01-01', end_date: '2027-12-31',
      });

      const res = await request(app)
        .delete(`/api/seasons/${season.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(204);
    });

    it('rejects comp_admin on delete', async () => {
      const season = db.insert('seasons', {
        organization_id: org.id, name: 'Test',
        start_date: '2027-01-01', end_date: '2027-12-31',
      });

      const res = await request(app)
        .delete(`/api/seasons/${season.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(403);
    });
  });
});
