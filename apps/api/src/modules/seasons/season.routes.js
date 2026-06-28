const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const seasonController = require('./season.controller');
const { CreateSeasonSchema, UpdateSeasonSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',    auth, rbac('season:list'),   seasonController.list);
router.get('/:id', auth, rbac('season:read'),   seasonController.getById);
router.post('/',   auth, rbac('season:create'), validate(CreateSeasonSchema), seasonController.create);
router.patch('/:id', auth, rbac('season:update'), validate(UpdateSeasonSchema), seasonController.update);
router.patch('/:id/archive', auth, rbac('season:archive'), seasonController.archive);
router.delete('/:id', auth, rbac('season:delete'), seasonController.delete);

module.exports = router;
