const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const fixtureController = require('./fixture.controller');
const { CreateFixtureSchema, UpdateFixtureSchema, BulkCreateFixtureSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/', auth, rbac('fixture:list'), fixtureController.list);
router.get('/:id', auth, rbac('fixture:read'), fixtureController.getById);
router.post('/', auth, rbac('fixture:create'), validate(CreateFixtureSchema), fixtureController.create);
router.post('/bulk', auth, rbac('fixture:create'), validate(BulkCreateFixtureSchema), fixtureController.bulkCreate);
router.post('/generate-round-robin', auth, rbac('fixture:create'), fixtureController.generateRoundRobin);
router.get('/conflicts/:competitionId', auth, rbac('fixture:read'), fixtureController.detectConflicts);
router.patch('/:id', auth, rbac('fixture:update'), validate(UpdateFixtureSchema), fixtureController.update);
router.delete('/:id', auth, rbac('fixture:delete'), fixtureController.delete);

module.exports = router;
