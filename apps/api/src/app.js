const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('./middleware/errorHandler');
const { env } = require('./config/env');

const organizationRoutes = require('./modules/organizations/organization.routes');
const seasonRoutes = require('./modules/seasons/season.routes');
const competitionRoutes = require('./modules/competitions/competition.routes');
const teamRoutes = require('./modules/teams/team.routes');
const playerRoutes = require('./modules/players/player.routes');
const fixtureRoutes = require('./modules/fixtures/fixture.routes');
const matchRoutes = require('./modules/matches/match.routes');
const matchPublicRoutes = require('./modules/matches/match-public.routes');
const disciplineRoutes = require('./modules/discipline/discipline.routes');
const transferRoutes = require('./modules/transfers/transfer.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const mediaRoutes = require('./modules/media/media.routes');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (env.nodeEnv === 'development') {
  app.post('/api/auth/dev-token', (req, res) => {
    const { role, userId } = req.body;
    if (!role) return res.status(400).json({ error: 'role required' });
    const id = userId || `${role}-001`;
    const token = jwt.sign({ id, email: `${id}@dev.local`, role }, env.jwtSecret, { expiresIn: '24h' });
    res.json({ token, userId: id, role });
  });
}

app.use('/api/auth', authRoutes);

app.use('/api/organizations', organizationRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/public/matches', matchPublicRoutes);
app.use('/api/discipline', disciplineRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/media', mediaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
