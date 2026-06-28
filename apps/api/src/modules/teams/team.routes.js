const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const teamController = require('./team.controller');
const { CreateTeamSchema, UpdateTeamSchema, TeamFilterSchema } = require('@ssmp/shared-types');

const router = Router();

router.get(
  '/',
  auth,
  rbac('system_admin', 'comp_admin', 'registrar', 'coach'),
  teamController.list
);

router.get(
  '/:id',
  auth,
  rbac('system_admin', 'comp_admin', 'registrar', 'coach'),
  teamController.getById
);

router.post(
  '/',
  auth,
  rbac('system_admin', 'comp_admin'),
  validate(CreateTeamSchema),
  teamController.create
);

router.patch(
  '/:id',
  auth,
  rbac('system_admin', 'comp_admin', 'coach'),
  validate(UpdateTeamSchema),
  teamController.update
);

router.post(
  '/:id/assign-coach',
  auth,
  rbac('system_admin', 'comp_admin'),
  teamController.assignCoach
);

router.patch(
  '/:id/registration',
  auth,
  rbac('system_admin', 'registrar'),
  teamController.approveRegistration
);

router.patch(
  '/:id/roster-approval',
  auth,
  rbac('system_admin', 'registrar'),
  teamController.approveRoster
);

router.delete(
  '/:id',
  auth,
  rbac('system_admin'),
  teamController.delete
);

module.exports = router;
