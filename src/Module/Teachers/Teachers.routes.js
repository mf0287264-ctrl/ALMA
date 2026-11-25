import express from 'express';
import teachersController from './Teachers.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate, requireRole } from '../../Middleware/auth.middleware.js';
import { multerUpload } from '../../Middleware/multer.middleware.js';
import { uploadProfilePictureHandler, updateUserNameHandler } from '../Users/Users.controller.js';
import { createTeacherSchema, updateTeacherSchema, loginTeacherSchema } from '../../Validation/Teacher.validation.js';

const router = express.Router();

// Name update
router.patch('/name', authenticate, requireRole('teacher', 'admin'), updateUserNameHandler);
router.put('/name', authenticate, requireRole('teacher', 'admin'), updateUserNameHandler);

// Profile picture upload
router.patch('/profile-picture', authenticate, requireRole('teacher', 'admin'), multerUpload({ desiredPath: 'Profiles' }).single('profile'), uploadProfilePictureHandler);
router.post('/profile-picture', authenticate, requireRole('teacher', 'admin'), multerUpload({ desiredPath: 'Profiles' }).single('profile'), uploadProfilePictureHandler);

// Public: register a teacher
router.post('/', validate(createTeacherSchema), teachersController.create);

// Public: login a teacher
router.post('/login', validate(loginTeacherSchema), teachersController.login);

// Authenticated: get own profile
router.get('/profile', authenticate, requireRole('teacher', 'admin'), teachersController.getProfile);

// Authenticated: update own profile
router.put('/profile', authenticate, requireRole('teacher', 'admin'), validate(updateTeacherSchema), teachersController.update);
router.put('/', authenticate, requireRole('teacher', 'admin'), validate(updateTeacherSchema), teachersController.update);

// List all teachers
router.get('/', teachersController.getAll);

router.get('/:id', teachersController.getById);
router.put('/:id', authenticate, requireRole('teacher', 'admin'), validate(updateTeacherSchema), teachersController.update);
router.delete('/:id', authenticate, requireRole('teacher', 'admin'), teachersController.delete);

export default router;

