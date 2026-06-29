const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const { env } = require('../../config/env');

const SALT_ROUNDS = 10;

async function register({ email, password, firstName, lastName, role }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, role`,
    [email, passwordHash, firstName, lastName, role]
  );

  const user = result.rows[0];
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '24h' }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

async function login({ email, password }) {
  const result = await pool.query(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    const err = new Error('Account is deactivated');
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '24h' }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

module.exports = { register, login };
