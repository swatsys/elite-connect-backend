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


// import express from 'express'
// import User from '../models/User.js'

// const router = express.Router()

// // Helper function to generate token
// function generateToken(nullifier_hash) {
//   return Buffer.from(nullifier_hash).toString('base64')
// }

// // ============================================
// // POST /api/auth/verify
// // Verify World ID and create/login user
// // ============================================
// router.post('/verify', async (req, res) => {
//   try {
//     const { payload, action } = req.body
    
//     console.log('🔐 Verifying World ID...')
    
//     const APP_ID = process.env.APP_ID
//     if (!APP_ID) {
//       return res.status(500).json({
//         success: false,
//         error: 'APP_ID not configured'
//       })
//     }
    
//     // In production, use: await verifyCloudProof(payload, APP_ID, action, '')
//     // For now, accept valid payload for testing
    
//     if (!payload || !payload.nullifier_hash) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid payload'
//       })
//     }
    
//     const nullifier_hash = payload.nullifier_hash
//     const verification_level = payload.verification_level || 'device'
    
//     // Find or create user
//     let user = await User.findOne({ nullifier_hash })
    
//     if (!user) {
//       user = new User({
//         nullifier_hash,
//         world_id_verified: true,
//         verification_level
//       })
//       await user.save()
//       console.log('✅ New user created')
//     } else {
//       user.last_active = new Date()
//       await user.save()
//       console.log('✅ Existing user logged in')
//     }
    
//     const token = generateToken(nullifier_hash)
    
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         nullifier_hash: user.nullifier_hash,
//         is_premium: user.isPremiumActive(),
//         subscription_type: user.subscription_type
//       }
//     })
    
//   } catch (error) {
//     console.error('❌ Error:', error)
//     res.status(500).json({
//       success: false,
//       error: error.message
//     })
//   }
// })

// // ============================================
// // POST /api/auth/logout
// // Logout user
// // ============================================
// router.post('/logout', async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       message: 'Logged out successfully'
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     })
//   }
// })

// export default router

import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { verifyCloudProof } from '@worldcoin/minikit-js'
import User from '../models/User.js'  // ← IMPORT instead of defining

const router = express.Router()

// ============================================
// POST /api/auth/demo-signin
// Demo authentication (REMOVE IN PRODUCTION!)
// For local testing only
// ============================================
router.post('/demo-signin', async (req, res) => {
  try {
    console.log('🔐 Demo sign in...')
    
    const demoNullifierHash = `demo_${Date.now()}_${Math.random()}`
    
    let user = await User.findOne({ nullifier_hash: demoNullifierHash })
    
    if (!user) {
      user = new User({
        nullifier_hash: demoNullifierHash,
        verification_level: 'device'
      })
      await user.save()
      console.log('✅ Demo user created')
    }

    const Profile = mongoose.model('Profile')
    const profile = await Profile.findOne({ user_id: user._id })

    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        nullifier_hash: user.nullifier_hash,
        isDemo: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      user: {
        id: user._id,
        nullifier_hash: user.nullifier_hash,
        verification_level: user.verification_level
      },
      token,
      hasProfile: !!profile,
      profile: profile || null
    })

  } catch (error) {
    console.error('❌ Demo auth error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ============================================
// POST /api/auth/world-id-verify
// PRODUCTION World ID verification
// ============================================
router.post('/world-id-verify', async (req, res) => {
  try {
    const { payload, action } = req.body
    
    if (!payload || !payload.nullifier_hash) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload - nullifier_hash required'
      })
    }

    console.log('🌍 World ID Verification Request')
    console.log('📦 Payload:', {
      nullifier_hash: payload.nullifier_hash,
      verification_level: payload.verification_level
    })

    const app_id = process.env.APP_ID
    
    if (!app_id || !app_id.startsWith('app_')) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error - APP_ID missing or invalid'
      })
    }

    console.log('🔑 Using APP_ID:', app_id)
    console.log('🌍 Calling World ID verification service...')
    
    let verifyRes
    try {
      verifyRes = await verifyCloudProof(payload, app_id, action)
    } catch (verifyError) {
      console.error('❌ verifyCloudProof error:', verifyError)
      return res.status(500).json({
        success: false,
        error: 'Failed to verify with World ID service',
        details: verifyError.message
      })
    }

    console.log('📡 World ID response:', verifyRes)

    if (!verifyRes || !verifyRes.success) {
      console.error('❌ World ID verification failed:', verifyRes)
      
      if (verifyRes && verifyRes.code === 'already_verified') {
        return res.status(400).json({
          success: false,
          error: 'This World ID has already been used',
          code: 'already_verified'
        })
      }
      
      return res.status(400).json({
        success: false,
        error: verifyRes?.detail || 'World ID verification failed',
        code: verifyRes?.code || 'verification_failed'
      })
    }

    console.log('✅ World ID proof verified successfully!')
    console.log('🔑 Nullifier hash:', payload.nullifier_hash)
    console.log('🎖️ Verification level:', payload.verification_level)

    if (payload.verification_level !== 'orb') {
      console.warn('⚠️ Non-Orb verification attempted:', payload.verification_level)
      return res.status(403).json({
        success: false,
        error: 'Only Orb-verified users are allowed',
        code: 'orb_required'
      })
    }

    let user = await User.findOne({ nullifier_hash: payload.nullifier_hash })
    
    if (!user) {
      console.log('📝 Creating new user...')
      
      user = new User({
        nullifier_hash: payload.nullifier_hash,
        verification_level: payload.verification_level,
        created_at: new Date()
      })
      
      await user.save()
      console.log('✅ New user created:', user._id)
    } else {
      console.log('✅ Existing user found:', user._id)
      
      if (user.verification_level !== payload.verification_level) {
        user.verification_level = payload.verification_level
        await user.save()
        console.log('✅ User verification level updated')
      }
    }

    const Profile = mongoose.model('Profile')
    const profile = await Profile.findOne({ user_id: user._id })

    console.log('📋 Profile exists:', !!profile)

    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        nullifier_hash: user.nullifier_hash,
        verification_level: user.verification_level
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    console.log('✅ JWT token generated')

    const response = {
      success: true,
      user: {
        id: user._id,
        nullifier_hash: user.nullifier_hash,
        verification_level: user.verification_level,
        created_at: user.created_at
      },
      token,
      hasProfile: !!profile,
      profile: profile ? {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        interests: profile.interests
      } : null
    }

    console.log('✅ Sending success response')
    res.json(response)

  } catch (error) {
    console.error('❌ World ID verification error:', error)
    console.error('Stack:', error.stack)
    
    if (error.message && error.message.includes('already verified')) {
      return res.status(400).json({
        success: false,
        error: 'This World ID has already been used',
        code: 'already_verified'
      })
    }
    
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Verification failed' 
        : error.message
    })
  }
})

// ============================================
// GET /api/auth/verify-token
// Verify if JWT token is still valid
// ============================================
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const Profile = mongoose.model('Profile')
    const profile = await Profile.findOne({ user_id: user._id })

    res.json({
      success: true,
      user: {
        id: user._id,
        nullifier_hash: user.nullifier_hash,
        verification_level: user.verification_level
      },
      hasProfile: !!profile,
      profile: profile || null
    })

  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
})

export default router