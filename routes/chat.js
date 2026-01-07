import express from 'express';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Profile from '../models/Profile.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all matches
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1_id: req.user._id },
        { user2_id: req.user._id }
      ],
      status: 'matched',
      chat_unlocked: true
    })
    .sort({ created_at: -1 });

    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1_id.toString() === req.user._id.toString() 
          ? match.user2_id 
          : match.user1_id;

        const profile = await Profile.findOne({ user_id: otherUserId });
        const lastMessage = await Message.findOne({ match_id: match._id })
          .sort({ created_at: -1 })
          .limit(1);

        return {
          matchId: match._id,
          profile: {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            gender: profile.gender
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.created_at
          } : null,
          createdAt: match.created_at
        };
      })
    );

    res.json({
      success: true,
      matches: matchesWithProfiles
    });

  } catch (error) {
    console.error('Matches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load matches'
    });
  }
});

// Get messages for a match
router.get('/messages/:matchId', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    // Verify user is part of match
    if (match.user1_id.toString() !== req.user._id.toString() &&
        match.user2_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const messages = await Message.find({ match_id: matchId })
      .sort({ created_at: 1 });

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id,
        content: msg.content,
        imageUrl: msg.image_url,
        isMine: msg.sender_id.toString() === req.user._id.toString(),
        createdAt: msg.created_at
      }))
    });

  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load messages'
    });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { matchId, content, imageUrl } = req.body;

    if (!matchId || (!content && !imageUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Match ID and content or image required'
      });
    }

    const match = await Match.findById(matchId);

    if (!match || !match.chat_unlocked) {
      return res.status(403).json({
        success: false,
        error: 'Chat not unlocked'
      });
    }

    const message = await Message.create({
      match_id: matchId,
      sender_id: req.user._id,
      content: content || '',
      image_url: imageUrl || null
    });

    res.json({
      success: true,
      message: {
        id: message._id,
        content: message.content,
        imageUrl: message.image_url,
        createdAt: message.created_at
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

export default router;