import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    badge_icon: { type: String, default: null },
    category: { type: String, default: 'General' },
    awarded_at: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Achievement', achievementSchema);
