const { Router } = require('express');
const organizationController = require('./organization.controller');

const router = Router();

router.get('/', organizationController.list);
router.get('/:id', organizationController.getById);

module.exports = router;
