// import mongoose from 'mongoose';

// const profileSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//     // REMOVED: index: true (because unique already creates an index)
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   age: {
//     type: Number,
//     required: true,
//     min: 18,
//     max: 100
//   },
//   gender: {
//     type: String,
//     required: true,
//     enum: ['male', 'female', 'non-binary', 'other']
//   },
//   bio: {
//     type: String,
//     default: '',
//     maxlength: 500
//   },
//   interests: {
//     type: [String],
//     default: []
//   },
//   location: {
//     type: String,
//     default: ''
//   },
//   images: {
//     type: [String],
//     default: []
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

// // REMOVED: profileSchema.index({ user_id: 1 }); (duplicate)

// export default mongoose.model('Profile', profileSchema);


import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  nullifier_hash: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
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
    enum: ['male', 'female', 'other']
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  interests: [{
    type: String,
    trim: true
  }],
  photos: [{
    url: String,
    is_primary: {
      type: Boolean,
      default: false
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    city: String,
    country: String
  },
  preferences: {
    looking_for: {
      type: String,
      enum: ['male', 'female', 'both'],
      default: 'both'
    },
    age_range: {
      min: {
        type: Number,
        default: 18
      },
      max: {
        type: Number,
        default: 50
      }
    },
    max_distance: {
      type: Number,
      default: 50 // km
    }
  },
  visibility: {
    type: Boolean,
    default: true
  },
  is_verified: {
    type: Boolean,
    default: true // Since they use World ID
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

// Index for geospatial queries
profileSchema.index({ 'location.coordinates': '2dsphere' })

export default mongoose.model('Profile', profileSchema)