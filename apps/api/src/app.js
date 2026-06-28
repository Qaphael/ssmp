const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const organizationRoutes = require('./modules/organizations/organization.routes');
const seasonRoutes = require('./modules/seasons/season.routes');
const competitionRoutes = require('./modules/competitions/competition.routes');
const teamRoutes = require('./modules/teams/team.routes');
const playerRoutes = require('./modules/players/player.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/organizations', organizationRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
