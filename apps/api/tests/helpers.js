const jwt = require('jsonwebtoken');
const { env } = require('../src/config/env');

function makeToken(payload) {
  return jwt.sign(
    {
      id: payload.id || '00000000-0000-0000-0000-000000000001',
      email: payload.email || 'test@example.com',
      role: payload.role || 'system_admin',
    },
    env.jwtSecret,
    { expiresIn: '1h' }
  );
}

const tokens = {
  system_admin: makeToken({ role: 'system_admin' }),
  comp_admin: makeToken({ role: 'comp_admin' }),
  registrar: makeToken({ role: 'registrar' }),
  ref_coordinator: makeToken({ role: 'ref_coordinator' }),
  media_officer: makeToken({ role: 'media_officer' }),
  official: makeToken({ role: 'official', id: '00000000-0000-0000-0000-000000000010' }),
  coach: makeToken({ role: 'coach', id: 'coach-001' }),
};

module.exports = { makeToken, tokens };
