// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema({
//   match_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Match',
//     required: true,
//     index: true
//   },
//   sender_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   image_url: {
//     type: String,
//     default: null
//   },
//   read: {
//     type: Boolean,
//     default: false
//   },
//   created_at: {
//     type: Date,
//     default: Date.now,
//     index: true
//   }
// });

// messageSchema.index({ match_id: 1, created_at: -1 });

// export default mongoose.model('Message', messageSchema);

// import mongoose from 'mongoose'

// const messageSchema = new mongoose.Schema({
//   match_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Match',
//     required: true,
//     index: true
//   },
//   sender_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   receiver_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   text: {
//     type: String,
//     required: true,
//     maxlength: 1000
//   },
//   is_read: {
//     type: Boolean,
//     default: false
//   },
//   read_at: {
//     type: Date,
//     default: null
//   },
//   created_at: {
//     type: Date,
//     default: Date.now,
//     index: true
//   }
// }, {
//   timestamps: true
// })

// // Indexes for efficient querying
// messageSchema.index({ match_id: 1, created_at: -1 })
// messageSchema.index({ receiver_id: 1, is_read: 1 })

// export default mongoose.model('Message', messageSchema)

import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  // Match-based fields (optional now)
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: false  // ← Changed from true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // ← Changed from true
  },
  
  // Direct messaging fields
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Required fields
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  
  // Optional fields
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: {
    type: Date
  }
})

// Indexes for performance
messageSchema.index({ match_id: 1, created_at: 1 })
messageSchema.index({ sender_id: 1, recipient_id: 1, created_at: 1 })
messageSchema.index({ sender_id: 1, receiver_id: 1, created_at: 1 })

const Message = mongoose.model('Message', messageSchema)

export default Message