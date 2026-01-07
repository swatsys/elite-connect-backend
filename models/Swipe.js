import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  target_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['like', 'pass'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

swipeSchema.index({ user_id: 1, target_user_id: 1 }, { unique: true });
swipeSchema.index({ target_user_id: 1, action: 1 });

export default mongoose.model('Swipe', swipeSchema);