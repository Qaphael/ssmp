const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Competitions', () => {
  let org, season;
  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
  });

  describe('POST /api/competitions', () => {
    it('creates a competition (comp_admin)', async () => {
      const res = await request(app)
        .post('/api/competitions')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          seasonId: season.id,
          name: 'Football Boys U-18',
          sport: 'football',
          registrationWindow: {
            opensAt: '2027-01-01T00:00:00Z',
            closesAt: '2027-02-01T00:00:00Z',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Football Boys U-18');
      expect(res.body.data.sport).toBe('football');
      expect(res.body.data.status).toBe('draft');
    });

    it('rejects registrar on create', async () => {
      const res = await request(app)
        .post('/api/competitions')
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({
          seasonId: season.id,
          name: 'Test',
          sport: 'football',
          registrationWindow: {
            opensAt: '2027-01-01T00:00:00Z',
            closesAt: '2027-02-01T00:00:00Z',
          },
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/competitions', () => {
    it('allows all authenticated users to list', async () => {
      db.insert('competitions', {
        season_id: season.id, name: 'Comp 1', sport: 'football',
        status: 'draft', rules: {}, enable_groups: false, enable_knockouts: false,
      });

      for (const role of ['system_admin', 'comp_admin', 'registrar', 'coach', 'official', 'media_officer']) {
        const res = await request(app)
          .get('/api/competitions')
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(res.status).toBe(200);
      }
    });
  });

  describe('PATCH /api/competitions/:id', () => {
    it('updates competition (comp_admin)', async () => {
      const comp = db.insert('competitions', {
        season_id: season.id, name: 'Old', sport: 'football',
        status: 'draft', rules: {}, enable_groups: false, enable_knockouts: false,
      });

      const res = await request(app)
        .patch(`/api/competitions/${comp.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated');
    });

    it('rejects official on update', async () => {
      const comp = db.insert('competitions', {
        season_id: season.id, name: 'Test', sport: 'football',
        status: 'draft', rules: {}, enable_groups: false, enable_knockouts: false,
      });

      const res = await request(app)
        .patch(`/api/competitions/${comp.id}`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/competitions/:id', () => {
    it('deletes competition (system_admin only)', async () => {
      const comp = db.insert('competitions', {
        season_id: season.id, name: 'To Delete', sport: 'football',
        status: 'draft', rules: {}, enable_groups: false, enable_knockouts: false,
      });

      const res = await request(app)
        .delete(`/api/competitions/${comp.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(204);
    });

    it('rejects comp_admin on delete', async () => {
      const comp = db.insert('competitions', {
        season_id: season.id, name: 'Test', sport: 'football',
        status: 'draft', rules: {}, enable_groups: false, enable_knockouts: false,
      });

      const res = await request(app)
        .delete(`/api/competitions/${comp.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(403);
    });
  });
});
