// import mongoose from 'mongoose';

// const matchSchema = new mongoose.Schema({
//   user1_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   user2_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'matched', 'unmatched'],
//     default: 'pending'
//   },
//   chat_unlocked: {
//     type: Boolean,
//     default: false
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   }
// });

// matchSchema.index({ user1_id: 1, user2_id: 1 }, { unique: true });
// matchSchema.index({ status: 1 });

// export default mongoose.model('Match', matchSchema);


import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema({
  user1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  user2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  matched_at: {
    type: Date,
    default: Date.now
  },
  last_message_at: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  unmatched_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  unmatched_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Compound index for finding matches
matchSchema.index({ user1_id: 1, user2_id: 1 }, { unique: true })
matchSchema.index({ user1_id: 1, is_active: 1 })
matchSchema.index({ user2_id: 1, is_active: 1 })

// Method to check if users are matched
matchSchema.statics.areMatched = async function(userId1, userId2) {
  const match = await this.findOne({
    $or: [
      { user1_id: userId1, user2_id: userId2, is_active: true },
      { user1_id: userId2, user2_id: userId1, is_active: true }
    ]
  })
  return !!match
}

export default mongoose.model('Match', matchSchema)