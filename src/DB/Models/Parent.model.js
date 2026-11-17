import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password_hash: { type: String, required: true },
    parent_code: { type: String, required: true, unique: true, trim: true },
    phone_number: { type: String, default: null, trim: true },
    national_id: { type: String, default: null, trim: true },
    profile_image: { type: String, default: null },
    relation: {
      type: String,
      enum: ['father', 'mother', 'guardian'],
      default: 'guardian'
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    role: { type: String, default: 'parent' },
    is_active: { type: Boolean, default: true },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.Parent || mongoose.model('Parent', parentSchema);
