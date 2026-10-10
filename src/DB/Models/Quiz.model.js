const mongoose = require('mongoose');

const quizItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct_option_index: { type: Number, required: true },
  explanation: { type: String, default: '' }
}, { _id: true });

const quizSchema = new mongoose.Schema(
  {
    lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true, trim: true },
    questions: [quizItemSchema],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    generated_by_ai: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
