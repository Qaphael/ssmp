const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const { rbac } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const organizationController = require('./organization.controller');
const { CreateOrganizationSchema, UpdateOrganizationSchema } = require('@ssmp/shared-types');

const router = Router();

router.get('/', auth, rbac('system_admin', 'comp_admin'), organizationController.list);
router.get('/:id', auth, rbac('system_admin', 'comp_admin'), organizationController.getById);
router.post('/', auth, rbac('system_admin'), validate(CreateOrganizationSchema), organizationController.create);
router.patch('/:id', auth, rbac('system_admin'), validate(UpdateOrganizationSchema), organizationController.update);
router.delete('/:id', auth, rbac('system_admin'), organizationController.delete);

module.exports = router;
