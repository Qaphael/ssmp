const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { RegisterSchema, LoginSchema } = require('./auth.schemas');
const authController = require('./auth.controller');

const router = Router();

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);

module.exports = router;
