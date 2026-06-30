const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Lineups', () => {
  let org, season, comp, teamA, teamB, fixture, match, playerA1, playerA2, playerB1;

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
    match = db.insert('matches', {
      fixture_id: fixture.id,
      competition_id: comp.id,
      home_team_id: teamA.id,
      away_team_id: teamB.id,
      scheduled_at: '2027-03-01T14:00:00Z',
      status: 'officials_assigned',
      home_score: 0,
      away_score: 0,
    });
    playerA1 = db.insert('players', {
      team_id: teamA.id, first_name: 'John', last_name: 'Doe',
      jersey_number: 10, position: 'forward', date_of_birth: '2010-01-01',
      status: 'active',
    });
    playerA2 = db.insert('players', {
      team_id: teamA.id, first_name: 'Jane', last_name: 'Smith',
      jersey_number: 7, position: 'midfielder', date_of_birth: '2010-02-01',
      status: 'active',
    });
    playerB1 = db.insert('players', {
      team_id: teamB.id, first_name: 'Bob', last_name: 'Jones',
      jersey_number: 9, position: 'striker', date_of_birth: '2010-03-01',
      status: 'active',
    });
  });

  describe('POST /api/matches/:id/lineup', () => {
    it('submits lineup for home team (coach)', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [
            { playerId: playerA1.id, isStarting: true },
            { playerId: playerA2.id, isStarting: false },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchId).toBe(match.id);
      expect(res.body.data.entries).toHaveLength(2);
      expect(res.body.data.isLocked).toBe(false);
    });

    it('transitions match to lineups_submitted on first submission', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      const updated = db.findById('matches', match.id);
      expect(updated.status).toBe('lineups_submitted');
    });

    it('allows re-submission without duplicate status transition error', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [
            { playerId: playerA1.id, isStarting: true },
            { playerId: playerA2.id, isStarting: true },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.entries).toHaveLength(2);
    });

    it('rejects injured player', async () => {
      db.update('players', playerA1.id, { status: 'injured' });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/injured/);
    });

    it('rejects suspended player', async () => {
      db.insert('suspensions', {
        player_id: playerA1.id,
        competition_id: comp.id,
        reason: 'Yellow card accumulation',
        matches_count: 1,
        matches_served: 0,
        is_served: false,
      });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/suspended/);
    });

    it('rejects team not in match', async () => {
      const otherTeam = db.insert('teams', {
        competition_id: comp.id, name: 'Charlie', school_name: 'School C',
        registration_status: 'approved',
      });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: otherTeam.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not part of this match/);
    });

    it('rejects when match status is wrong', async () => {
      db.update('matches', match.id, { status: 'kickoff' });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      expect(res.status).toBe(400);
    });

    it('rejects coach without auth', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      expect(res.status).toBe(401);
    });

    it('rejects official on submit (rbac)', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.official}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/matches/:id/lineup', () => {
    it('returns lineups for a match', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [
            { playerId: playerA1.id, isStarting: true },
            { playerId: playerA2.id, isStarting: false },
          ],
        });

      const res = await request(app)
        .get(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`);

      expect(res.status).toBe(200);
      expect(res.body.data.matchId).toBe(match.id);
      expect(res.body.data.entries).toHaveLength(2);
      expect(res.body.data.entries[0].playerName).toBe('John Doe');
      expect(res.body.data.entries[0].jerseyNumber).toBe(10);
    });

    it('official can read lineups', async () => {
      const res = await request(app)
        .get(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.official}`);

      expect(res.status).toBe(200);
    });

    it('returns empty entries when no lineups submitted', async () => {
      const res = await request(app)
        .get(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`);

      expect(res.status).toBe(200);
      expect(res.body.data.entries).toHaveLength(0);
    });
  });

  describe('POST /api/matches/:id/lineup/lock', () => {
    it('locks lineups (comp_admin)', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup/lock`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isLocked).toBe(true);

      const updated = db.findById('matches', match.id);
      expect(updated.status).toBe('lineups_locked');
    });

    it('rejects lock when no lineups submitted', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });
      // Clear lineups to simulate empty state after status transition
      db.tables.lineups.clear();

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup/lock`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/No lineups/);
    });

    it('rejects lock when match not in lineups_submitted state', async () => {
      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup/lock`)
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(400);
    });

    it('coach cannot lock (rbac)', async () => {
      await request(app)
        .post(`/api/matches/${match.id}/lineup`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          teamId: teamA.id,
          players: [{ playerId: playerA1.id, isStarting: true }],
        });

      const res = await request(app)
        .post(`/api/matches/${match.id}/lineup/lock`)
        .set('Authorization', `Bearer ${tokens.coach}`);

      expect(res.status).toBe(403);
    });
  });
});
