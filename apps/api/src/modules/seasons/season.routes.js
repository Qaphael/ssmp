const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const seasonController = require('./season.controller');
const { CreateSeasonSchema, UpdateSeasonSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/', auth, rbac('system_admin', 'comp_admin'), seasonController.list);
router.get('/:id', auth, rbac('system_admin', 'comp_admin'), seasonController.getById);
router.post('/', auth, rbac('system_admin', 'comp_admin'), validate(CreateSeasonSchema), seasonController.create);
router.patch('/:id', auth, rbac('system_admin', 'comp_admin'), validate(UpdateSeasonSchema), seasonController.update);
router.patch('/:id/archive', auth, rbac('system_admin', 'comp_admin'), seasonController.archive);
router.delete('/:id', auth, rbac('system_admin'), seasonController.delete);

module.exports = router;
