const request = require('supertest');
const { app } = require('../setup');
const { db } = require('../mock-db');
const { tokens } = require('../helpers');

describe('Transfers', () => {
  let org, season, comp, teamA, teamB, player;

  beforeEach(() => {
    db.reset();
    org = db.insert('organizations', { name: 'Test Org' });
    season = db.insert('seasons', {
      organization_id: org.id, name: '2027',
      start_date: '2027-01-01', end_date: '2027-12-31',
    });
    comp = db.insert('competitions', {
      season_id: season.id, name: 'Football', sport: 'football',
      status: 'in_progress', rules: {},
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
    player = db.insert('players', {
      team_id: teamA.id, first_name: 'Alex', last_name: 'Morgan',
      jersey_number: 10, date_of_birth: '2009-01-01', status: 'active',
    });
  });

  describe('POST /api/transfers', () => {
    it('creates a transfer request (coach)', async () => {
      const res = await request(app)
        .post('/api/transfers')
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({
          playerId: player.id,
          fromTeamId: teamA.id,
          toTeamId: teamB.id,
          competitionId: comp.id,
          reason: 'Better development opportunities',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.player_id).toBe(player.id);
      expect(res.body.data.from_team_id).toBe(teamA.id);
      expect(res.body.data.to_team_id).toBe(teamB.id);
    });

    it('rejects registrar on create', async () => {
      const res = await request(app)
        .post('/api/transfers')
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({
          playerId: player.id,
          fromTeamId: teamA.id,
          toTeamId: teamB.id,
          competitionId: comp.id,
          reason: 'Test',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/transfers', () => {
    it('lists transfers (comp_admin)', async () => {
      db.insert('transfer_requests', {
        player_id: player.id, from_team_id: teamA.id, to_team_id: teamB.id,
        competition_id: comp.id, reason: 'Transfer request', requested_by: 'coach-001', status: 'pending',
      });

      const res = await request(app)
        .get('/api/transfers')
        .set('Authorization', `Bearer ${tokens.comp_admin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PATCH /api/transfers/:id/review', () => {
    it('approves transfer (registrar)', async () => {
      const transfer = db.insert('transfer_requests', {
        player_id: player.id, from_team_id: teamA.id, to_team_id: teamB.id,
        competition_id: comp.id, reason: 'Transfer', requested_by: 'coach-001', status: 'pending',
      });

      const res = await request(app)
        .patch(`/api/transfers/${transfer.id}/review`)
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.reviewed_by).toBeDefined();

      const updatedPlayer = db.findById('players', player.id);
      expect(updatedPlayer.team_id).toBe(teamB.id);
    });

    it('rejects transfer with reason (registrar)', async () => {
      const transfer = db.insert('transfer_requests', {
        player_id: player.id, from_team_id: teamA.id, to_team_id: teamB.id,
        competition_id: comp.id, reason: 'Transfer', requested_by: 'coach-001', status: 'pending',
      });

      const res = await request(app)
        .patch(`/api/transfers/${transfer.id}/review`)
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ status: 'rejected', rejectionReason: 'Team roster is full' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.rejection_reason).toBe('Team roster is full');

      const updatedPlayer = db.findById('players', player.id);
      expect(updatedPlayer.team_id).toBe(teamA.id);
    });

    it('rejects coach on review', async () => {
      const transfer = db.insert('transfer_requests', {
        player_id: player.id, from_team_id: teamA.id, to_team_id: teamB.id,
        competition_id: comp.id, reason: 'Transfer', requested_by: 'coach-001', status: 'pending',
      });

      const res = await request(app)
        .patch(`/api/transfers/${transfer.id}/review`)
        .set('Authorization', `Bearer ${tokens.coach}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
    });

    it('rejects reviewing already-reviewed transfer', async () => {
      const transfer = db.insert('transfer_requests', {
        player_id: player.id, from_team_id: teamA.id, to_team_id: teamB.id,
        competition_id: comp.id, reason: 'Transfer', requested_by: 'coach-001', status: 'approved',
      });

      const res = await request(app)
        .patch(`/api/transfers/${transfer.id}/review`)
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ status: 'rejected', rejectionReason: 'Changed mind' });

      expect(res.status).toBe(400);
    });
  });
});
