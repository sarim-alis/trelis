import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, {
  timestamps: true
});

activityLogSchema.index({ board: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
