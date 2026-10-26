import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Asynchronous Generation Job Tracker
// Added: job_id, progress_percent, current_step, step_message for frontend polling.
// Removed: mandatory course_id requirement and internal prompt_version.
// ---------------------------------------------------------------------------
const lessonGenerationSchema = new mongoose.Schema(
  {
    // Fast string ticket for client polling (GET /jobs/{job_id})
    job_id: { type: String, required: true, unique: true, index: true },

    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },

    topic: { type: String, required: true },
    programming_language: { type: String, default: 'Python' },
    grade_level: { type: String, default: 'Grade 8' },
    model: { type: String, default: 'gemini-3.5-flash-lite' },

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },

    // Fine-grained step tracking for mobile/web UI step indicators
    current_step: {
      type: String,
      enum: [
        'queued',
        'outline',
        'sections',
        'bridges',
        'intro_conclusion',
        'practice',
        'segmenting',
        'validating',
        'completed',
        'failed'
      ],
      default: 'queued'
    },

    // Progress percentage (0.0 to 1.0) for progress bar
    progress_percent: { type: Number, default: 0.0 },

    // Descriptive message displayed under the progress bar
    step_message: { type: String, default: 'Generation initialized...' },

    // Result reference once completed
    lesson_id: { type: String, default: null },
    error: { type: String, default: null },

    completed_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.LessonGeneration || mongoose.model('LessonGeneration', lessonGenerationSchema);
