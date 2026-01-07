import express from 'express';
import crypto from 'crypto';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import Match from '../models/Match.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get subscription status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user_id: req.user._id });

    if (!subscription) {
      subscription = await Subscription.create({
        user_id: req.user._id,
        type: 'free',
        free_connections_limit: parseInt(process.env.FREE_CONNECTIONS) || 2
      });
    }

    // Check if subscription expired
    if (subscription.subscription_expires_at && 
        new Date() > subscription.subscription_expires_at) {
      subscription.is_active = false;
      subscription.type = 'free';
      await subscription.save();
    }

    const hasActiveSubscription = subscription.is_active && 
      subscription.subscription_expires_at && 
      new Date() < subscription.subscription_expires_at;

    const freeConnectionsRemaining = subscription.free_connections_limit - 
      subscription.free_connections_used;

    const canConnect = hasActiveSubscription || freeConnectionsRemaining > 0;

    res.json({
      success: true,
      hasActiveSubscription,
      freeConnectionsRemaining: hasActiveSubscription ? null : freeConnectionsRemaining,
      totalConnectionsUsed: subscription.total_connections_used,
      subscriptionExpiresAt: subscription.subscription_expires_at,
      canConnect
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status'
    });
  }
});

// Initiate subscription payment
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const reference = crypto.randomUUID().replace(/-/g, '');

    await Transaction.create({
      user_id: req.user._id,
      reference,
      amount_wld: parseInt(process.env.MONTHLY_UNLIMITED_WLD) || 5,
      type: 'subscription',
      status: 'pending'
    });

    res.json({
      success: true,
      reference
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment'
    });
  }
});

// Verify subscription payment
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { reference, transactionId } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Reference required'
      });
    }

    const transaction = await Transaction.findOne({ reference });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.verified) {
      return res.json({
        success: true,
        verified: true,
        message: 'Already verified'
      });
    }

    // In production, verify with World Chain
    // For now, simulate verification
    const verified = true;

    if (verified) {
      transaction.status = 'completed';
      transaction.verified = true;
      transaction.verified_at = new Date();
      transaction.transaction_id = transactionId;
      await transaction.save();

      // Update subscription
      const subscription = await Subscription.findOne({ 
        user_id: req.user._id 
      });

      subscription.type = 'monthly_unlimited';
      subscription.is_active = true;
      subscription.subscription_started_at = new Date();
      subscription.subscription_expires_at = new Date(
        Date.now() + (parseInt(process.env.MONTHLY_UNLIMITED_DAYS) || 30) * 24 * 60 * 60 * 1000
      );
      subscription.updated_at = new Date();
      await subscription.save();

      res.json({
        success: true,
        verified: true
      });
    } else {
      transaction.status = 'failed';
      await transaction.save();

      res.json({
        success: false,
        verified: false
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Use connection (free or paid)
router.post('/use-connection', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({
        success: false,
        error: 'Match ID required'
      });
    }

    const subscription = await Subscription.findOne({ 
      user_id: req.user._id 
    });

    // Check if can connect
    const hasActiveSubscription = subscription.is_active && 
      subscription.subscription_expires_at && 
      new Date() < subscription.subscription_expires_at;

    const freeConnectionsRemaining = subscription.free_connections_limit - 
      subscription.free_connections_used;

    if (!hasActiveSubscription && freeConnectionsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: 'No connections available'
      });
    }

    // Unlock chat
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    match.chat_unlocked = true;
    await match.save();

    // Update subscription
    if (!hasActiveSubscription) {
      subscription.free_connections_used += 1;
    }
    subscription.total_connections_used += 1;
    subscription.updated_at = new Date();
    await subscription.save();

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Use connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to use connection'
    });
  }
});

export default router;