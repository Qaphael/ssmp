const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

async function forgotPassword(email) {
  const result = await pool.query('SELECT id, email FROM users WHERE email = $1 AND is_active = true', [email]);
  if (result.rows.length === 0) {
    return { message: 'If an account exists with that email, a reset link has been sent.' };
  }

  const user = result.rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, expiresAt]
  );

  console.log(`[PASSWORD RESET] User: ${user.email}, Token: ${token}, Expires: ${expiresAt.toISOString()}`);

  return { message: 'If an account exists with that email, a reset link has been sent.', resetToken: token };
}

async function resetPassword(token, newPassword) {
  const result = await pool.query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token = $1 AND used = false AND expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid or expired reset token');
    err.status = 400;
    throw err;
  }

  const resetRow = result.rows[0];
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, resetRow.user_id]);
  await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [resetRow.id]);

  return { message: 'Password has been reset successfully' };
}

async function getMe(userId) {
  const result = await pool.query(
    'SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function changePassword(userId, oldPassword, newPassword) {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const valid = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 401;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);

  return { message: 'Password changed successfully' };
}

async function updateProfile(userId, firstName, lastName) {
  const result = await pool.query(
    `UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW()
     WHERE id = $3 RETURNING id, email, first_name, last_name, role`,
    [firstName, lastName, userId]
  );
  return result.rows[0] || null;
}

module.exports = { register, login, forgotPassword, resetPassword, getMe, changePassword, updateProfile };
