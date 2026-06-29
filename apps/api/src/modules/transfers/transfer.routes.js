const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const transferController = require('./transfer.controller');
const { CreateTransferRequestSchema, ReviewTransferSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',    auth, rbac('transfer:list'),   transferController.list);
router.get('/:id', auth, rbac('transfer:read'),   transferController.getById);
router.post('/',   auth, rbac('transfer:create'), validate(CreateTransferRequestSchema), transferController.create);
router.patch('/:id/review', auth, rbac('transfer:review'), validate(ReviewTransferSchema), transferController.review);

module.exports = router;
