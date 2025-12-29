// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { verifyCloudProof } from '@worldcoin/minikit-js';
// import User from '../models/User.js';
// import Subscription from '../models/Subscription.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Verify World ID and sign in
// router.post('/verify', async (req, res) => {
//   try {
//     const { proof, merkle_root, nullifier_hash, verification_level } = req.body;

//     if (!nullifier_hash) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing nullifier_hash'
//       });
//     }

//     // Verify with World ID API
//     const verifyRes = await verifyCloudProof(
//       req.body,
//       process.env.WORLD_APP_ID,
//       'signin'
//     );

//     if (!verifyRes.success) {
//       return res.status(400).json({
//         success: false,
//         error: 'World ID verification failed'
//       });
//     }

//     // Find or create user
//     let user = await User.findOne({ nullifier_hash });

//     if (!user) {
//       user = new User({
//         nullifier_hash,
//         verification_level: verification_level || 'orb',
//         profile_completed: false
//       });
//       await user.save();

//       // Create subscription record
//       await Subscription.create({
//         user_id: user._id,
//         type: 'free',
//         free_connections_limit: parseInt(process.env.FREE_CONNECTIONS) || 2
//       });

//       console.log('✅ New user created:', user._id);
//     } else {
//       user.last_login = new Date();
//       await user.save();
//       console.log('👤 User logged in:', user._id);
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { userId: user._id, nullifier: nullifier_hash },
//       process.env.JWT_SECRET,
//       { expiresIn: '30d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         verification_level: user.verification_level,
//         profile_completed: user.profile_completed
//       }
//     });

//   } catch (error) {
//     console.error('Verify error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Authentication failed'
//     });
//   }
// });

