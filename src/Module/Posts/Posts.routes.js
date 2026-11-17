import express from 'express';
import postsController from './Posts.controller.js';
import { authenticate, optionalAuthenticate } from '../../Middleware/auth.middleware.js';
import { validate } from '../../Middleware/validation.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  sharePostSchema
} from '../../Validation/Post.validation.js';

const router = express.Router();

// 1. Get All Posts (with optional auth so client gets is_liked / is_bookmarked flags)
router.get('/', optionalAuthenticate, postsController.getAll);

// 2. Get Home Feed (authenticated - personalized feed of followed users & self)
router.get('/feed', authenticate, postsController.getHomeFeed);
router.get('/home-feed', authenticate, postsController.getHomeFeed);

// 3. Create Post (authenticated: student, teacher, parent, admin)
router.post('/', authenticate, validate(createPostSchema), postsController.create);

// 10b. Share Post with post_id in body
router.post('/share', authenticate, validate(sharePostSchema), postsController.share);

// 4. Get Single Post
router.get('/:id', optionalAuthenticate, postsController.getById);

// 5. Get Post likes
router.get('/:id/likes', postsController.getLikes);

// 6. Update Post (only author or admin)
router.put('/:id', authenticate, validate(updatePostSchema), postsController.update);

// 7. Delete Post (only author or admin)
router.delete('/:id', authenticate, postsController.delete);

// 8. Like / Unlike Post (toggle like)
router.put('/:id/like', authenticate, postsController.toggleLike);
router.put('/:id/like-unlike', authenticate, postsController.toggleLike);

// 9. Bookmark / Unbookmark Post (toggle bookmark)
router.put('/:id/bookmark', authenticate, postsController.toggleBookmark);
router.put('/:id/bookmark-unbookmark', authenticate, postsController.toggleBookmark);

// 10. Share Post (with :id in url)
router.post('/:id/share', authenticate, validate(sharePostSchema), postsController.share);

export default router;
