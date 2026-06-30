const { Router } = require('express');
const competitionController = require('./competition.controller');

const router = Router();

router.get('/', competitionController.list);
router.get('/:id', competitionController.getById);

module.exports = router;
