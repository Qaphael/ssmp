const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { auth } = require('../../middleware/auth');
const {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} = require('./auth.schemas');
const authController = require('./auth.controller');

const router = Router();

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);
router.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(ResetPasswordSchema), authController.resetPassword);
router.get('/me', auth, authController.getMe);
router.post('/change-password', auth, validate(ChangePasswordSchema), authController.changePassword);
router.put('/profile', auth, validate(UpdateProfileSchema), authController.updateProfile);

module.exports = router;
