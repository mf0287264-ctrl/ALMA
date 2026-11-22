import mongoose from 'mongoose';

const studentMessageSchema = new mongoose.Schema(
  {
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    read_at: { type: Date, default: null },
    is_archived_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

studentMessageSchema.index({ sender_id: 1, receiver_id: 1, created_at: -1 });

export default mongoose.models.StudentMessage || mongoose.model('StudentMessage', studentMessageSchema);
