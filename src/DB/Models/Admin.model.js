const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    admin_code: { type: String, default: null },
    permissions: [{ type: String }],
    profile_image: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Admin', adminSchema);
