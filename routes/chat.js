// import express from 'express';
// import Match from '../models/Match.js';
// import Message from '../models/Message.js';
// import Profile from '../models/Profile.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Get all matches
// router.get('/matches', authenticateToken, async (req, res) => {
//   try {
//     const matches = await Match.find({
//       $or: [
//         { user1_id: req.user._id },
//         { user2_id: req.user._id }
//       ],
//       status: 'matched',
//       chat_unlocked: true
//     })
//     .sort({ created_at: -1 });

//     const matchesWithProfiles = await Promise.all(
//       matches.map(async (match) => {
//         const otherUserId = match.user1_id.toString() === req.user._id.toString() 
//           ? match.user2_id 
//           : match.user1_id;

//         const profile = await Profile.findOne({ user_id: otherUserId });
//         const lastMessage = await Message.findOne({ match_id: match._id })
//           .sort({ created_at: -1 })
//           .limit(1);

//         return {
//           matchId: match._id,
//           profile: {
//             id: profile.user_id,
//             name: profile.name,
//             age: profile.age,
//             gender: profile.gender
//           },
//           lastMessage: lastMessage ? {
//             content: lastMessage.content,
//             createdAt: lastMessage.created_at
//           } : null,
//           createdAt: match.created_at
//         };
//       })
//     );

//     res.json({
//       success: true,
//       matches: matchesWithProfiles
//     });

//   } catch (error) {
//     console.error('Matches error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load matches'
//     });
//   }
// });

// // Get messages for a match
// router.get('/messages/:matchId', authenticateToken, async (req, res) => {
//   try {
//     const { matchId } = req.params;

//     const match = await Match.findById(matchId);

//     if (!match) {
//       return res.status(404).json({
//         success: false,
//         error: 'Match not found'
//       });
//     }

//     // Verify user is part of match
//     if (match.user1_id.toString() !== req.user._id.toString() &&
//         match.user2_id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         error: 'Unauthorized'
//       });
//     }

//     const messages = await Message.find({ match_id: matchId })
//       .sort({ created_at: 1 });

//     res.json({
//       success: true,
//       messages: messages.map(msg => ({
//         id: msg._id,
//         content: msg.content,
//         imageUrl: msg.image_url,
//         isMine: msg.sender_id.toString() === req.user._id.toString(),
//         createdAt: msg.created_at
//       }))
//     });

//   } catch (error) {
//     console.error('Messages error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load messages'
//     });
//   }
// });

// // Send a message
// router.post('/send', authenticateToken, async (req, res) => {
//   try {
//     const { matchId, content, imageUrl } = req.body;

//     if (!matchId || (!content && !imageUrl)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Match ID and content or image required'
//       });
//     }

//     const match = await Match.findById(matchId);

//     if (!match || !match.chat_unlocked) {
//       return res.status(403).json({
//         success: false,
//         error: 'Chat not unlocked'
//       });
//     }

//     const message = await Message.create({
//       match_id: matchId,
//       sender_id: req.user._id,
//       content: content || '',
//       image_url: imageUrl || null
//     });

//     res.json({
//       success: true,
//       message: {
//         id: message._id,
//         content: message.content,
//         imageUrl: message.image_url,
//         createdAt: message.created_at
//       }
//     });

//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to send message'
//     });
//   }
// });

// export default router;

// import express from 'express';
// import Match from '../models/Match.js';
// import Message from '../models/Message.js';
// import Profile from '../models/Profile.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Get all matches
// router.get('/matches', authenticateToken, async (req, res) => {
//   try {
//     const matches = await Match.find({
//       $or: [
//         { user1_id: req.user._id },
//         { user2_id: req.user._id }
//       ],
//       status: 'matched',
//       chat_unlocked: true
//     })
//     .sort({ created_at: -1 });

//     const matchesWithProfiles = await Promise.all(
//       matches.map(async (match) => {
//         const otherUserId = match.user1_id.toString() === req.user._id.toString() 
//           ? match.user2_id 
//           : match.user1_id;

//         const profile = await Profile.findOne({ user_id: otherUserId });
//         const lastMessage = await Message.findOne({ match_id: match._id })
//           .sort({ created_at: -1 })
//           .limit(1);

//         return {
//           matchId: match._id,
//           profile: {
//             id: profile.user_id,
//             name: profile.name,
//             age: profile.age,
//             gender: profile.gender
//           },
//           lastMessage: lastMessage ? {
//             content: lastMessage.content,
//             createdAt: lastMessage.created_at
//           } : null,
//           createdAt: match.created_at
//         };
//       })
//     );

//     res.json({
//       success: true,
//       matches: matchesWithProfiles
//     });

//   } catch (error) {
//     console.error('Matches error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load matches'
//     });
//   }
// });

// // Get messages for a match
// router.get('/messages/:matchId', authenticateToken, async (req, res) => {
//   try {
//     const { matchId } = req.params;

//     const match = await Match.findById(matchId);

//     if (!match) {
//       return res.status(404).json({
//         success: false,
//         error: 'Match not found'
//       });
//     }

