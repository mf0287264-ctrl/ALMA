const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    student_code: { type: String, required: true, unique: true, trim: true },
    grade_level: { type: String, required: true },
    school_name: { type: String, default: null },
    profile_image: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    parent_phone: { type: String, default: null },
    national_id: { type: String, default: null },
    achievement: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Student', studentSchema);
