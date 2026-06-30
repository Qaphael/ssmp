const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const newsController = require('./news.controller');

const router = Router();

router.get('/',     auth, rbac('media:list'),    newsController.list);
router.get('/:id',  auth, rbac('media:list'),    newsController.getById);
router.post('/',    auth, rbac('media:create'),  newsController.create);
router.patch('/:id', auth, rbac('media:create'), newsController.update);
router.delete('/:id', auth, rbac('media:delete'), newsController.delete);

module.exports = router;
