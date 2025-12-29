// import mongoose from 'mongoose';

// const subscriptionSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   type: {
//     type: String,
//     enum: ['free', 'monthly_unlimited'],
//     default: 'free'
//   },
//   free_connections_used: {
//     type: Number,
//     default: 0
//   },
//   free_connections_limit: {
//     type: Number,
//     default: 2
//   },
//   subscription_started_at: {
//     type: Date,
//     default: null
//   },
//   subscription_expires_at: {
//     type: Date,
//     default: null
//     // REMOVED: index: true (we'll add it below with .index())
//   },
//   is_active: {
//     type: Boolean,
//     default: false
//   },
//   total_connections_used: {
//     type: Number,
//     default: 0
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   },
//   updated_at: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Keep only ONE index definition
// subscriptionSchema.index({ subscription_expires_at: 1 });

// export default mongoose.model('Subscription', subscriptionSchema);

import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active'
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billing_cycle: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime'],
    default: 'monthly'
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  },
  auto_renew: {
    type: Boolean,
    default: true
  },
  cancelled_at: {
    type: Date,
    default: null
  },
  features: {
    unlimited_likes: {
      type: Boolean,
      default: false
    },
    super_likes: {
      type: Number,
      default: 0
    },
    rewind: {
      type: Boolean,
      default: false
    },
    see_who_liked_you: {
      type: Boolean,
      default: false
    },
    boost: {
      type: Number,
      default: 0
    },
    no_ads: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() < this.expires_at
}

export default mongoose.model('Subscription', subscriptionSchema)