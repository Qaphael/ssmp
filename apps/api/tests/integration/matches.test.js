const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Matches', () => {
  let org, season, comp, teamA, teamB, fixture;

  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
    comp = db.insert('competitions', {
      season_id: season.id, name: 'Football Boys', sport: 'football',
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
  });

  describe('POST /api/matches', () => {
    it('creates a match (comp_admin)', async () => {
      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          fixtureId: fixture.id,
          competitionId: comp.id,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-01T14:00:00Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('scheduled');
      expect(res.body.data.home_score).toBe(0);
      expect(res.body.data.away_score).toBe(0);
    });
  });

  describe('Match lifecycle state machine', () => {
    let match;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          fixtureId: fixture.id,
          competitionId: comp.id,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-01T14:00:00Z',
        });
      match = res.body.data;
    });

    it('transitions: scheduled → officials_assigned → lineups_submitted → lineups_locked → kickoff → half_time → second_half → full_time', async () => {
      let res;

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'officials_assigned' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('officials_assigned');

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'lineups_submitted' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('lineups_submitted');

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'lineups_locked' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('lineups_locked');

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'kickoff' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('kickoff');

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'half_time' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('half_time');

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'second_half' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('second_half');

      res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'full_time' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('full_time');
    });

    it('rejects invalid transition: scheduled → kickoff', async () => {
      const res = await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'kickoff' });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain('Invalid status transition');
    });

    it('allows postponing from scheduled', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/postpone`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          postponedReason: 'Weather conditions',
          newScheduledAt: '2027-03-08T14:00:00Z',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('postponed');
      expect(res.body.data.postponed_reason).toBe('Weather conditions');
    });
  });

  describe('Verification workflow', () => {
    let match;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          fixtureId: fixture.id,
          competitionId: comp.id,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-01T14:00:00Z',
        });
      match = res.body.data;

      // Transition to full_time
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'officials_assigned' });
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'lineups_submitted' });
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'lineups_locked' });
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'kickoff' });
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'half_time' });
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'second_half' });
      await request(app)
        .patch(`/api/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({ status: 'full_time' });
    });

    it('official submits report, then comp_admin verifies, then publishes', async () => {
      let res;

      res = await request(app)
        .post(`/api/matches/${match.id}/submit-report`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({ homeScore: 2, awayScore: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('report_submitted');
      expect(res.body.data.home_score).toBe(2);
      expect(res.body.data.away_score).toBe(1);

      res = await request(app)
        .post(`/api/matches/${match.id}/verify`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('verified');

      res = await request(app)
        .post(`/api/matches/${match.id}/publish`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('published');
      expect(res.body.data.published_at).toBeDefined();
    });

    it('rejects verify on non-report_submitted match', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/verify`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(422);
    });

    it('rejects submit-report on non-full_time match', async () => {
      const match2Res = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          fixtureId: fixture.id,
          competitionId: comp.id,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-02T14:00:00Z',
        });
      const match2 = match2Res.body.data;

      const res = await request(app)
        .post(`/api/matches/${match2.id}/submit-report`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({ homeScore: 1, awayScore: 0 });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/matches/:id/walkover', () => {
    it('records walkover', async () => {
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
      const match = matchRes.body.data;

      const res = await request(app)
        .post(`/api/matches/${match.id}/walkover`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          walkoverTeamId: teamA.id,
          walkoverReason: 'Bravo failed to show up',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('walkover');
      expect(res.body.data.walkover_team_id).toBe(teamA.id);
    });
  });

  describe('GET /api/matches', () => {
    it('lists matches (comp_admin)', async () => {
      await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${tokens.comp_admin}`)
        .send({
          fixtureId: fixture.id,
          competitionId: comp.id,
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          scheduledAt: '2027-03-01T14:00:00Z',
        });

      const res = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
