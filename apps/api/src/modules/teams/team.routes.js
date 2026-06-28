const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const teamController = require('./team.controller');
const { CreateTeamSchema, UpdateTeamSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',    auth, rbac('team:list'),   teamController.list);
router.get('/:id', auth, rbac('team:read'),   teamController.getById);
router.post('/',   auth, rbac('team:create'), validate(CreateTeamSchema), teamController.create);
router.patch('/:id', auth, rbac('team:update'), validate(UpdateTeamSchema), teamController.update);
router.post('/:id/assign-coach',   auth, rbac('team:assign-coach'),   teamController.assignCoach);
router.patch('/:id/registration',  auth, rbac('team:approve-registration'), teamController.approveRegistration);
router.patch('/:id/roster-approval', auth, rbac('team:approve-roster'), teamController.approveRoster);
router.delete('/:id', auth, rbac('team:delete'), teamController.delete);

module.exports = router;
