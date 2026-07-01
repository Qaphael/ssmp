const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const userController = require('./user.controller');

const router = Router();

router.get('/', auth, rbac('user:list'), userController.list);
router.get('/:id', auth, rbac('user:read'), userController.getById);
router.put('/:id', auth, rbac('user:update'), userController.update);
router.delete('/:id', auth, rbac('user:delete'), userController.deactivate);

module.exports = router;
