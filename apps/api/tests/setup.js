/**
 * Test app setup — replaces pg pool with mock DB before loading the real app.
 */

// Mock the pg Pool BEFORE requiring any app modules
const { mockPool } = require('./mock-db');
require('pg').Pool = function () { return mockPool; };

const app = require('../src/app');

module.exports = { app };
