const { Router } = require('express');
const teamController = require('./team.controller');

const router = Router();

router.get('/', teamController.list);
router.get('/:id', teamController.getById);

module.exports = router;
