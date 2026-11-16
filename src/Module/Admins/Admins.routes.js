import express from 'express';
import adminsController from './Admins.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate } from '../../Middleware/auth.middleware.js';
import { createAdminSchema, updateAdminSchema, loginAdminSchema } from '../../Validation/Admin.validation.js';

const router = express.Router();

// Public: register an admin
router.post('/', validate(createAdminSchema), adminsController.create);

// Public: login an admin
router.post('/login', validate(loginAdminSchema), adminsController.login);

// Authenticated: get own profile
router.get('/profile', authenticate, adminsController.getProfile);

// Authenticated: update own profile
router.put('/profile', authenticate, validate(updateAdminSchema), adminsController.update);
router.put('/', authenticate, validate(updateAdminSchema), adminsController.update);

// Authenticated or list all
router.get('/', (req, res, next) => {
  if (req.headers.authorization || req.headers.authorize) {
    return authenticate(req, res, () => adminsController.getProfile(req, res, next));
  }
  return adminsController.getAll(req, res, next);
});

router.get('/:id', adminsController.getById);
router.put('/:id', authenticate, validate(updateAdminSchema), adminsController.update);
router.delete('/:id', authenticate, adminsController.delete);

export default router;

