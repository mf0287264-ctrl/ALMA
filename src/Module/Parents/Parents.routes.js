import express from 'express';
import parentsController from './Parents.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate } from '../../Middleware/auth.middleware.js';
import {
  createParentSchema,
  updateParentSchema,
  loginParentSchema,
  linkChildSchema,
  sendMessageSchema
} from '../../Validation/Parent.validation.js';

const router = express.Router();

// Public: register & login
router.post('/', validate(createParentSchema), parentsController.create);
router.post('/login', validate(loginParentSchema), parentsController.login);

// Authenticated: parent profile & children
router.get('/profile', authenticate, parentsController.getProfile);
router.put('/profile', authenticate, validate(updateParentSchema), parentsController.update);
router.get('/children', authenticate, parentsController.getChildren);

// Authenticated: Link & Unlink child & view child progress
router.post('/link-child', authenticate, validate(linkChildSchema), parentsController.linkChild);
router.post('/unlink-child', authenticate, parentsController.unlinkChild);
router.delete('/child/:childId', authenticate, parentsController.unlinkChild);
router.get('/child/:childId/progress', authenticate, parentsController.getChildProgress);

// Authenticated: Messages to teachers
router.post('/messages', authenticate, validate(sendMessageSchema), parentsController.sendMessage);
router.get('/messages', authenticate, parentsController.getMessages);

// Authenticated or list all
router.get('/', (req, res, next) => {
  if (req.headers.authorization || req.headers.authorize) {
    return authenticate(req, res, () => parentsController.getProfile(req, res, next));
  }
  return parentsController.getAll(req, res, next);
});

router.put('/', authenticate, validate(updateParentSchema), parentsController.update);
router.delete('/', authenticate, parentsController.delete);

router.get('/:id', parentsController.getById);
router.put('/:id', authenticate, validate(updateParentSchema), parentsController.update);
router.delete('/:id', authenticate, parentsController.delete);

export default router;
