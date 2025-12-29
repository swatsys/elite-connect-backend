// import express from 'express';
// import User from '../models/User.js';
// import Profile from '../models/Profile.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Create profile
// router.post('/create', authenticateToken, async (req, res) => {
//   try {
//     const { name, age, gender, bio, interests, location } = req.body;

//     // Validation
//     if (!name || !age || !gender) {
//       return res.status(400).json({
//         success: false,
//         error: 'Name, age, and gender are required'
//       });
//     }

//     if (age < 18 || age > 100) {
//       return res.status(400).json({
//         success: false,
//         error: 'Age must be between 18 and 100'
//       });
//     }

//     // Check if profile exists
//     let profile = await Profile.findOne({ user_id: req.user._id });

//     if (profile) {
//       // Update existing profile
//       profile.name = name;
//       profile.age = age;
//       profile.gender = gender;
//       profile.bio = bio || '';
//       profile.interests = interests || [];
//       profile.location = location || '';
//       profile.updated_at = new Date();
//       await profile.save();
//     } else {
//       // Create new profile
//       profile = new Profile({
//         user_id: req.user._id,
//         name,
//         age,
//         gender,
//         bio: bio || '',
//         interests: interests || [],
//         location: location || ''
//       });
//       await profile.save();

//       // Update user
//       req.user.profile_completed = true;
//       await req.user.save();
//     }

//     res.json({
//       success: true,
//       profile: {
//         id: profile._id,
//         name: profile.name,
//         age: profile.age,
//         gender: profile.gender,
//         bio: profile.bio
//       }
//     });

//   } catch (error) {
//     console.error('Profile create error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create profile'
//     });
//   }
// });

// // Get own profile
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user_id: req.user._id });

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         error: 'Profile not found'
//       });
//     }

//     res.json({
//       success: true,
//       profile: {
//         id: profile._id,
//         name: profile.name,
//         age: profile.age,
//         gender: profile.gender,
//         bio: profile.bio,
//         interests: profile.interests,
//         location: profile.location
//       }
//     });

//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get profile'
//     });
//   }
// });

// export default router;


import express from 'express'
import User from '../models/User.js'
import Profile from '../models/Profile.js'

const router = express.Router()

// ============================================
// POST /api/profile/create
// Create user profile
// ============================================
router.post('/create', async (req, res) => {
  try {
    const { name, age, gender, bio, interests, location } = req.body
    
    if (!name || !age || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Name, age, and gender are required'
      })
    }
    
    // Find user
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Check if profile already exists
    let profile = await Profile.findOne({ user_id: user._id })
    
    if (profile) {
      return res.status(400).json({
        success: false,
        error: 'Profile already exists'
      })
    }
    
    // Create profile
    profile = new Profile({
      user_id: user._id,
      nullifier_hash: req.nullifier_hash,
      name,
      age: parseInt(age),
      gender,
      bio: bio || '',
      interests: interests || [],
      location: location || { type: 'Point', coordinates: [0, 0] }
    })
    
    await profile.save()
    
    console.log('✅ Profile created:', name)
    
    res.json({
      success: true,
      profile: {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        interests: profile.interests
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ============================================
// GET /api/profile/me
// Get my profile
// ============================================
router.get('/me', async (req, res) => {
  try {
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const profile = await Profile.findOne({ user_id: user._id })
    
    res.json({
      success: true,
      user: {
        id: user._id,
        nullifier_hash: user.nullifier_hash,
        is_premium: user.isPremiumActive(),
        subscription_type: user.subscription_type
      },
      profile: profile ? {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        interests: profile.interests,
        photos: profile.photos,
        preferences: profile.preferences
      } : null
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ============================================
// PUT /api/profile/me
// Update my profile
// ============================================
router.put('/me', async (req, res) => {
  try {
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const profile = await Profile.findOne({ user_id: user._id })
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      })
    }
    
    const { name, age, gender, bio, interests, preferences } = req.body
    
    if (name) profile.name = name
    if (age) profile.age = parseInt(age)
    if (gender) profile.gender = gender
    if (bio !== undefined) profile.bio = bio
    if (interests) profile.interests = interests
    if (preferences) profile.preferences = { ...profile.preferences, ...preferences }
    
    profile.updated_at = new Date()
    await profile.save()
    
    console.log('✅ Profile updated:', profile.name)
    
    res.json({
      success: true,
      profile: {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        interests: profile.interests,
        preferences: profile.preferences
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ============================================
// GET /api/profile/:userId
// View another user's profile
// ============================================
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.params.userId })
    
    if (!profile || !profile.visibility) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      })
    }
    
    res.json({
      success: true,
      profile: {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        interests: profile.interests,
        photos: profile.photos,
        is_verified: profile.is_verified
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router