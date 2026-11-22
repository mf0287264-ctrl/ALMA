import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    sender_name: { type: String, required: true },
    sender_role: { type: String, enum: ["teacher", "student"], required: true },
    sender_image: { type: String, default: null },
    message: { type: String, required: true, trim: true },
    created_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const groupLessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    duration_minutes: { type: Number, default: 15 },
    programming_language: { type: String, default: "Python" },
    lesson_id: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const groupTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    due_date: { type: Date, default: null },
    status: { type: String, enum: ["assigned", "completed"], default: "assigned" },
    created_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const teacherGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    subject: { type: String, required: true, default: "Computer Science" },
    grade_level: { type: String, required: true, default: "Grade 8" },
    class_code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    teacher_name: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    lessons: [groupLessonSchema],
    tasks: [groupTaskSchema],
    messages: [groupMessageSchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

teacherGroupSchema.index({ teacher_id: 1 });
teacherGroupSchema.index({ students: 1 });

export default mongoose.models.TeacherGroup ||
  mongoose.model("TeacherGroup", teacherGroupSchema);
