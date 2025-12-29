// import mongoose from 'mongoose';

// const transactionSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   reference: {
//     type: String,
//     required: true,
//     unique: true
//     // REMOVED: index: true (because unique already creates an index)
//   },
//   transaction_id: {
//     type: String,
//     default: null
//   },
//   amount_wld: {
//     type: Number,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['subscription', 'single_connection'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'completed', 'failed', 'cancelled'],
//     default: 'pending',
//     index: true
//   },
//   verified: {
//     type: Boolean,
//     default: false
//   },
//   verified_at: {
//     type: Date,
//     default: null
//   },
//   created_at: {
//     type: Date,
//     default: Date.now,
//     index: true
//   }
// });

// // REMOVED: transactionSchema.index({ reference: 1 }); (duplicate)
// transactionSchema.index({ user_id: 1, status: 1 });

// export default mongoose.model('Transaction', transactionSchema);

import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  type: {
    type: String,
    enum: ['subscription', 'boost', 'super_like', 'rewind'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['credit_card', 'paypal', 'crypto', 'worldcoin'],
    default: 'worldcoin'
  },
  transaction_id: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

// Generate unique transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transaction_id) {
    this.transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  next()
})

export default mongoose.model('Transaction', transactionSchema)