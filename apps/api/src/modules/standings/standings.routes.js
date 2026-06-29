const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const standingsController = require('./standings.controller');

const router = Router();

router.get('/:competitionId', auth, standingsController.getByCompetition);

module.exports = router;
