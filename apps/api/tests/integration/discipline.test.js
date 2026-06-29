const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Discipline Engine', () => {
  let org, season, comp, teamA, teamB, playerA1, playerA2, fixture, match;

  beforeEach(async () => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
    comp = db.insert('competitions', {
      season_id: season.id, name: 'Football', sport: 'football',
      status: 'in_progress',
      rules: { yellowCardsForSuspension: 2, suspensionMatches: 1, redCardImmediateSuspension: true },
      enable_groups: false, enable_knockouts: false,
    });
    teamA = db.insert('teams', {
      competition_id: comp.id, name: 'Alpha', school_name: 'School A',
      registration_status: 'approved',
    });
    teamB = db.insert('teams', {
      competition_id: comp.id, name: 'Bravo', school_name: 'School B',
      registration_status: 'approved',
    });
    playerA1 = db.insert('players', {
      team_id: teamA.id, first_name: 'Alex', last_name: 'Morgan',
      jersey_number: 10, position: 'midfielder', date_of_birth: '2009-05-01', status: 'active',
    });
    playerA2 = db.insert('players', {
      team_id: teamA.id, first_name: 'Sam', last_name: 'Kerr',
      jersey_number: 9, position: 'forward', date_of_birth: '2009-07-15', status: 'active',
    });
    fixture = db.insert('fixtures', {
      competition_id: comp.id, matchday: 1,
      home_team_id: teamA.id, away_team_id: teamB.id,
      scheduled_at: '2027-03-01T14:00:00Z', status: 'scheduled',
    });

    const matchRes = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${tokens.comp_admin}`)
      .send({
        fixtureId: fixture.id,
        competitionId: comp.id,
        homeTeamId: teamA.id,
        awayTeamId: teamB.id,
        scheduledAt: '2027-03-01T14:00:00Z',
      });
    match = matchRes.body.data;

    const transitions = ['officials_assigned', 'lineups_submitted', 'lineups_locked', 'kickoff'];
    for (const status of transitions) {
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status });
    }
  });

  describe('Yellow card accumulation', () => {
    it('does not suspend player with fewer yellow cards than threshold', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'yellow_card', minute: 23,
          playerId: playerA1.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      const suspRes = await request(app)
        .get(`/api/discipline/competitions/${comp.id}/suspensions`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(suspRes.status).toBe(200);
      expect(suspRes.body.data.length).toBe(0);
    });

    it('auto-suspends player after reaching yellow card threshold', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'yellow_card', minute: 23,
          playerId: playerA1.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'yellow_card', minute: 55,
          playerId: playerA1.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      const suspRes = await request(app)
        .get(`/api/discipline/competitions/${comp.id}/suspensions`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(suspRes.status).toBe(200);
      expect(suspRes.body.data.length).toBe(1);
    });
  });

  describe('Red card immediate suspension', () => {
    it('immediately suspends player on red card', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'red_card', minute: 70,
          playerId: playerA2.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      const suspRes = await request(app)
        .get(`/api/discipline/competitions/${comp.id}/suspensions`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(suspRes.status).toBe(200);
      expect(suspRes.body.data.length).toBe(1);
    });
  });

  describe('Suspended player blocking', () => {
    it('returns suspended player IDs for a competition', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'red_card', minute: 40,
          playerId: playerA1.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      const res = await request(app)
        .get(`/api/discipline/competitions/${comp.id}/suspended-players`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toContain(playerA1.id);
      expect(res.body.data).not.toContain(playerA2.id);
    });
  });

  describe('Card leaderboard', () => {
    it('returns card counts per player', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'yellow_card', minute: 10,
          playerId: playerA1.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id, type: 'red_card', minute: 45,
          playerId: playerA1.id, teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      const res = await request(app)
        .get(`/api/discipline/competitions/${comp.id}/cards`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].player_id).toBe(playerA1.id);
    });
  });
});
