const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const playerController = require('./player.controller');
const {
  CreatePlayerSchema,
  UpdatePlayerSchema,
  PlayerFilterSchema,
} = require('@ssmp/shared-types');

const router = Router();

router.get(
  '/',
  auth,
  rbac('system_admin', 'comp_admin', 'registrar', 'coach'),
  playerController.list
);

router.get(
  '/:id',
  auth,
  rbac('system_admin', 'comp_admin', 'registrar', 'coach'),
  playerController.getById
);

router.post(
  '/',
  auth,
  rbac('system_admin', 'comp_admin', 'coach'),
  validate(CreatePlayerSchema),
  playerController.create
);

router.post(
  '/bulk/:teamId',
  auth,
  rbac('system_admin', 'comp_admin', 'coach'),
  playerController.createBulk
);

router.patch(
  '/:id',
  auth,
  rbac('system_admin', 'comp_admin', 'coach'),
  validate(UpdatePlayerSchema),
  playerController.update
);

router.patch(
  '/:id/injury',
  auth,
  rbac('system_admin', 'comp_admin', 'coach'),
  playerController.updateInjuryStatus
);

router.delete(
  '/:id/injury',
  auth,
  rbac('system_admin', 'comp_admin', 'coach'),
  playerController.clearInjury
);

router.delete(
  '/:id',
  auth,
  rbac('system_admin', 'comp_admin'),
  playerController.delete
);

module.exports = router;
