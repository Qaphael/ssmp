const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Match Events', () => {
  let org, season, comp, teamA, teamB, fixture, match;

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
      rules: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 },
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
        officialId: '00000000-0000-0000-0000-000000000010',
      });
    match = matchRes.body.data;

    // Transition to kickoff
    const transitions = ['officials_assigned', 'lineups_submitted', 'lineups_locked', 'kickoff'];
    for (const status of transitions) {
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status });
    }
  });

  describe('POST /api/matches/:id/events', () => {
    it('records a goal event (official)', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id,
          type: 'goal',
          minute: 23,
          teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
          description: 'Header from corner kick',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('goal');
      expect(res.body.data.minute).toBe(23);
      expect(res.body.data.team_id).toBe(teamA.id);
    });

    it('records a yellow card event', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          matchId: match.id,
          type: 'yellow_card',
          minute: 45,
          teamId: teamB.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
          description: 'Late tackle',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('yellow_card');
    });

    it('rejects coach on event recording', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          matchId: match.id,
          type: 'goal',
          minute: 10,
          teamId: teamA.id,
          recordedBy: '00000000-0000-0000-0000-000000000001',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/matches/:id/events', () => {
    it('lists events for a match', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({ matchId: match.id, type: 'goal', minute: 23, teamId: teamA.id, recordedBy: '00000000-0000-0000-0000-000000000001' });

      await request(app)
        .post(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({ matchId: match.id, type: 'yellow_card', minute: 45, teamId: teamB.id, recordedBy: '00000000-0000-0000-0000-000000000001' });

      const res = await request(app)
        .get(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('returns empty array for match with no events', async () => {
      const res = await request(app)
        .get(`/api/matches/${match.id}/events`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });
});
