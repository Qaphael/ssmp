const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const mediaController = require('./media.controller');
const { CreateMediaSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',       auth, rbac('media:list'),    mediaController.list);
router.get('/:id',    auth, rbac('media:list'),    mediaController.getById);
router.post('/',      auth, rbac('media:create'),  validate(CreateMediaSchema), mediaController.create);
router.patch('/:id/approve', auth, rbac('media:approve'), mediaController.approve);
router.delete('/:id/reject', auth, rbac('media:approve'), mediaController.reject);
router.delete('/:id',        auth, rbac('media:delete'),  mediaController.delete);

module.exports = router;
