const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const disciplineService = require('../../services/discipline.service');

const router = Router();

router.get('/competitions/:competitionId/cards', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const cards = await disciplineService.getCompetitionCardLeaderboard(req.params.competitionId);
    res.json({ success: true, data: cards });
  } catch (err) { next(err); }
});

router.get('/players/:playerId/cards', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const cards = await disciplineService.getPlayerCardCount(req.params.playerId, req.query.competitionId);
    res.json({ success: true, data: cards });
  } catch (err) { next(err); }
});

router.get('/competitions/:competitionId/suspensions', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const suspensions = await disciplineService.getActiveSuspensions(req.params.competitionId);
    res.json({ success: true, data: suspensions });
  } catch (err) { next(err); }
});

router.get('/players/:playerId/suspensions', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const suspensions = await disciplineService.getSuspensionsByPlayer(req.params.playerId, req.query.competitionId);
    res.json({ success: true, data: suspensions });
  } catch (err) { next(err); }
});

router.get('/competitions/:competitionId/suspended-players', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const playerIds = await disciplineService.getSuspendedPlayerIds(req.params.competitionId);
    res.json({ success: true, data: playerIds });
  } catch (err) { next(err); }
});

router.get('/suspensions', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const suspensions = await disciplineService.listAllSuspensions();
    res.json({ success: true, data: suspensions });
  } catch (err) { next(err); }
});

router.post('/suspensions', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const { playerId, competitionId, reason, matchesCount } = req.body;
    if (!playerId || !competitionId || !reason || !matchesCount) {
      return res.status(400).json({ error: 'playerId, competitionId, reason, and matchesCount are required' });
    }
    const suspension = await disciplineService.createSuspension(playerId, competitionId, reason, Number(matchesCount));
    res.status(201).json({ success: true, data: suspension });
  } catch (err) { next(err); }
});

router.delete('/suspensions/:id', auth, rbac('match:read'), async (req, res, next) => {
  try {
    const deleted = await disciplineService.deleteSuspension(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Suspension not found' });
    res.json({ success: true, data: deleted });
  } catch (err) { next(err); }
});

module.exports = router;
