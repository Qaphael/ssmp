const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Organizations', () => {
  beforeEach(() => db.reset());

  describe('POST /api/organizations', () => {
    it('creates an organization (system_admin)', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${tokens.system_admin}`)
        .send({ name: 'Test School League' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test School League');
      expect(res.body.data.id).toBeDefined();
    });

    it('rejects non-admin roles', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Insufficient permissions');
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/organizations', () => {
    it('lists organizations (system_admin)', async () => {
      db.insert('organizations', { name: 'Org A' });
      db.insert('organizations', { name: 'Org B' });

      const res = await request(app)
        .get('/api/organizations')
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('allows comp_admin to read', async () => {
      const res = await request(app)
        .get('/api/organizations')
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/organizations/:id', () => {
    it('updates an organization (system_admin)', async () => {
      const org = db.insert('organizations', { name: 'Old Name' });

      const res = await request(app)
        .patch(`/api/organizations/${org.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
    });

    it('rejects comp_admin on update', async () => {
      const org = db.insert('organizations', { name: 'Test' });

      const res = await request(app)
        .patch(`/api/organizations/${org.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    it('deletes an organization (system_admin)', async () => {
      const org = db.insert('organizations', { name: 'To Delete' });

      const res = await request(app)
        .delete(`/api/organizations/${org.id}`)
        .set('Authorization', `Bearer ${tokens.system_admin}`);

      expect(res.status).toBe(204);
    });

    it('rejects comp_admin on delete', async () => {
      const org = db.insert('organizations', { name: 'Test' });

      const res = await request(app)
        .delete(`/api/organizations/${org.id}`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(403);
    });
  });
});
