const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  question_type: { type: String, enum: ['mcq', 'coding', 'short_answer'], default: 'mcq' },
  options: [{ type: String }],
  correct_answer: { type: String, required: true },
  points: { type: Number, default: 10 },
  explanation: { type: String, default: '' }
}, { _id: true });

const assessmentSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
    total_points: { type: Number, default: 100 },
    passing_score: { type: Number, default: 60 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    generated_by_ai: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
