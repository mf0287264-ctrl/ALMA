import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Concept Mastery & Misconception Log (NEW)
// Tracks concept-level struggles to personalize future lessons and greetings.
// ---------------------------------------------------------------------------
const conceptStruggleSchema = new mongoose.Schema({
  concept_id: { type: String, required: true },      // e.g. "zero_indexing"
  concept_label: { type: String, required: true },   // e.g. "Zero-Based Indexing"
  times_tested: { type: Number, default: 0 },
  times_wrong: { type: Number, default: 0 },
  last_diagnosed_misconception: { type: String, default: null }
}, { _id: false });


// ---------------------------------------------------------------------------
// Student Profile Schema (UPDATED)
// Preserves all existing auth/personal fields, adds streak & adaptive telemetry.
// ---------------------------------------------------------------------------
const studentSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    student_code: { type: String, required: true, unique: true, trim: true },
    grade_level: { type: String, required: true },
    school_name: { type: String, default: null },
    profile_image: { type: String, default: null },
    role: { type: String, default: 'student' },
    is_active: { type: Boolean, default: true },
    parent_phone: { type: String, default: null },

    // --- NEW ADAPTIVE ATTRIBUTES ---
    // Gamification & audio greeting: "You are on a 4-day streak!"
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    lessons_completed: { type: Number, default: 0 },

    // Adaptive tracking for personalized greetings and proactive help
    struggling_concepts: [conceptStruggleSchema]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
