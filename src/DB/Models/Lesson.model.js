import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// 1. Modular Content Blocks (NEW)
// Replaces flat `explanation` string with flexible paragraphs, code, callouts, and lists.
// ---------------------------------------------------------------------------
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['paragraph', 'code', 'callout', 'list'],
    required: true
  },
  // Text content for paragraphs and callouts
  text: { type: String, default: null },

  // Callout visual style (rendered as tip/warning/note cards in UI)
  callout_type: {
    type: String,
    enum: ['tip', 'warning', 'note'],
    default: null
  },

  // Bullet items for list blocks
  items: [{ type: String }],

  // Code editor properties
  language: { type: String, default: 'python' },
  code: { type: String, default: null },
  expected_output: { type: String, default: null }
}, { _id: false });


// ---------------------------------------------------------------------------
// 2. In-Lesson Diagnostic Checkpoint (NEW)
// Replaces generic quiz with in-situ check and misconception mapping.
// ---------------------------------------------------------------------------
const diagnosticCheckSchema = new mongoose.Schema({
  concept_tag: { type: String, default: null }, // e.g. "zero_indexing"
  question_text: { type: String, required: true },
  code_snippet: { type: String, default: null },
  options: [{ type: String, required: true }],
  correct_answer: { type: String, required: true },

  // Maps wrong options to diagnosed student misconceptions
  // e.g. { "1 to 5": "Student assumes range() is 1-indexed" }
  misconception_map: { type: Map, of: String, default: {} },
  explanation: { type: String, required: true }
}, { _id: false });


// ---------------------------------------------------------------------------
// 3. Section Schema (UPDATED)
// Holds modular blocks, diagnostic check, and targeted remediation.
// ---------------------------------------------------------------------------
const sectionSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  purpose: { type: String, required: true },
  covers_objectives: [{ type: String }],

  // Primary teaching content
  blocks: [blockSchema],

  // In-lesson interactive check
  diagnostic_check: { type: diagnosticCheckSchema, default: null },

  // Remediation content shown only if student fails diagnostic_check
  remediation_blocks: [blockSchema]
}, { _id: false });


// ---------------------------------------------------------------------------
// 4. Speech Narration Segments (NEW)
// ~45-60 second chunks for mobile/web TTS audio playback.
// ---------------------------------------------------------------------------
const speechSegmentSchema = new mongoose.Schema({
  order_in_lesson: { type: Number, required: true },
  title: { type: String, required: true },
  narration_text: { type: String, required: true },
  est_seconds: { type: Number, required: true },
  attached_code: { type: String, default: null }
}, { _id: false });


// ---------------------------------------------------------------------------
// 5. Immutable Lesson Version (NEW)
// Preserves v1, v2, v3 when teachers edit lessons.
// ---------------------------------------------------------------------------
const lessonVersionSchema = new mongoose.Schema({
  version_no: { type: Number, required: true }, // 1, 2, 3...
  state: {
    type: String,
    enum: ['AWAITING_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'AWAITING_REVIEW'
  },
  title: { type: String, required: true },
  introduction: [blockSchema],
  sections: [sectionSchema],
  conclusion: [blockSchema],
  segments: [speechSegmentSchema],
  teacher_feedback: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
}, { _id: false });


// ---------------------------------------------------------------------------
// 6. Main Lesson Document
// ---------------------------------------------------------------------------
const lessonSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    topic: { type: String, required: true, trim: true },
    programming_language: { type: String, default: 'Python' },
    grade_level: { type: String, required: true },
    target_duration_minutes: { type: Number, default: 15 },

    // Version management
    current_version_no: { type: Number, default: 1 },
    approved_version_no: { type: Number, default: null },
    versions: [lessonVersionSchema],

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
