const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const matchEventController = require('./match-event.controller');
const { CreateMatchEventSchema } = require('@ssmp/shared-types');

const router = Router({ mergeParams: true });

router.get('/:id/events', auth, rbac('match:read'), matchEventController.listByMatch);
router.post('/:id/events', auth, rbac('match:record-event'), validate(CreateMatchEventSchema), matchEventController.create);

module.exports = router;
