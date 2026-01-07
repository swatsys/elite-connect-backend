import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
    // REMOVED: index: true (because unique already creates an index)
  },
  transaction_id: {
    type: String,
    default: null
  },
  amount_wld: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'single_connection'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verified_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// REMOVED: transactionSchema.index({ reference: 1 }); (duplicate)
transactionSchema.index({ user_id: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);