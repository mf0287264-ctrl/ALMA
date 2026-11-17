import postsService from './Posts.service.js';

class PostsController {
  async create(req, res, next) {
    try {
      const post = await postsService.createPost(req.authUser, req.body);
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await postsService.getAllPosts(req.query, req.authUser);
      res.status(200).json({
        success: true,
        data: result.posts,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });
    } catch (error) {
      next(error);
    }
  }

  async getHomeFeed(req, res, next) {
    try {
      const result = await postsService.getHomeFeed(req.authUser, req.query);
      res.status(200).json({
        success: true,
        data: result.posts,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const post = await postsService.getPostById(req.params.id, req.authUser);
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  async getLikes(req, res, next) {
    try {
      const result = await postsService.getPostLikes(req.params.id);
      res.status(200).json({
        success: true,
        count: result.count,
        data: result.likes
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const post = await postsService.updatePost(req.params.id, req.authUser, req.body);
      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await postsService.deletePost(req.params.id, req.authUser);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req, res, next) {
    try {
      const result = await postsService.toggleLikePost(req.params.id, req.authUser);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          liked: result.liked,
          likes_count: result.likes_count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleBookmark(req, res, next) {
    try {
      const result = await postsService.toggleBookmarkPost(req.params.id, req.authUser);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          bookmarked: result.bookmarked,
          bookmarks_count: result.bookmarks_count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async share(req, res, next) {
    try {
      const postId = req.params.id || req.body.postId || req.body.post_id;
      const sharedPost = await postsService.sharePost(postId, req.authUser, req.body);
      res.status(201).json({
        success: true,
        message: 'Post shared successfully',
        data: sharedPost
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostsController();
