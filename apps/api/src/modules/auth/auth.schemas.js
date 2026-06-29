const { z } = require('zod');
const { ROLES } = require('../../middleware/permissions');

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum([
    ROLES.COACH,
    ROLES.OFFICIAL,
    ROLES.MEDIA_OFFICER,
    ROLES.REGISTRAR,
    ROLES.REF_COORDINATOR,
    ROLES.COMP_ADMIN,
    ROLES.SYSTEM_ADMIN,
  ]),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { RegisterSchema, LoginSchema };
