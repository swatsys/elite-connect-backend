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
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import exploreRoutes from './routes/explore.js';
import chatRoutes from './routes/chat.js';
import subscriptionRoutes from './routes/subscription.js';

dotenv.config();

const app = express();

// Middleware - CORS Configuration for World App
app.use(cors({
  origin: [
    'https://frontend-swatsys-projects.vercel.app',
    'https://worldcoin.org',
    'https://world.org',
    'capacitor://localhost',  // For World App mobile
    'ionic://localhost',      // Alternative for Ionic apps
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Elite Connect API'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Mini App API ready`);
  console.log(`🌍 World App ID: ${process.env.WORLD_APP_ID}`);
});

export default app;