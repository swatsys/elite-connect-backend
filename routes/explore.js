// import express from 'express';
// import Profile from '../models/Profile.js';
// import Swipe from '../models/Swipe.js';
// import Match from '../models/Match.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Get profiles to explore
// router.get('/profiles', authenticateToken, async (req, res) => {
//   try {
//     // Get profiles user has already swiped on
//     const swipedProfiles = await Swipe.find({ user_id: req.user._id })
//       .select('target_user_id');
    
//     const swipedIds = swipedProfiles.map(s => s.target_user_id);
//     swipedIds.push(req.user._id); // Exclude own profile

//     // Get random profile
//     const profiles = await Profile.find({
//       user_id: { $nin: swipedIds }
//     })
//     .limit(20)
//     .lean();

//     // Shuffle profiles
//     const shuffled = profiles.sort(() => Math.random() - 0.5);

//     res.json({
//       success: true,
//       profiles: shuffled.map(p => ({
//         id: p.user_id.toString(),
//         name: p.name,
//         age: p.age,
//         gender: p.gender,
//         bio: p.bio,
//         interests: p.interests
//       }))
//     });

//   } catch (error) {
//     console.error('Explore error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load profiles'
//     });
//   }
// });

// // Like a profile
// router.post('/like', authenticateToken, async (req, res) => {
//   try {
//     const { profileId } = req.body;

//     if (!profileId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Profile ID required'
//       });
//     }

//     // Record swipe
//     await Swipe.create({
//       user_id: req.user._id,
//       target_user_id: profileId,
//       action: 'like'
//     });

//     // Check if target user also liked
//     const reciprocalLike = await Swipe.findOne({
//       user_id: profileId,
//       target_user_id: req.user._id,
//       action: 'like'
//     });

//     if (reciprocalLike) {
//       // Create match
//       const match = await Match.create({
//         user1_id: req.user._id,
//         user2_id: profileId,
//         status: 'matched',
//         chat_unlocked: false
//       });

//       res.json({
//         success: true,
//         matched: true,
//         matchId: match._id
//       });
//     } else {
//       res.json({
//         success: true,
//         matched: false
//       });
//     }

//   } catch (error) {
//     console.error('Like error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to like profile'
//     });
//   }
// });

// // Pass on a profile
// router.post('/pass', authenticateToken, async (req, res) => {
//   try {
//     const { profileId } = req.body;

//     await Swipe.create({
//       user_id: req.user._id,
//       target_user_id: profileId,
//       action: 'pass'
//     });

//     res.json({ success: true });

//   } catch (error) {
//     console.error('Pass error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to pass profile'
//     });
//   }
// });

// export default router;

import express from 'express'
import User from '../models/User.js'
import Profile from '../models/Profile.js'
import Swipe from '../models/Swipe.js'
import Match from '../models/Match.js'

const router = express.Router()

// ============================================
// GET /api/explore/users
// Get users to swipe on
// ============================================
router.post('/users', async (req, res) => {
  try {
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const myProfile = await Profile.findOne({ user_id: user._id })
    if (!myProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      })
    }
    
    // Get users I've already swiped on
    const swipedUserIds = await Swipe.find({ user_id: user._id }).distinct('target_user_id')
    
    // Get my matches to exclude
    const matches = await Match.find({
      $or: [
        { user1_id: user._id, is_active: true },
        { user2_id: user._id, is_active: true }
      ]
    })
    
    const matchedUserIds = matches.map(match => 
      match.user1_id.equals(user._id) ? match.user2_id : match.user1_id
    )
    
    // Exclude myself, swiped users, and matched users
    const excludeUserIds = [user._id, ...swipedUserIds, ...matchedUserIds]
    
    // Build query based on preferences
    const query = {
      user_id: { $nin: excludeUserIds },
      visibility: true
    }
    
    // Filter by gender preference
    if (myProfile.preferences.looking_for !== 'both') {
      query.gender = myProfile.preferences.looking_for
    }
    
    // Filter by age range
    query.age = {
      $gte: myProfile.preferences.age_range.min,
      $lte: myProfile.preferences.age_range.max
    }
    
    // Get users
    const profiles = await Profile.find(query)
      .limit(20)
      .select('user_id name age gender bio interests photos is_verified')
    
    console.log(`✅ Found ${profiles.length} users to explore`)
    
    res.json({
      success: true,
      users: profiles.map(p => ({
        id: p.user_id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        bio: p.bio,
        interests: p.interests,
        photos: p.photos,
        is_verified: p.is_verified
      }))
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
// POST /api/explore/swipe
// Swipe on a user (like/pass/super_like)
// ============================================
router.post('/swipe', async (req, res) => {
  try {
    const { target_user_id, action } = req.body
    
    if (!target_user_id || !action) {
      return res.status(400).json({
        success: false,
        error: 'target_user_id and action are required'
      })
    }
    
    if (!['like', 'pass', 'super_like'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      })
    }
    
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Check if target user exists
    const targetUser = await User.findById(target_user_id)
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Target user not found'
      })
    }
    
    // Create swipe
    const swipe = new Swipe({
      user_id: user._id,
      target_user_id,
      action
    })
    
    await swipe.save()
    
    console.log(`✅ Swipe recorded: ${action}`)
    
    // Check for match if it was a like
    let isMatch = false
    let match = null
    
    if (action === 'like' || action === 'super_like') {
      // Check if target user liked us back
      const reciprocalSwipe = await Swipe.findOne({
        user_id: target_user_id,
        target_user_id: user._id,
        action: { $in: ['like', 'super_like'] }
      })
      
      if (reciprocalSwipe) {
        // It's a match!
        match = new Match({
          user1_id: user._id,
          user2_id: target_user_id
        })
        await match.save()
        
        isMatch = true
        console.log('🎉 It\'s a match!')
      }
    }
    
    res.json({
      success: true,
      swipe: {
        target_user_id,
        action
      },
      is_match: isMatch,
      match: isMatch ? {
        id: match._id,
        matched_at: match.matched_at
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
// GET /api/explore/matches
// Get my matches
// ============================================
router.get('/matches', async (req, res) => {
  try {
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Find matches
    const matches = await Match.find({
      $or: [
        { user1_id: user._id, is_active: true },
        { user2_id: user._id, is_active: true }
      ]
    }).sort({ matched_at: -1 })
    
    // Get match profiles
    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1_id.equals(user._id) ? match.user2_id : match.user1_id
        const profile = await Profile.findOne({ user_id: otherUserId })
        
        return {
          match_id: match._id,
          user: profile ? {
            id: otherUserId,
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            bio: profile.bio,
            photos: profile.photos
          } : null,
          matched_at: match.matched_at,
          last_message_at: match.last_message_at
        }
      })
    )
    
    console.log(`✅ Found ${matches.length} matches`)
    
    res.json({
      success: true,
      matches: matchesWithProfiles.filter(m => m.user !== null)
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
// DELETE /api/explore/match/:matchId
// Unmatch a user
// ============================================
router.delete('/match/:matchId', async (req, res) => {
  try {
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const match = await Match.findById(req.params.matchId)
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      })
    }
    
    // Verify user is part of this match
    if (!match.user1_id.equals(user._id) && !match.user2_id.equals(user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }
    
    // Unmatch
    match.is_active = false
    match.unmatched_by = user._id
    match.unmatched_at = new Date()
    await match.save()
    
    console.log('✅ Unmatched')
    
    res.json({
      success: true,
      message: 'Unmatched successfully'
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