import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
    // REMOVED: index: true (because unique already creates an index)
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'non-binary', 'other']
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  interests: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
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

// REMOVED: profileSchema.index({ user_id: 1 }); (duplicate)

export default mongoose.model('Profile', profileSchema);