const { Router } = require('express');
const mediaController = require('./media.controller');

const router = Router();

router.get('/', mediaController.list);
router.get('/:id', mediaController.getById);

module.exports = router;
