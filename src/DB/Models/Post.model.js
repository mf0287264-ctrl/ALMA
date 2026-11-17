import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin'],
      default: 'student'
    },
    name: { type: String, default: null },
    profile_image: { type: String, default: null },
    liked_at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const bookmarkSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin'],
      default: 'student'
    },
    bookmarked_at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const sharedFromSchema = new mongoose.Schema(
  {
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    author_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    author_name: { type: String, default: null },
    author_role: { type: String, default: null },
    content: { type: String, default: null },
    media: [{ type: String }]
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    title: { type: String, default: null, trim: true },
    media: [{ type: String }],
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'author_model'
    },
    author_role: {
      type: String,
      required: true,
      enum: ['student', 'teacher', 'parent', 'admin']
    },
    author_model: {
      type: String,
      required: true,
      enum: ['Student', 'Teacher', 'Parent', 'Admin'],
      default: 'Student'
    },
    author_name: { type: String, required: true },
    author_image: { type: String, default: null },
    likes: [likeSchema],
    likes_count: { type: Number, default: 0 },
    bookmarks: [bookmarkSchema],
    bookmarks_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    shared_from: { type: sharedFromSchema, default: null },
    tags: [{ type: String, trim: true }],
    visibility: {
      type: String,
      enum: ['public', 'followers', 'friends'],
      default: 'public'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

postSchema.index({ author_id: 1, created_at: -1 });
postSchema.index({ created_at: -1 });
postSchema.index({ tags: 1 });

export default mongoose.models.Post || mongoose.model('Post', postSchema);
