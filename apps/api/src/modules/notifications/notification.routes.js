const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const notificationController = require('./notification.controller');

const router = Router();

router.get('/',         auth, rbac('notification:list'),   notificationController.list);
router.patch('/read',   auth, rbac('notification:read'),   notificationController.markAsRead);
router.post('/subscribe',    auth, notificationController.subscribe);
router.delete('/subscribe',  auth, notificationController.unsubscribe);
router.post('/device-token', auth, notificationController.registerDeviceToken);
router.delete('/device-token', auth, notificationController.removeDeviceToken);

module.exports = router;
