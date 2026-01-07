import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nullifier_hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  verification_level: {
    type: String,
    enum: ['orb', 'device'],
    required: true
  },
  profile_completed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);