import { ObjectId } from 'mongodb';
import postsRepository from './Posts.repository.js';
import studentsRepository from '../Students/Students.repository.js';

const ROLE_MODEL_MAP = {
  student: 'Student',
  teacher: 'Teacher',
  parent: 'Parent',
  admin: 'Admin'
};

class PostsService {
  _getAuthorName(user) {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.name || 'Anonymous User';
  }

  _annotatePost(post, currentUser) {
    if (!currentUser || !post) return post;
    const currentUserIdStr = currentUser._id.toString();

    const is_liked = Array.isArray(post.likes) && post.likes.some(
      (like) => like.user_id && like.user_id.toString() === currentUserIdStr
    );

    const is_bookmarked = Array.isArray(post.bookmarks) && post.bookmarks.some(
      (bm) => bm.user_id && bm.user_id.toString() === currentUserIdStr
    );

    return {
      ...post,
      is_liked,
      is_bookmarked
    };
  }

  async createPost(currentUser, data) {
    if (!currentUser) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const authorRole = currentUser.role || 'student';
    const authorModel = ROLE_MODEL_MAP[authorRole] || 'Student';
    const authorName = this._getAuthorName(currentUser);
    const authorImage = currentUser.profile_image || null;

    const postPayload = {
      content: data.content,
      title: data.title || null,
      media: Array.isArray(data.media) ? data.media : [],
      author_id: new ObjectId(currentUser._id),
      author_role: authorRole,
      author_model: authorModel,
      author_name: authorName,
      author_image: authorImage,
      likes: [],
      likes_count: 0,
      bookmarks: [],
      bookmarks_count: 0,
      shares_count: 0,
      shared_from: null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      visibility: data.visibility || 'public'
    };

    const createdPost = await postsRepository.create(postPayload);
    return this._annotatePost(createdPost, currentUser);
  }

