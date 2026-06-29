const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const auditController = require('./audit.controller');

const router = Router();

router.get('/',    auth, rbac('audit:list'),   auditController.list);
router.get('/:id', auth, rbac('audit:read'),   auditController.getById);

module.exports = router;
