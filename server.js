// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';

// // Import routes
// import authRoutes from './routes/auth.js';
// import profileRoutes from './routes/profile.js';
// import exploreRoutes from './routes/explore.js';
// import chatRoutes from './routes/chat.js';
// import subscriptionRoutes from './routes/subscription.js';

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Database connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/explore', exploreRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/subscription', subscriptionRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'Elite Connect API'
//   });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json({ 
//     success: false, 
//     error: err.message || 'Internal server error' 
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     error: 'Route not found' 
//   });
// });

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📱 Mini App API ready`);
//   console.log(`🌍 World App ID: ${process.env.WORLD_APP_ID}`);
// });

// export default app;

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== CONFIGURATION =====
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const WORLD_APP_ID = process.env.WORLD_APP_ID || 'app_486e187afe7bc69a19456a3fa901a162';
const WORLD_API_BASE_URL = 'https://developer.worldcoin.org/api/v2';

// ===== IN-MEMORY DATABASE (Replace with real database in production) =====
const users = new Map(); // nullifier_hash -> user
const profiles = new Map(); // user_id -> profile

// ===== HELPER FUNCTIONS =====

/**
 * Verify World ID proof with Worldcoin API
 */
async function verifyWorldIDProof(payload, action, signal = '') {
  try {
    console.log('Verifying World ID proof...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const verifyRes = await axios.post(
      `${WORLD_API_BASE_URL}/verify/${WORLD_APP_ID}`,
      {
        nullifier_hash: payload.nullifier_hash,
        merkle_root: payload.merkle_root,
        proof: payload.proof,
        verification_level: payload.verification_level,
        action: action,
        signal: signal
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('World API response:', verifyRes.data);
    
    if (verifyRes.data.success) {
      console.log('✅ World ID proof verified successfully');
      return {
        success: true,
        nullifier_hash: payload.nullifier_hash,
        verification_level: payload.verification_level
      };
    } else {
      console.error('❌ World ID verification failed:', verifyRes.data);
      return {
        success: false,
        error: verifyRes.data.detail || 'Verification failed'
      };
    }
  } catch (error) {
    console.error('World ID verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Verification failed'
    };
  }
}

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify JWT token middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

// ===== ROUTES =====

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Elite Connect API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Verify World ID and create/login user
 */
app.post('/api/auth/verify', async (req, res) => {
  try {
    console.log('\n=== AUTHENTICATION REQUEST ===');
    const { payload, action, signal } = req.body;

    if (!payload || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payload or action' 
      });
    }

    // Verify the World ID proof with Worldcoin API
    const verification = await verifyWorldIDProof(payload, action, signal);

    if (!verification.success) {
      console.error('Verification failed:', verification.error);
      return res.status(400).json({ 
        success: false, 
        error: verification.error 
      });
    }

    const nullifierHash = verification.nullifier_hash;
    console.log('User nullifier hash:', nullifierHash);

    // Check if user exists
    let user = users.get(nullifierHash);

    if (!user) {
      // Create new user
      console.log('Creating new user...');
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nullifier_hash: nullifierHash,
        verification_level: verification.verification_level,
        created_at: new Date().toISOString(),
        profile_completed: false
      };
      users.set(nullifierHash, user);
      console.log('✅ New user created:', user.id);
    } else {
      console.log('✅ Existing user found:', user.id);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        profile_completed: user.profile_completed,
        verification_level: user.verification_level,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get current user info
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    // Find user by ID
    let user = null;
    for (const [nullifierHash, userData] of users.entries()) {
      if (userData.id === req.userId) {
        user = userData;
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      id: user.id,
      profile_completed: user.profile_completed,
      verification_level: user.verification_level,
      created_at: user.created_at
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Create user profile
 */
app.post('/api/profile/create', authenticateToken, (req, res) => {
  try {
    console.log('\n=== CREATE PROFILE REQUEST ===');
    const { name, age, gender, bio } = req.body;

    // Validate required fields
    if (!name || !age || !gender) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, age, gender' 
      });
    }

    // Validate age
    if (age < 18 || age > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Age must be between 18 and 100' 
      });
    }

    // Create profile
    const profile = {
      user_id: req.userId,
      name: name.trim(),
      age: parseInt(age),
      gender: gender,
      bio: bio ? bio.trim() : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    profiles.set(req.userId, profile);
    console.log('✅ Profile created for user:', req.userId);

    // Update user's profile_completed status
    for (const [nullifierHash, userData] of users.entries()) {
      if (userData.id === req.userId) {
        userData.profile_completed = true;
        break;
      }
    }

    res.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get user profile
 */
app.get('/api/profile/me', authenticateToken, (req, res) => {
  try {
    const profile = profiles.get(req.userId);

    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        error: 'Profile not found' 
      });
    }

    res.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get explore profiles (placeholder)
 */
app.get('/api/explore/profiles', authenticateToken, (req, res) => {
  try {
    // Get all profiles except current user's
    const allProfiles = [];
    
    for (const [userId, profile] of profiles.entries()) {
      if (userId !== req.userId) {
        allProfiles.push({
          id: userId,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          bio: profile.bio
        });
      }
    }

    // Return first profile or empty array
    res.json({
      success: true,
      profiles: allProfiles.length > 0 ? [allProfiles[0]] : []
    });

  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Like a profile (placeholder)
 */
app.post('/api/explore/like', authenticateToken, (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing profileId' 
      });
    }

    console.log(`User ${req.userId} liked profile ${profileId}`);

    res.json({
      success: true,
      matched: false // Implement matching logic in production
    });

  } catch (error) {
    console.error('Like profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Pass a profile (placeholder)
 */
app.post('/api/explore/pass', authenticateToken, (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing profileId' 
      });
    }

    console.log(`User ${req.userId} passed profile ${profileId}`);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Pass profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get chat matches (placeholder)
 */
app.get('/api/chat/matches', authenticateToken, (req, res) => {
  try {
    // Return empty matches for now
    res.json({
      success: true,
      matches: []
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Elite Connect API Server Running   ║
╠═══════════════════════════════════════╣
║   Port: ${PORT}                         ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   World App ID: ${WORLD_APP_ID.substring(0, 20)}...   ║
╚═══════════════════════════════════════╝
  `);
  console.log('✅ Server is ready to accept requests');
  console.log('📝 API Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/verify');
  console.log('   GET  /api/auth/me');
  console.log('   POST /api/profile/create');
  console.log('   GET  /api/profile/me');
  console.log('   GET  /api/explore/profiles');
  console.log('   POST /api/explore/like');
  console.log('   POST /api/explore/pass');
  console.log('   GET  /api/chat/matches');
  console.log('');
});

