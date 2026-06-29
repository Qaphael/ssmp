const { Router } = require('express');
const standingsController = require('./standings.controller');

const router = Router();

router.get('/:competitionId', standingsController.getByCompetition);

module.exports = router;
