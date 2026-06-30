const { Router } = require('express');
const playerController = require('./player.controller');

const router = Router();

router.get('/', playerController.list);
router.get('/:id', playerController.getById);

module.exports = router;
