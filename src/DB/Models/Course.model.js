import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true },
    grade_level: { type: String, required: true },
    curriculum: { type: String, default: 'General' },
    language: { type: String, default: 'en' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    course_image: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Course', courseSchema);