// // Get current user
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     res.json({
//       id: req.user._id,
//       verification_level: req.user.verification_level,
//       profile_completed: req.user.profile_completed,
//       created_at: req.user.created_at
//     });
//   } catch (error) {
//     console.error('Me error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get user'
//     });
//   }
// });

// export default router;

// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { verifyCloudProof } from '@worldcoin/minikit-js';
// import User from '../models/User.js';
// import Subscription from '../models/Subscription.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Verify World ID and sign in
// router.post('/verify', async (req, res) => {
//   try {
//     const { proof, merkle_root, nullifier_hash, verification_level } = req.body;

//     console.log('📥 Verification request received:', {
//       nullifier_hash,
//       verification_level,
//       hasProof: !!proof,
//       hasMerkleRoot: !!merkle_root
//     });

//     if (!nullifier_hash) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing nullifier_hash'
//       });
//     }

//     // Verify with World ID API using verifyCloudProof (RECOMMENDED METHOD)
//     console.log('🌍 Verifying with World ID Cloud...');
//     const verifyRes = await verifyCloudProof(
//       req.body, // Pass the entire payload
//       process.env.WORLD_APP_ID,
//       'signin' // Action ID - must match your Developer Portal configuration
//     );

//     console.log('✅ Verification response:', verifyRes);

//     if (!verifyRes.success) {
//       console.log('❌ Verification failed:', verifyRes);
//       return res.status(400).json({
//         success: false,
//         error: 'World ID verification failed',
//         details: verifyRes
//       });
//     }

//     // Find or create user
//     let user = await User.findOne({ nullifier_hash });

//     if (!user) {
//       user = new User({
//         nullifier_hash,
//         verification_level: verification_level || 'device',
//         profile_completed: false
//       });
//       await user.save();

//       // Create subscription record
//       await Subscription.create({
//         user_id: user._id,
//         type: 'free',
//         free_connections_limit: parseInt(process.env.FREE_CONNECTIONS) || 2
//       });

//       console.log('✅ New user created:', user._id);
//     } else {
//       user.last_login = new Date();
//       await user.save();
//       console.log('👤 User logged in:', user._id);
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { userId: user._id, nullifier: nullifier_hash },
//       process.env.JWT_SECRET,
//       { expiresIn: '30d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         verification_level: user.verification_level,
//         profile_completed: user.profile_completed
//       }
//     });

//   } catch (error) {
//     console.error('❌ Verify error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Authentication failed',
//       message: error.message
//     });
//   }
// });

// // Get current user
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     res.json({
//       id: req.user._id,
//       verification_level: req.user.verification_level,
//       profile_completed: req.user.profile_completed,
//       created_at: req.user.created_at
//     });
//   } catch (error) {
//     console.error('Me error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get user'
//     });
//   }
// });

// export default router;

// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { verifyCloudProof } from '@worldcoin/minikit-js';
// import User from '../models/User.js';
// import Subscription from '../models/Subscription.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Verify World ID and sign in
// router.post('/verify', async (req, res) => {
//   try {
//     const { proof, merkle_root, nullifier_hash, verification_level } = req.body;

//     if (!nullifier_hash) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing nullifier_hash'
//       });
//     }

//     // Verify with World ID API
//     const verifyRes = await verifyCloudProof(
//       req.body,
//       process.env.WORLD_APP_ID,
//       'signin'
//     );

//     if (!verifyRes.success) {
//       return res.status(400).json({
//         success: false,
//         error: 'World ID verification failed'
//       });
//     }

//     // Find or create user
//     let user = await User.findOne({ nullifier_hash });

//     if (!user) {
//       user = new User({
//         nullifier_hash,
//         verification_level: verification_level || 'orb',
//         profile_completed: false
//       });
//       await user.save();

//       // Create subscription record
//       await Subscription.create({
//         user_id: user._id,
//         type: 'free',
//         free_connections_limit: parseInt(process.env.FREE_CONNECTIONS) || 2
//       });

//       console.log('âœ… New user created:', user._id);
//     } else {
//       user.last_login = new Date();
//       await user.save();
//       console.log('ðŸ‘¤ User logged in:', user._id);
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { userId: user._id, nullifier: nullifier_hash },
//       process.env.JWT_SECRET,
//       { expiresIn: '30d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         verification_level: user.verification_level,
//         profile_completed: user.profile_completed
//       }
//     });

//   } catch (error) {
//     console.error('Verify error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Authentication failed'
//     });
//   }
// });

// // Get current user
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     res.json({
//       id: req.user._id,
//       verification_level: req.user.verification_level,
//       profile_completed: req.user.profile_completed,
//       created_at: req.user.created_at
//     });
//   } catch (error) {
//     console.error('Me error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get user'
//     });
//   }
// });

// export default router;


import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// Helper function to generate token
function generateToken(nullifier_hash) {
  return Buffer.from(nullifier_hash).toString('base64')
}

// ============================================
// POST /api/auth/verify
// Verify World ID and create/login user
// ============================================
router.post('/verify', async (req, res) => {
  try {
    const { payload, action } = req.body
    
    console.log('🔐 Verifying World ID...')
    
    const APP_ID = process.env.APP_ID
    if (!APP_ID) {
      return res.status(500).json({
        success: false,
        error: 'APP_ID not configured'
      })
    }
    
    // In production, use: await verifyCloudProof(payload, APP_ID, action, '')
    // For now, accept valid payload for testing
    
    if (!payload || !payload.nullifier_hash) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload'
      })
    }
    
    const nullifier_hash = payload.nullifier_hash
    const verification_level = payload.verification_level || 'device'
    
    // Find or create user
    let user = await User.findOne({ nullifier_hash })
    
    if (!user) {
      user = new User({
        nullifier_hash,
        world_id_verified: true,
        verification_level
      })
      await user.save()
      console.log('✅ New user created')
    } else {
      user.last_active = new Date()
      await user.save()
      console.log('✅ Existing user logged in')
    }
    
    const token = generateToken(nullifier_hash)
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nullifier_hash: user.nullifier_hash,
        is_premium: user.isPremiumActive(),
        subscription_type: user.subscription_type
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
// POST /api/auth/logout
// Logout user
// ============================================
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router