  async getAllPosts(query = {}, currentUser = null) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));

    const filter = {};

    if (query.tag) {
      filter.tags = query.tag.toLowerCase().trim();
    }

    if (query.author_id) {
      filter.author_id = new ObjectId(query.author_id);
    }

    if (query.role) {
      filter.author_role = query.role.toLowerCase().trim();
    }

    if (query.search) {
      filter.content = { $regex: query.search, $options: 'i' };
    }

    // By default, public posts or posts authored by current user
    if (!currentUser) {
      filter.visibility = 'public';
    }

    const { posts, total } = await postsRepository.findAll(filter, {
      page,
      limit,
      sort: { created_at: -1 }
    });

    const annotatedPosts = posts.map((p) => this._annotatePost(p, currentUser));

    return {
      posts: annotatedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getHomeFeed(currentUser, query = {}) {
    if (!currentUser) {
      const error = new Error('Authentication required for home feed');
      error.statusCode = 401;
      throw error;
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const currentUserId = new ObjectId(currentUser._id);

    // If current user is a student, re-read following list to be fully up-to-date
    let followingIds = [];
    if (currentUser.role === 'student') {
      const student = await studentsRepository.findById(currentUser._id);
      if (student && Array.isArray(student.following)) {
        followingIds = student.following.map((id) =>
          typeof id === 'string' ? new ObjectId(id) : id
        );
      }
    } else if (Array.isArray(currentUser.following)) {
      followingIds = currentUser.following.map((id) =>
        typeof id === 'string' ? new ObjectId(id) : id
      );
    }

    const relevantAuthorIds = [...followingIds, currentUserId];

    let filter = {};
    if (followingIds.length > 0) {
      // Home Feed prioritizes followed users and own posts, alongside public posts
      filter = {
        $or: [
          { author_id: { $in: relevantAuthorIds } },
          { visibility: 'public' }
        ]
      };
    } else {
      filter = { visibility: 'public' };
    }

    const { posts, total } = await postsRepository.findAll(filter, {
      page,
      limit,
      sort: { created_at: -1 }
    });

    const annotatedPosts = posts.map((p) => this._annotatePost(p, currentUser));

    return {
      posts: annotatedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPostById(postId, currentUser = null) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await postsRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    return this._annotatePost(post, currentUser);
  }

  async getPostLikes(postId) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await postsRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      count: post.likes ? post.likes.length : 0,
      likes: post.likes || []
    };
  }

  async updatePost(postId, currentUser, updateData) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await postsRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const isAuthor = post.author_id.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      const error = new Error('Unauthorized to update this post');
      error.statusCode = 403;
      throw error;
    }

    const fieldsToUpdate = {};
    if (updateData.content !== undefined) fieldsToUpdate.content = updateData.content;
    if (updateData.title !== undefined) fieldsToUpdate.title = updateData.title;
    if (updateData.media !== undefined) fieldsToUpdate.media = updateData.media;
    if (updateData.tags !== undefined) fieldsToUpdate.tags = updateData.tags;
    if (updateData.visibility !== undefined) fieldsToUpdate.visibility = updateData.visibility;

    const updated = await postsRepository.update(postId, fieldsToUpdate);
    return this._annotatePost(updated, currentUser);
  }

  async deletePost(postId, currentUser) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await postsRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const isAuthor = post.author_id.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      const error = new Error('Unauthorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    await postsRepository.delete(postId);
    return { message: 'Post deleted successfully' };
  }

  async toggleLikePost(postId, currentUser) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await postsRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const currentUserIdStr = currentUser._id.toString();
    const alreadyLiked = Array.isArray(post.likes) && post.likes.some(
      (like) => like.user_id && like.user_id.toString() === currentUserIdStr
    );

    if (alreadyLiked) {
      const updatedPost = await postsRepository.removeLike(postId, currentUser._id);
      return {
        liked: false,
        likes_count: updatedPost ? updatedPost.likes_count : 0,
        message: 'Post unliked successfully'
      };
    } else {
      const likeData = {
        user_id: new ObjectId(currentUser._id),
        role: currentUser.role || 'student',
        name: this._getAuthorName(currentUser),
        profile_image: currentUser.profile_image || null,
        liked_at: new Date()
      };
      const updatedPost = await postsRepository.addLike(postId, likeData);
      return {
        liked: true,
        likes_count: updatedPost ? updatedPost.likes_count : 1,
        message: 'Post liked successfully'
      };
    }
  }

  async toggleBookmarkPost(postId, currentUser) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const post = await postsRepository.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const currentUserIdStr = currentUser._id.toString();
    const alreadyBookmarked = Array.isArray(post.bookmarks) && post.bookmarks.some(
      (bm) => bm.user_id && bm.user_id.toString() === currentUserIdStr
    );

    if (alreadyBookmarked) {
      const updatedPost = await postsRepository.removeBookmark(postId, currentUser._id);
      if (currentUser.role === 'student') {
        await studentsRepository.removeBookmark(currentUser._id, postId);
      }
      return {
        bookmarked: false,
        bookmarks_count: updatedPost ? updatedPost.bookmarks_count : 0,
        message: 'Post unbookmarked successfully'
      };
    } else {
      const bookmarkData = {
        user_id: new ObjectId(currentUser._id),
        role: currentUser.role || 'student',
        bookmarked_at: new Date()
      };
      const updatedPost = await postsRepository.addBookmark(postId, bookmarkData);
      if (currentUser.role === 'student') {
        await studentsRepository.addBookmark(currentUser._id, postId);
      }
      return {
        bookmarked: true,
        bookmarks_count: updatedPost ? updatedPost.bookmarks_count : 1,
        message: 'Post bookmarked successfully'
      };
    }
  }

  async sharePost(postId, currentUser, shareData = {}) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }

    const originalPost = await postsRepository.findById(postId);
    if (!originalPost) {
      const error = new Error('Original post not found');
      error.statusCode = 404;
      throw error;
    }

    // Increment share counter on the original post
    await postsRepository.incrementShareCount(postId);

    const authorRole = currentUser.role || 'student';
    const authorModel = ROLE_MODEL_MAP[authorRole] || 'Student';
    const authorName = this._getAuthorName(currentUser);
    const authorImage = currentUser.profile_image || null;

    const sharedPostPayload = {
      content: shareData.content || `Shared post from ${originalPost.author_name}`,
      title: shareData.title || null,
      media: originalPost.media || [],
      author_id: new ObjectId(currentUser._id),
      author_role: authorRole,
      author_model: authorModel,
      author_name: authorName,
      author_image: authorImage,
      likes: [],
      likes_count: 0,
      bookmarks: [],
      bookmarks_count: 0,
      shares_count: 0,
      shared_from: {
        post_id: originalPost._id,
        author_id: originalPost.author_id,
        author_name: originalPost.author_name,
        author_role: originalPost.author_role,
        content: originalPost.content,
        media: originalPost.media || []
      },
      tags: originalPost.tags || [],
      visibility: shareData.visibility || 'public'
    };

    const newPost = await postsRepository.create(sharedPostPayload);
    return this._annotatePost(newPost, currentUser);
  }
}

export default new PostsService();