export default app;

// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';

// // Import routes
// import authRoutes from './routes/auth.js';
// import profileRoutes from './routes/profile.js';
// import exploreRoutes from './routes/explore.js';
// import chatRoutes from './routes/chat.js';
// import subscriptionRoutes from './routes/subscription.js';

// dotenv.config();

// const app = express();

// // Middleware - CORS Configuration for World App
// app.use(cors({
//   origin: [
//     'https://frontend-swatsys-projects.vercel.app',
//     'https://worldcoin.org',
//     'https://world.org',
//     'capacitor://localhost',  // For World App mobile
//     'ionic://localhost',      // Alternative for Ionic apps
//     'http://localhost:5173'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Content-Length', 'X-Request-Id']
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Add request logging for debugging
// app.use((req, res, next) => {
//   console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
//   next();
// });

// // Database connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/explore', exploreRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/subscription', subscriptionRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'Elite Connect API'
//   });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json({ 
//     success: false, 
//     error: err.message || 'Internal server error' 
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     error: 'Route not found' 
//   });
// });

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📱 Mini App API ready`);
//   console.log(`🌍 World App ID: ${process.env.WORLD_APP_ID}`);
// });

// export default app;

// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';

// // Import routes
// import authRoutes from './routes/auth.js';
// import profileRoutes from './routes/profile.js';
// import exploreRoutes from './routes/explore.js';
// import chatRoutes from './routes/chat.js';
// import subscriptionRoutes from './routes/subscription.js';

// dotenv.config();

// const app = express();

// // ============================================
// // CORS Configuration for World App - UPDATED!
// // ============================================
// app.use(cors({
//   origin: function(origin, callback) {
//     console.log('🌐 Request from origin:', origin);
    
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) {
//       console.log('✅ No origin - allowing request');
//       return callback(null, true);
//     }
    
//     // List of allowed origins
//     const allowedOrigins = [
//       'https://frontend-swatsys-projects.vercel.app',
//       'https://worldcoin.org',
//       'https://world.org',
//       'capacitor://localhost',
//       'ionic://localhost',
//       'http://localhost:5173',
//       'http://localhost:3000'
//     ];
    
//     // Check if origin is in allowed list
//     if (allowedOrigins.includes(origin)) {
//       console.log('✅ Origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // Allow localhost with any port for development
//     if (origin.startsWith('http://localhost')) {
//       console.log('✅ Localhost origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // For debugging - allow all origins temporarily
//     console.log('✅ Allowing origin (debug mode):', origin);
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
//   exposedHeaders: ['Content-Length', 'X-Request-Id'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));

// // ============================================
// // Request Logging Middleware - IMPORTANT!
// // ============================================
// app.use((req, res, next) => {
//   const timestamp = new Date().toISOString();
//   const origin = req.get('origin') || 'no-origin';
//   const method = req.method;
//   const path = req.path;
  
//   console.log(`📥 [${timestamp}] ${method} ${path} - Origin: ${origin}`);
  
//   // Log request body for POST requests (except passwords)
//   if (method === 'POST' && req.body) {
//     const safeBody = { ...req.body };
//     if (safeBody.password) safeBody.password = '[REDACTED]';
//     console.log('📦 Request body:', JSON.stringify(safeBody, null, 2));
//   }
  
//   next();
// });

// // ============================================
// // Body Parser Middleware
// // ============================================
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // ============================================
// // Database Connection
// // ============================================
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // ============================================
// // API Routes
// // ============================================
// app.use('/api/auth', authRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/explore', exploreRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/subscription', subscriptionRoutes);

// // ============================================
// // Health Check Endpoint
// // ============================================
// app.get('/api/health', (req, res) => {
//   console.log('💚 Health check called');
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'Elite Connect API',
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     worldAppId: process.env.WORLD_APP_ID
//   });
// });

// // ============================================
// // Root Endpoint
// // ============================================
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Elite Connect API',
//     status: 'running',
//     endpoints: {
//       health: '/api/health',
//       auth: '/api/auth',
//       profile: '/api/profile',
//       explore: '/api/explore',
//       chat: '/api/chat',
//       subscription: '/api/subscription'
//     }
//   });
// });

// // ============================================
// // Error Handling Middleware
// // ============================================
// app.use((err, req, res, next) => {
//   console.error('❌ Error occurred:', err);
//   console.error('❌ Stack:', err.stack);
  
//   res.status(err.status || 500).json({ 
//     success: false, 
//     error: err.message || 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // ============================================
// // 404 Handler
// // ============================================
// app.use((req, res) => {
//   console.log('❓ 404 - Route not found:', req.method, req.path);
//   res.status(404).json({ 
//     success: false, 
//     error: 'Route not found',
//     path: req.path,
//     method: req.method
//   });
// });

// // ============================================
// // Start Server
// // ============================================
// const PORT = process.env.PORT || 5002;

// app.listen(PORT, () => {
//   console.log('');
//   console.log('='.repeat(60));
//   console.log('🚀 Elite Connect Backend Server');
//   console.log('='.repeat(60));
//   console.log(`📍 Port: ${PORT}`);
//   console.log(`🌍 World App ID: ${process.env.WORLD_APP_ID}`);
//   console.log(`📱 Mini App API: Ready`);
//   console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
//   console.log(`🌐 CORS: Enabled with World App support`);
//   console.log(`📥 Request Logging: Enabled`);
//   console.log('='.repeat(60));
//   console.log('');
// });

// export default app;


// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';

// // Import routes
// import authRoutes from './routes/auth.js';
// import profileRoutes from './routes/profile.js';
// import exploreRoutes from './routes/explore.js';
// import chatRoutes from './routes/chat.js';
// import subscriptionRoutes from './routes/subscription.js';

// dotenv.config();

// const app = express();

// // ============================================
// // CORS Configuration for World App - UPDATED!
// // ============================================
// app.use(cors({
//   origin: function(origin, callback) {
//     console.log('🌐 Request from origin:', origin);
    
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) {
//       console.log('✅ No origin - allowing request');
//       return callback(null, true);
//     }
    
//     // List of allowed origins
//     const allowedOrigins = [
//       'https://elite-connect-frontend-swatsys-projects.vercel.app',
//       'https://worldcoin.org',
//       'https://world.org',
//       'capacitor://localhost',
//       'ionic://localhost',
//       'http://localhost:5173',
//       'http://localhost:3000'
//     ];
    
//     // Check if origin is in allowed list
//     if (allowedOrigins.includes(origin)) {
//       console.log('✅ Origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // Allow localhost with any port for development
//     if (origin.startsWith('http://localhost')) {
//       console.log('✅ Localhost origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // For debugging - allow all origins temporarily
//     console.log('✅ Allowing origin (debug mode):', origin);
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
//   exposedHeaders: ['Content-Length', 'X-Request-Id'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));

// // ============================================
// // Body Parser Middleware - MUST BE BEFORE ROUTES!
// // ============================================
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // ============================================
// // Request Logging Middleware - ENHANCED!
// // ============================================
// app.use((req, res, next) => {
//   const timestamp = new Date().toISOString();
//   const origin = req.get('origin') || 'no-origin';
//   const method = req.method;
//   const path = req.path;
//   const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  
//   console.log('');
//   console.log('='.repeat(80));
//   console.log(`📥 [${timestamp}] ${method} ${path}`);
//   console.log(`🌐 Origin: ${origin}`);
//   console.log(`🔗 Full URL: ${fullUrl}`);
//   console.log(`📍 Base URL: ${req.baseUrl}`);
//   console.log(`🎯 Route: ${req.route ? req.route.path : 'no route yet'}`);
  
//   // Log request body for POST requests (except passwords)
//   if (method === 'POST' && req.body) {
//     const safeBody = { ...req.body };
//     if (safeBody.password) safeBody.password = '[REDACTED]';
//     console.log('📦 Request body:', JSON.stringify(safeBody, null, 2));
//   }
  
//   console.log('='.repeat(80));
//   console.log('');
  
//   next();
// });

// // ============================================
// // Database Connection
// // ============================================
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // ============================================
// // Health Check Endpoint - BEFORE OTHER ROUTES
// // ============================================
// app.get('/api/health', (req, res) => {
//   console.log('💚 Health check called');
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'Elite Connect API',
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     worldAppId: process.env.WORLD_APP_ID,
//     registeredRoutes: {
//       auth: '/api/auth',
//       profile: '/api/profile',
//       explore: '/api/explore',
//       chat: '/api/chat',
//       subscription: '/api/subscription'
//     }
//   });
// });

// // ============================================
// // Root Endpoint
// // ============================================
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Elite Connect API',
//     status: 'running',
//     version: '1.0.0',
//     endpoints: {
//       health: '/api/health',
//       auth: '/api/auth/*',
//       profile: '/api/profile/*',
//       explore: '/api/explore/*',
//       chat: '/api/chat/*',
//       subscription: '/api/subscription/*'
//     },
//     availableRoutes: {
//       'POST /api/auth/verify': 'Verify World ID proof',
//       'GET /api/auth/me': 'Get current user',
//       'POST /api/profile': 'Create/update profile',
//       'GET /api/explore': 'Get profiles',
//       'POST /api/chat/:userId': 'Send message',
//       'GET /api/chat/:userId': 'Get messages',
//       'POST /api/subscription': 'Subscribe'
//     }
//   });
// });

// // ============================================
// // API Routes - CRITICAL REGISTRATION!
// // ============================================
// console.log('');
// console.log('📋 Registering routes...');

// app.use('/api/auth', (req, res, next) => {
//   console.log('🔵 Auth route handler called for:', req.method, req.path);
//   next();
// }, authRoutes);

// app.use('/api/profile', (req, res, next) => {
//   console.log('🔵 Profile route handler called for:', req.method, req.path);
//   next();
// }, profileRoutes);

// app.use('/api/explore', (req, res, next) => {
//   console.log('🔵 Explore route handler called for:', req.method, req.path);
//   next();
// }, exploreRoutes);

// app.use('/api/chat', (req, res, next) => {
//   console.log('🔵 Chat route handler called for:', req.method, req.path);
//   next();
// }, chatRoutes);

// app.use('/api/subscription', (req, res, next) => {
//   console.log('🔵 Subscription route handler called for:', req.method, req.path);
//   next();
// }, subscriptionRoutes);

// console.log('✅ All routes registered successfully');
// console.log('');

// // ============================================
// // 404 Handler - MUST BE AFTER ALL ROUTES!
// // ============================================
// app.use((req, res) => {
//   console.log('');
//   console.log('❌❌❌ 404 - ROUTE NOT FOUND ❌❌❌');
//   console.log('Method:', req.method);
//   console.log('Path:', req.path);
//   console.log('Full URL:', req.originalUrl);
//   console.log('Base URL:', req.baseUrl);
//   console.log('Available routes:');
//   console.log('  - /api/auth/verify (POST)');
//   console.log('  - /api/auth/me (GET)');
//   console.log('  - /api/profile (POST)');
//   console.log('  - /api/explore (GET)');
//   console.log('  - /api/chat/:userId (GET, POST)');
//   console.log('  - /api/subscription (POST)');
//   console.log('');
  
//   res.status(404).json({ 
//     success: false, 
//     error: 'Route not found',
//     path: req.path,
//     method: req.method,
//     message: `The route ${req.method} ${req.path} does not exist`,
//     availableRoutes: [
//       'POST /api/auth/verify',
//       'GET /api/auth/me',
//       'POST /api/profile',
//       'GET /api/explore',
//       'POST /api/chat/:userId',
//       'GET /api/chat/:userId',
//       'POST /api/subscription'
//     ]
//   });
// });

// // ============================================
// // Error Handling Middleware - MUST BE LAST!
// // ============================================
// app.use((err, req, res, next) => {
//   console.log('');
//   console.log('❌❌❌ ERROR OCCURRED ❌❌❌');
//   console.error('Error:', err.message);
//   console.error('Stack:', err.stack);
//   console.error('Path:', req.path);
//   console.error('Method:', req.method);
//   console.log('');
  
//   res.status(err.status || 500).json({ 
//     success: false, 
//     error: err.message || 'Internal server error',
//     path: req.path,
//     method: req.method,
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // ============================================
// // Start Server
// // ============================================
// const PORT = process.env.PORT || 5002;

// app.listen(PORT, () => {
//   console.log('');
//   console.log('='.repeat(80));
//   console.log('🚀 Elite Connect Backend Server');
//   console.log('='.repeat(80));
//   console.log(`📍 Port: ${PORT}`);
//   console.log(`🌍 World App ID: ${process.env.WORLD_APP_ID || 'NOT SET'}`);
//   console.log(`📱 Mini App API: Ready`);
//   console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
//   console.log(`🌐 CORS: Enabled with World App support`);
//   console.log(`📥 Request Logging: Enabled (Enhanced)`);
//   console.log('');
//   console.log('📋 Registered Routes:');
//   console.log('  ✅ POST /api/auth/verify - World ID verification');
//   console.log('  ✅ GET  /api/auth/me - Get current user');
//   console.log('  ✅ POST /api/profile - Create/update profile');
//   console.log('  ✅ GET  /api/explore - Get profiles');
//   console.log('  ✅ POST /api/chat/:userId - Send message');
//   console.log('  ✅ GET  /api/chat/:userId - Get messages');
//   console.log('  ✅ POST /api/subscription - Subscribe');
//   console.log('  ✅ GET  /api/health - Health check');
//   console.log('='.repeat(80));
//   console.log('');
//   console.log('🎯 Server is ready to accept connections!');
//   console.log('🔍 Watching for requests...');
//   console.log('');
// });

// export default app;