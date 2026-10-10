const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 1 },
    learning_objectives: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Module', moduleSchema);
