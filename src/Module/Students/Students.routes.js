import express from 'express';
import studentsController from './Students.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate } from '../../Middleware/auth.middleware.js';
import { createStudentSchema, updateStudentSchema, loginStudentSchema } from '../../Validation/Student.validation.js';

const router = express.Router();

// Public: register a student
router.post('/', validate(createStudentSchema), studentsController.create);

// Public: login a student
router.post('/login', validate(loginStudentSchema), studentsController.login);

// Authenticated: get own profile from database
router.get('/profile', authenticate, studentsController.getProfile);

// If authorization header is sent, get profile from database; otherwise list all
router.get('/', (req, res, next) => {
  if (req.headers.authorization || req.headers.authorize) {
    return authenticate(req, res, () => studentsController.getProfile(req, res, next));
  }
  return studentsController.getAll(req, res, next);
});

// Authenticated: update own profile
router.put('/', authenticate, validate(updateStudentSchema), studentsController.update);

// Authenticated: delete own account
router.delete('/', authenticate, studentsController.delete);

// Routes by :id
router.get('/:id', studentsController.getById);
router.put('/:id', authenticate, validate(updateStudentSchema), studentsController.update);
router.delete('/:id', authenticate, studentsController.delete);

export default router;
