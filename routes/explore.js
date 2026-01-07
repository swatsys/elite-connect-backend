import express from 'express';
import Profile from '../models/Profile.js';
import Swipe from '../models/Swipe.js';
import Match from '../models/Match.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get profiles to explore
router.get('/profiles', authenticateToken, async (req, res) => {
  try {
    // Get profiles user has already swiped on
    const swipedProfiles = await Swipe.find({ user_id: req.user._id })
      .select('target_user_id');
    
    const swipedIds = swipedProfiles.map(s => s.target_user_id);
    swipedIds.push(req.user._id); // Exclude own profile

    // Get random profile
    const profiles = await Profile.find({
      user_id: { $nin: swipedIds }
    })
    .limit(20)
    .lean();

    // Shuffle profiles
    const shuffled = profiles.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      profiles: shuffled.map(p => ({
        id: p.user_id.toString(),
        name: p.name,
        age: p.age,
        gender: p.gender,
        bio: p.bio,
        interests: p.interests
      }))
    });

  } catch (error) {
    console.error('Explore error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load profiles'
    });
  }
});

// Like a profile
router.post('/like', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Profile ID required'
      });
    }

    // Record swipe
    await Swipe.create({
      user_id: req.user._id,
      target_user_id: profileId,
      action: 'like'
    });

    // Check if target user also liked
    const reciprocalLike = await Swipe.findOne({
      user_id: profileId,
      target_user_id: req.user._id,
      action: 'like'
    });

    if (reciprocalLike) {
      // Create match
      const match = await Match.create({
        user1_id: req.user._id,
        user2_id: profileId,
        status: 'matched',
        chat_unlocked: false
      });

      res.json({
        success: true,
        matched: true,
        matchId: match._id
      });
    } else {
      res.json({
        success: true,
        matched: false
      });
    }

  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like profile'
    });
  }
});

// Pass on a profile
router.post('/pass', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.body;

    await Swipe.create({
      user_id: req.user._id,
      target_user_id: profileId,
      action: 'pass'
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Pass error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pass profile'
    });
  }
});

export default router;