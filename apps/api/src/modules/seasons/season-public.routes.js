const { Router } = require('express');
const seasonController = require('./season.controller');

const router = Router();

router.get('/', seasonController.list);
router.get('/:id', seasonController.getById);

module.exports = router;
