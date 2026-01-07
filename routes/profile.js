import express from 'express';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create profile
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, age, gender, bio, interests, location } = req.body;

    // Validation
    if (!name || !age || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Name, age, and gender are required'
      });
    }

    if (age < 18 || age > 100) {
      return res.status(400).json({
        success: false,
        error: 'Age must be between 18 and 100'
      });
    }

    // Check if profile exists
    let profile = await Profile.findOne({ user_id: req.user._id });

    if (profile) {
      // Update existing profile
      profile.name = name;
      profile.age = age;
      profile.gender = gender;
      profile.bio = bio || '';
      profile.interests = interests || [];
      profile.location = location || '';
      profile.updated_at = new Date();
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        user_id: req.user._id,
        name,
        age,
        gender,
        bio: bio || '',
        interests: interests || [],
        location: location || ''
      });
      await profile.save();

      // Update user
      req.user.profile_completed = true;
      await req.user.save();
    }

    res.json({
      success: true,
      profile: {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio
      }
    });

  } catch (error) {
    console.error('Profile create error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create profile'
    });
  }
});

// Get own profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
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
        location: profile.location
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

export default router;