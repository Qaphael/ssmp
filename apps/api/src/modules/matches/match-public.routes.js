const { Router } = require('express');
const matchController = require('./match.controller');
const matchEventController = require('./match-event.controller');

const router = Router();

router.get('/', matchController.list);
router.get('/:id', matchController.getById);
router.get('/:id/events', matchEventController.listByMatch);

module.exports = router;
