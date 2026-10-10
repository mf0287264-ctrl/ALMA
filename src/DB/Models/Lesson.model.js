import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  explanation: { type: String, required: true },
  code_example: {
    code: { type: String },
    language: { type: String, default: 'python' },
    output_explanation: { type: String }
  },
  key_takeaways: [{ type: String }]
}, { _id: false });

const lessonSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    learning_objectives: [{ type: String }],
    sections: [sectionSchema],
    language: { type: String, default: 'en' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    estimated_duration_minutes: { type: Number, default: 30 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    generation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonGeneration', default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    published_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Lesson', lessonSchema);
