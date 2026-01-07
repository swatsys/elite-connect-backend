import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// World ID Verification endpoint
router.post('/verify', async (req, res) => {
  try {
    console.log('🔍 World ID verification request received');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    const { proof, merkle_root, nullifier_hash, verification_level } = req.body;

    // Validate required fields
    if (!proof || !merkle_root || !nullifier_hash) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: proof, merkle_root, nullifier_hash'
      });
    }

    // Verify with World ID API
    console.log('🌍 Calling World ID API...');
    const worldIdResponse = await fetch('https://developer.worldcoin.org/api/v1/verify/app_486e187afe7bc69a19456a3fa901a162', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proof: proof,
        merkle_root: merkle_root,
        nullifier_hash: nullifier_hash,
        verification_level: verification_level || 'orb',
        action: process.env.WORLD_ACTION_ID || 'signin'
      })
    });

    const worldIdData = await worldIdResponse.json();
    console.log('🌍 World ID API response:', worldIdData);

    if (!worldIdResponse.ok) {
      console.log('❌ World ID verification failed');
      return res.status(400).json({
        success: false,
        error: 'World ID verification failed',
        details: worldIdData
      });
    }

    // Verification successful
    console.log('✅ World ID verification successful');
    
    // TODO: Create/update user in your database here
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Verification successful',
      nullifier_hash: nullifier_hash
    });

  } catch (error) {
    console.error('❌ Error in World ID verification:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: error.message
    });
  }
});

// Get verification status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    app_id: process.env.WORLD_APP_ID,
    action_id: process.env.WORLD_ACTION_ID,
    configured: !!(process.env.WORLD_APP_ID && process.env.WORLD_ACTION_ID)
  });
});

export default router;
