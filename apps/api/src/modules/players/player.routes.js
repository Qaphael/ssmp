const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const playerController = require('./player.controller');
const { CreatePlayerSchema, UpdatePlayerSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',    auth, rbac('player:list'),   playerController.list);
router.get('/:id', auth, rbac('player:read'),   playerController.getById);
router.post('/',   auth, rbac('player:create'), validate(CreatePlayerSchema), playerController.create);
router.post('/bulk/:teamId', auth, rbac('player:create-bulk'), playerController.createBulk);
router.patch('/:id', auth, rbac('player:update'), validate(UpdatePlayerSchema), playerController.update);
router.patch('/:id/injury', auth, rbac('player:update-injury'), playerController.updateInjuryStatus);
router.delete('/:id/injury', auth, rbac('player:clear-injury'), playerController.clearInjury);
router.delete('/:id', auth, rbac('player:delete'), playerController.delete);

module.exports = router;
