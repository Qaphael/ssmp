const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const matchController = require('./match.controller');
const matchEventController = require('./match-event.controller');
const lineupRoutes = require('../lineups/lineup.routes');
const {
  CreateMatchSchema,
  UpdateMatchStatusSchema,
  RecordWalkoverSchema,
  RecordPostponementSchema,
  CreateMatchEventSchema,
} = require('@ssmp/shared-types');

const router = Router();

router.get('/', auth, rbac('match:list'), matchController.list);
router.get('/:id', auth, rbac('match:read'), matchController.getById);
router.post('/', auth, rbac('match:create'), validate(CreateMatchSchema), matchController.create);
router.patch('/:id/status', auth, rbac('match:update-status'), validate(UpdateMatchStatusSchema), matchController.updateStatus);
router.post('/:id/assign-official', auth, rbac('official:assign'), matchController.assignOfficial);
router.post('/:id/submit-report', auth, rbac('match:submit-report'), matchController.submitReport);
router.post('/:id/verify', auth, rbac('match:verify'), matchController.verify);
router.post('/:id/publish', auth, rbac('match:verify'), matchController.publish);
router.post('/:id/walkover', auth, rbac('match:walkover'), validate(RecordWalkoverSchema), matchController.recordWalkover);
router.post('/:id/postpone', auth, rbac('match:postpone'), validate(RecordPostponementSchema), matchController.postpone);
router.get('/:id/events', auth, rbac('match:read'), matchEventController.listByMatch);
router.post('/:id/events', auth, rbac('match:record-event'), validate(CreateMatchEventSchema), matchEventController.create);

router.use('/:id/lineup', lineupRoutes);

module.exports = router;
