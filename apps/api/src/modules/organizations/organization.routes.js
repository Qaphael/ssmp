const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const organizationController = require('./organization.controller');
const { CreateOrganizationSchema, UpdateOrganizationSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/',    auth, rbac('organization:list'),   organizationController.list);
router.get('/:id', auth, rbac('organization:read'),   organizationController.getById);
router.post('/',   auth, rbac('organization:create'), validate(CreateOrganizationSchema), organizationController.create);
router.patch('/:id', auth, rbac('organization:update'), validate(UpdateOrganizationSchema), organizationController.update);
router.delete('/:id', auth, rbac('organization:delete'), organizationController.delete);

module.exports = router;
