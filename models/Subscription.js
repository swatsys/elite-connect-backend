import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['free', 'monthly_unlimited'],
    default: 'free'
  },
  free_connections_used: {
    type: Number,
    default: 0
  },
  free_connections_limit: {
    type: Number,
    default: 2
  },
  subscription_started_at: {
    type: Date,
    default: null
  },
  subscription_expires_at: {
    type: Date,
    default: null
    // REMOVED: index: true (we'll add it below with .index())
  },
  is_active: {
    type: Boolean,
    default: false
  },
  total_connections_used: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Keep only ONE index definition
subscriptionSchema.index({ subscription_expires_at: 1 });

export default mongoose.model('Subscription', subscriptionSchema);