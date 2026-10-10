const mongoose = require('mongoose');

const lessonGenerationSchema = new mongoose.Schema(
  {
    requested_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    input_parameters: { type: Object, required: true },
    model: { type: String, default: 'gemini-2.5-flash' },
    prompt_version: { type: String, default: 'v1.0' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    error: { type: Object, default: null },
    started_at: { type: Date, default: null },
    completed_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('LessonGeneration', lessonGenerationSchema);
