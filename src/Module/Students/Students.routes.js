import express from 'express';
import studentsController from './Students.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate, requireRole } from '../../Middleware/auth.middleware.js';
import { multerUpload } from '../../Middleware/multer.middleware.js';
import { uploadProfilePictureHandler, updateUserNameHandler } from '../Users/Users.controller.js';
import { createStudentSchema, updateStudentSchema, loginStudentSchema } from '../../Validation/Student.validation.js';

const router = express.Router();

// Name update
router.patch('/name', authenticate, requireRole('student', 'admin'), updateUserNameHandler);
router.put('/name', authenticate, requireRole('student', 'admin'), updateUserNameHandler);

// Profile picture upload (PATCH and POST)
router.patch('/profile-picture', authenticate, requireRole('student', 'admin'), multerUpload({ desiredPath: 'Profiles' }).single('profile'), uploadProfilePictureHandler);
router.post('/profile-picture', authenticate, requireRole('student', 'admin'), multerUpload({ desiredPath: 'Profiles' }).single('profile'), uploadProfilePictureHandler);

// Public: register a student
router.post('/', validate(createStudentSchema), studentsController.create);

// Public: login a student
router.post('/login', validate(loginStudentSchema), studentsController.login);

// Authenticated: get own profile from database
router.get('/profile', authenticate, requireRole('student', 'admin'), studentsController.getProfile);

// If authorization header is sent, get profile from database; otherwise list all
router.get('/', (req, res, next) => {
  if (req.headers.authorization || req.headers.authorize) {
    return authenticate(req, res, () => {
      if (req.authUser?.role !== 'student' && req.authUser?.role !== 'admin') {
        const error = new Error("Forbidden: Access denied. Role 'student' required.");
        error.statusCode = 403;
        return next(error);
      }
      return studentsController.getProfile(req, res, next);
    });
  }
  return studentsController.getAll(req, res, next);
});

// Authenticated: update own profile
router.put('/', authenticate, requireRole('student', 'admin'), validate(updateStudentSchema), studentsController.update);

// Authenticated: delete own account
router.delete('/', authenticate, requireRole('student', 'admin'), studentsController.delete);

// Authenticated: Dashboard Summary
router.get('/dashboard-summary', authenticate, requireRole('student', 'admin'), studentsController.getDashboardSummary);

// Authenticated: Social & Friends
router.get('/friends/me', authenticate, studentsController.getMyFriends);
router.get('/search', authenticate, studentsController.searchStudents);
router.post('/friend-request/:id', authenticate, studentsController.sendFriendRequest);
router.post('/:id/friend-request', authenticate, studentsController.sendFriendRequest);
router.post('/accept-friend-request/:id', authenticate, studentsController.acceptFriendRequest);
router.put('/:id/accept-friend', authenticate, studentsController.acceptFriendRequest);
router.post('/reject-friend-request/:id', authenticate, studentsController.rejectFriendRequest);
router.put('/:id/reject-friend', authenticate, studentsController.rejectFriendRequest);
router.get('/:id/following', studentsController.getFollowing);
router.get('/:id/followers', studentsController.getFollowers);

// Routes by :id
router.get('/:id', studentsController.getById);
router.put('/:id', authenticate, validate(updateStudentSchema), studentsController.update);
router.delete('/:id', authenticate, studentsController.delete);

export default router;
