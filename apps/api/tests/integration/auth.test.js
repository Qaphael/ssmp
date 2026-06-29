const request = require('supertest');
const bcrypt = require('bcryptjs');
const { app } = require('../setup');
const { db } = require('../mock-db');

describe('Auth', () => {
  beforeEach(() => {
    db.reset();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'coach@test.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'coach',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('coach@test.com');
      expect(res.body.user.role).toBe('coach');
      expect(res.body.user.id).toBeDefined();
    });

    it('rejects duplicate email', async () => {
      const hash = await bcrypt.hash('password123', 10);
      db.insert('users', {
        email: 'taken@test.com',
        password_hash: hash,
        first_name: 'Existing',
        last_name: 'User',
        role: 'coach',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'taken@test.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'coach',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already registered/i);
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });

    it('rejects short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
          firstName: 'John',
          lastName: 'Doe',
          role: 'coach',
        });

      expect(res.status).toBe(400);
    });

    it('rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'coach',
        });

      expect(res.status).toBe(400);
    });

    it('rejects invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'hacker',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hash = await bcrypt.hash('password123', 10);
      db.insert('users', {
        email: 'user@test.com',
        password_hash: hash,
        first_name: 'Test',
        last_name: 'User',
        role: 'coach',
        is_active: true,
      });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('user@test.com');
      expect(res.body.user.role).toBe('coach');
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('rejects nonexistent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('rejects deactivated user', async () => {
      const hash = await bcrypt.hash('password123', 10);
      db.insert('users', {
        email: 'inactive@test.com',
        password_hash: hash,
        first_name: 'Inactive',
        last_name: 'User',
        role: 'coach',
        is_active: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inactive@test.com', password: 'password123' });

      expect(res.status).toBe(403);
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com' });

      expect(res.status).toBe(400);
    });
  });

});
