import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Checkpoint Submission Log
// Records student answers and whether remediation was triggered.
// ---------------------------------------------------------------------------
const checkpointLogSchema = new mongoose.Schema({
  section_order: { type: Number, required: true },
  selected_answer: { type: String, required: true },
  is_correct: { type: Boolean, required: true },
  detected_misconception: { type: String, default: null },
  routed_to_remediation: { type: Boolean, default: false },
  answered_at: { type: Date, default: Date.now }
}, { _id: false });


// ---------------------------------------------------------------------------
// Socratic Q&A Dialogue Log
// Records student voice/text questions asked to "Ask ALMA" and the AI response.
// ---------------------------------------------------------------------------
const dialogueLogSchema = new mongoose.Schema({
  section_order: { type: Number, required: true },
  question: { type: String, required: true },
  spoken_answer: { type: String, required: true },
  asked_at: { type: Date, default: Date.now }
}, { _id: false });


// ---------------------------------------------------------------------------
// Student Lesson Session Schema
// Stores live runtime state for mobile & web apps.
// ---------------------------------------------------------------------------
const studentLessonSessionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, unique: true, index: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    lesson_id: { type: String, required: true, index: true },

    // Resume functionality: app reopens directly to this section
    current_section_order: { type: Number, default: 1 },

    // Personalized audio greeting delivered at session start
    personalized_greeting: { type: String, default: null },

    // Live telemetry
    checkpoint_logs: [checkpointLogSchema],
    dialogue_logs: [dialogueLogSchema],

    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active'
    },

    completed_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.StudentLessonSession || mongoose.model('StudentLessonSession', studentLessonSessionSchema);
