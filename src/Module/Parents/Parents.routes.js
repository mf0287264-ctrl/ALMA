import express from 'express';
import parentsController from './Parents.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate, requireRole } from '../../Middleware/auth.middleware.js';
import { multerUpload } from '../../Middleware/multer.middleware.js';
import { uploadProfilePictureHandler, updateUserNameHandler } from '../Users/Users.controller.js';
import {
  createParentSchema,
  updateParentSchema,
  loginParentSchema,
  linkChildSchema,
  sendMessageSchema
} from '../../Validation/Parent.validation.js';

const router = express.Router();

// Name update
router.patch('/name', authenticate, requireRole('parent'), updateUserNameHandler);
router.put('/name', authenticate, requireRole('parent'), updateUserNameHandler);

// Profile picture upload
router.patch('/profile-picture', authenticate, requireRole('parent'), multerUpload({ desiredPath: 'Profiles' }).single('profile'), uploadProfilePictureHandler);
router.post('/profile-picture', authenticate, requireRole('parent'), multerUpload({ desiredPath: 'Profiles' }).single('profile'), uploadProfilePictureHandler);

// Public: register & login
router.post('/', validate(createParentSchema), parentsController.create);
router.post('/login', validate(loginParentSchema), parentsController.login);

// Authenticated: parent profile & children (strictly restricted to parents)
router.get('/profile', authenticate, requireRole('parent'), parentsController.getProfile);
router.put('/profile', authenticate, requireRole('parent'), validate(updateParentSchema), parentsController.update);
router.get('/children', authenticate, requireRole('parent'), parentsController.getChildren);

// Authenticated: Link & Unlink child & view child progress
router.post('/link-child', authenticate, requireRole('parent'), validate(linkChildSchema), parentsController.linkChild);
router.post('/unlink-child', authenticate, requireRole('parent'), parentsController.unlinkChild);
router.delete('/child/:childId', authenticate, requireRole('parent'), parentsController.unlinkChild);
router.get('/child/:childId/progress', authenticate, requireRole('parent'), parentsController.getChildProgress);

// Authenticated: Messages to teachers
router.post('/messages', authenticate, requireRole('parent'), validate(sendMessageSchema), parentsController.sendMessage);
router.get('/messages', authenticate, requireRole('parent'), parentsController.getMessages);

router.get('/', authenticate, requireRole('parent'), parentsController.getProfile);

router.put('/', authenticate, requireRole('parent'), validate(updateParentSchema), parentsController.update);
router.delete('/', authenticate, requireRole('parent'), parentsController.delete);

router.get('/:id', authenticate, requireRole('parent', 'admin'), parentsController.getById);
router.put('/:id', authenticate, requireRole('parent'), validate(updateParentSchema), parentsController.update);
router.delete('/:id', authenticate, requireRole('parent'), parentsController.delete);

export default router;
