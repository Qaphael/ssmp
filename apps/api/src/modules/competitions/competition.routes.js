const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const competitionController = require('./competition.controller');
const { CreateCompetitionSchema, UpdateCompetitionSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',    auth, rbac('competition:list'),   competitionController.list);
router.get('/:id', auth, rbac('competition:read'),   competitionController.getById);
router.post('/',   auth, rbac('competition:create'), validate(CreateCompetitionSchema), competitionController.create);
router.patch('/:id', auth, rbac('competition:update'), validate(UpdateCompetitionSchema), competitionController.update);
router.delete('/:id', auth, rbac('competition:delete'), competitionController.delete);

module.exports = router;
