import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    score: { type: Number, required: true },
    total_questions: { type: Number, required: true },
    score_percent: { type: Number, required: true },
    answers: { type: Object, default: {} },
    completed_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.QuizAttempt ||
  mongoose.model('QuizAttempt', quizAttemptSchema);
