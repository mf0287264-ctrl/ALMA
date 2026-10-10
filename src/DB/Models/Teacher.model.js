import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    teacher_code: { type: String, required: true, unique: true, trim: true },
    specialization: { type: String, required: true },
    school_name: { type: String, default: null },
    profile_image: { type: String, default: null },
    phone_number: { type: String, default: null },
    is_active: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Teacher', teacherSchema);
