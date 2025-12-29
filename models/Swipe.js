// import mongoose from 'mongoose';

// const swipeSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   target_user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   action: {
//     type: String,
//     enum: ['like', 'pass'],
//     required: true
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   }
// });

// swipeSchema.index({ user_id: 1, target_user_id: 1 }, { unique: true });
// swipeSchema.index({ target_user_id: 1, action: 1 });

// export default mongoose.model('Swipe', swipeSchema);

import mongoose from 'mongoose'

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
    enum: ['like', 'pass', 'super_like'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

// Compound index to prevent duplicate swipes
swipeSchema.index({ user_id: 1, target_user_id: 1 }, { unique: true })

// Index for finding mutual likes
swipeSchema.index({ user_id: 1, action: 1 })
swipeSchema.index({ target_user_id: 1, action: 1 })

export default mongoose.model('Swipe', swipeSchema)