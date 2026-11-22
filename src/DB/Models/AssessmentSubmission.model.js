import mongoose from 'mongoose';

const assessmentSubmissionSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    earned_points: { type: Number, required: true },
    total_points: { type: Number, required: true },
    score_percent: { type: Number, required: true },
    correct_count: { type: Number, required: true },
    total_questions: { type: Number, required: true },
    passing_score: { type: Number, default: 60 },
    passed: { type: Boolean, required: true },
    breakdown: [
      {
        question_text: { type: String },
        selected_answer: { type: String },
        correct_answer: { type: String },
        is_correct: { type: Boolean },
        points: { type: Number },
        explanation: { type: String, default: '' },
      },
    ],
    submitted_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.AssessmentSubmission ||
  mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
