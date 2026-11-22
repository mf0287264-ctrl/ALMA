import mongoose from 'mongoose';

const quizItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct_option_index: { type: Number, required: true },
  explanation: { type: String, default: '' }
}, { _id: true });

const quizSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: [quizItemSchema],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    generated_by_ai: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
