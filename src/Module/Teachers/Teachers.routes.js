import express from 'express';
import teachersController from './Teachers.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate } from '../../Middleware/auth.middleware.js';
import { createTeacherSchema, updateTeacherSchema, loginTeacherSchema } from '../../Validation/Teacher.validation.js';

const router = express.Router();

// Public: register a teacher
router.post('/', validate(createTeacherSchema), teachersController.create);

// Public: login a teacher
router.post('/login', validate(loginTeacherSchema), teachersController.login);

// Authenticated: get own profile
router.get('/profile', authenticate, teachersController.getProfile);

// Authenticated: update own profile
router.put('/profile', authenticate, validate(updateTeacherSchema), teachersController.update);
router.put('/', authenticate, validate(updateTeacherSchema), teachersController.update);

// Authenticated or list all
router.get('/', (req, res, next) => {
  if (req.headers.authorization || req.headers.authorize) {
    return authenticate(req, res, () => teachersController.getProfile(req, res, next));
  }
  return teachersController.getAll(req, res, next);
});

router.get('/:id', teachersController.getById);
router.put('/:id', authenticate, validate(updateTeacherSchema), teachersController.update);
router.delete('/:id', authenticate, teachersController.delete);

export default router;

