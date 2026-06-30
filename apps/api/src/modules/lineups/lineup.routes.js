const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const lineupController = require('./lineup.controller');
const { SubmitLineupSchema } = require('@ssmp/shared-types');

const router = Router({ mergeParams: true });

router.get('/', auth, rbac('lineup:read'), lineupController.getByMatch);
router.post('/', auth, rbac('lineup:submit'), validate(SubmitLineupSchema), lineupController.submit);
router.post('/lock', auth, rbac('lineup:lock'), lineupController.lock);

module.exports = router;
