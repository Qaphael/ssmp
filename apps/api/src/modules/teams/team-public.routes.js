const { Router } = require('express');
const teamService = require('./team.service');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await teamService.list(req.query, null, null);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const team = await teamService.getById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
