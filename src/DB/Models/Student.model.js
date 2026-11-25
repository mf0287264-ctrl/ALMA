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

const earnedAchievementSchema = new mongoose.Schema({
  achievement_id: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  course_title: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  badge_icon: { type: String, default: 'trophy' },
  badge_color: { type: String, default: 'bg-[#ffa11f]' },
  category: { type: String, default: 'Course Completion' },
  awarded_at: { type: Date, default: Date.now }
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
    profileImage: { type: String, default: null },
    role: { type: String, default: 'student' },
    is_active: { type: Boolean, default: true },
    national_id: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    parent_phone: { type: String, default: null },

    // --- Parent / Guardian Linking ---
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', default: null },
    parent_name: { type: String, default: null },
    parent_email: { type: String, default: null },
    parent_national_id: { type: String, default: null },
    parent_relation: { type: String, default: null },

    // --- Onboarding & Diagnostic Quiz Preferences ---
    learning_for: { type: String, default: 'me' },
    age_group: { type: String, default: null },
    coding_experience: { type: String, default: null },
    learning_styles: [{ type: String }],
    gender: { type: String, default: null },
    quiz_answers: { type: Array, default: [] },

    // --- NEW ADAPTIVE ATTRIBUTES ---
    // Gamification & audio greeting: "You are on a 4-day streak!"
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    lessons_completed: { type: Number, default: 0 },

    // Adaptive tracking for personalized greetings and proactive help
    struggling_concepts: [conceptStruggleSchema],

    // --- Course Enrollments & Teacher Linking ---
    enrolled_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completed_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completed_lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    enrolled_groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeacherGroup' }],
    achievements: [earnedAchievementSchema],
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    class_name: { type: String, default: null },

    // --- Social & Friends / Following ---
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    friend_requests_sent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    friend_requests_received: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
