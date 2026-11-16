import mongoose from 'mongoose';

const parentMessageSchema = new mongoose.Schema(
  {
    from_parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true
    },
    from_parent_name: { type: String, default: null },
    from_parent_email: { type: String, default: null },
    to_teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    to_teacher_name: { type: String, default: null },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.models.ParentMessage || mongoose.model('ParentMessage', parentMessageSchema);
