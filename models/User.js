// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   nullifier_hash: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   verification_level: {
//     type: String,
//     enum: ['orb', 'device'],
//     required: true
//   },
//   profile_completed: {
//     type: Boolean,
//     default: false
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   },
//   last_login: {
//     type: Date,
//     default: Date.now
//   }
// });

// export default mongoose.model('User', userSchema);


import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  nullifier_hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  world_id_verified: {
    type: Boolean,
    default: true
  },
  verification_level: {
    type: String,
    enum: ['device', 'orb'],
    default: 'device'
  },
  is_premium: {
    type: Boolean,
    default: false
  },
  premium_expires_at: {
    type: Date,
    default: null
  },
  subscription_type: {
    type: String,
    enum: ['free', 'basic', 'premium', 'vip'],
    default: 'free'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_active: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Update last_active on any activity
userSchema.methods.updateActivity = function() {
  this.last_active = new Date()
  return this.save()
}

// Check if premium is valid
userSchema.methods.isPremiumActive = function() {
  if (!this.is_premium) return false
  if (!this.premium_expires_at) return false
  return new Date() < this.premium_expires_at
}

export default mongoose.model('User', userSchema)