//     // Verify user is part of match
//     if (match.user1_id.toString() !== req.user._id.toString() &&
//         match.user2_id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         error: 'Unauthorized'
//       });
//     }

//     const messages = await Message.find({ match_id: matchId })
//       .sort({ created_at: 1 });

//     res.json({
//       success: true,
//       messages: messages.map(msg => ({
//         id: msg._id,
//         content: msg.content,
//         imageUrl: msg.image_url,
//         isMine: msg.sender_id.toString() === req.user._id.toString(),
//         createdAt: msg.created_at
//       }))
//     });

//   } catch (error) {
//     console.error('Messages error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load messages'
//     });
//   }
// });

// // Send a message
// router.post('/send', authenticateToken, async (req, res) => {
//   try {
//     const { matchId, content, imageUrl } = req.body;

//     if (!matchId || (!content && !imageUrl)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Match ID and content or image required'
//       });
//     }

//     const match = await Match.findById(matchId);

//     if (!match || !match.chat_unlocked) {
//       return res.status(403).json({
//         success: false,
//         error: 'Chat not unlocked'
//       });
//     }

//     const message = await Message.create({
//       match_id: matchId,
//       sender_id: req.user._id,
//       content: content || '',
//       image_url: imageUrl || null
//     });

//     res.json({
//       success: true,
//       message: {
//         id: message._id,
//         content: message.content,
//         imageUrl: message.image_url,
//         createdAt: message.created_at
//       }
//     });

//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to send message'
//     });
//   }
// });

// export default router;

import express from 'express'
import User from '../models/User.js'
import Match from '../models/Match.js'
import Message from '../models/Message.js'
import Profile from '../models/Profile.js'

const router = express.Router()

// ============================================
// GET /api/chat/conversations
// Get all conversations (matches with messages)
// ============================================
router.get('/conversations', async (req, res) => {
  try {
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Find all active matches
    const matches = await Match.find({
      $or: [
        { user1_id: user._id, is_active: true },
        { user2_id: user._id, is_active: true }
      ]
    }).sort({ last_message_at: -1, matched_at: -1 })
    
    // Get conversation info for each match
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1_id.equals(user._id) ? match.user2_id : match.user1_id
        const profile = await Profile.findOne({ user_id: otherUserId })
        
        // Get last message
        const lastMessage = await Message.findOne({ match_id: match._id })
          .sort({ created_at: -1 })
          .limit(1)
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          match_id: match._id,
          receiver_id: user._id,
          is_read: false
        })
        
        return {
          match_id: match._id,
          user: profile ? {
            id: otherUserId,
            name: profile.name,
            age: profile.age,
            photos: profile.photos
          } : null,
          last_message: lastMessage ? {
            text: lastMessage.text,
            sent_at: lastMessage.created_at,
            is_mine: lastMessage.sender_id.equals(user._id)
          } : null,
          unread_count: unreadCount,
          matched_at: match.matched_at
        }
      })
    )
    
    console.log(`✅ Found ${conversations.length} conversations`)
    
    res.json({
      success: true,
      conversations: conversations.filter(c => c.user !== null)
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
// GET /api/chat/messages/:matchId
// Get messages for a match
// ============================================
router.get('/messages/:matchId', async (req, res) => {
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
    
    // Get messages
    const messages = await Message.find({ match_id: match._id })
      .sort({ created_at: 1 })
      .limit(100)
    
    // Mark messages as read
    await Message.updateMany(
      {
        match_id: match._id,
        receiver_id: user._id,
        is_read: false
      },
      {
        is_read: true,
        read_at: new Date()
      }
    )
    
    console.log(`✅ Retrieved ${messages.length} messages`)
    
    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id,
        text: msg.text,
        sender_id: msg.sender_id,
        is_mine: msg.sender_id.equals(user._id),
        created_at: msg.created_at,
        is_read: msg.is_read
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
// POST /api/chat/send
// Send a message
// ============================================
router.post('/send', async (req, res) => {
  try {
    const { match_id, text } = req.body
    
    if (!match_id || !text) {
      return res.status(400).json({
        success: false,
        error: 'match_id and text are required'
      })
    }
    
    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 1000 characters)'
      })
    }
    
    const user = await User.findOne({ nullifier_hash: req.nullifier_hash })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const match = await Match.findById(match_id)
    if (!match || !match.is_active) {
      return res.status(404).json({
        success: false,
        error: 'Match not found or inactive'
      })
    }
    
    // Verify user is part of this match
    if (!match.user1_id.equals(user._id) && !match.user2_id.equals(user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }
    
    // Determine receiver
    const receiver_id = match.user1_id.equals(user._id) ? match.user2_id : match.user1_id
    
    // Create message
    const message = new Message({
      match_id,
      sender_id: user._id,
      receiver_id,
      text: text.trim()
    })
    
    await message.save()
    
    // Update match last_message_at
    match.last_message_at = new Date()
    await match.save()
    
    console.log('✅ Message sent')
    
    res.json({
      success: true,
      message: {
        id: message._id,
        text: message.text,
        created_at: message.created_at,
        is_mine: true
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