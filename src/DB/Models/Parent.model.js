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
    profileImage: { type: String, default: null },
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
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    privacy_settings: {
      show_alma_questions: { type: Boolean, default: false },
      show_session_times: { type: Boolean, default: true },
      weekly_report_email: { type: Boolean, default: true }
    },
    alert_rules: {
      streak_broken: { type: Boolean, default: true },
      new_struggling_concept: { type: Boolean, default: true },
      session_abandoned: { type: Boolean, default: false },
      new_achievement: { type: Boolean, default: true },
      delivery_channel: { type: String, enum: ['email', 'sms'], default: 'email' }
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.Parent || mongoose.model('Parent', parentSchema);
