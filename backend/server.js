const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Custom middleware to log API requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url} from ${req.ip}`);
    next();
  });
  
  // Add development-friendly headers to prevent caching issues
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
    next();
  });
}

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 requests for dev, 100 for production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and ping endpoints
    return req.url === '/api/health' || req.url === '/api/ping';
  }
});

// Only apply rate limiting in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_RATE_LIMIT === 'true') {
  app.use(limiter);
  console.log('🛡️  Rate limiting enabled');
} else {
  console.log('⚠️  Rate limiting disabled for development');
}

// CORS configuration with better error handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://127.0.0.1:3000', 
      'http://127.0.0.1:3001',
      process.env.CLIENT_URL, // Add production frontend URL
      undefined // for requests with no origin
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('🔍 Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware
app.use((req, res, next) => {
  // Set a timeout of 30 seconds for all requests
  req.setTimeout(30000, () => {
    console.error(`⏰ Request timeout: ${req.method} ${req.url}`);
    if (!res.headersSent) {
      res.status(408).json({
        message: 'Request timeout',
        error: 'The request took too long to complete'
      });
    }
  });
  
  res.setTimeout(30000, () => {
    console.error(`⏰ Response timeout: ${req.method} ${req.url}`);
    if (!res.headersSent) {
      res.status(408).json({
        message: 'Response timeout',
        error: 'The response took too long to send'
      });
    }
  });
  
  next();
});

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rishabh-instruments', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain a minimum of 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔄 Retrying connection in 5 seconds...');
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rishabh-instruments');
  }, 5000);
});

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
  // Don't exit on connection errors, just log them
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
  console.log('🔄 Attempting to reconnect...');
  
  // Attempt to reconnect after 5 seconds
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rishabh-instruments', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
    }).catch((err) => {
      console.error('🔴 Reconnection failed:', err.message);
    });
  }, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('🟢 Mongoose reconnected to MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/bom', require('./routes/bom'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      name: mongoose.connection.name || 'Unknown',
      host: mongoose.connection.host || 'Unknown'
    },
    version: require('./package.json').version || '1.0.0'
  };
  
  res.status(200).json(healthCheck);
});

// Simple ping endpoint
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    message: 'Server is alive!', 
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err.stack);
  
  // Don't crash the server on errors
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
    timestamp: new Date().toISOString()
  });
});

// Global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Don't exit the process, just log the error
});

// Keep-alive for MongoDB connection - reduced frequency for development
let keepAliveCount = 0;
const keepAliveInterval = process.env.NODE_ENV === 'development' ? 300000 : 60000; // 5 minutes for dev, 1 minute for prod

setInterval(() => {
  if (mongoose.connection.readyState === 1) {
    keepAliveCount++;
    mongoose.connection.db.admin().ping((err) => {
      if (err) {
        console.error('❌ MongoDB ping failed:', err.message);
      } else {
        // Only log every 10th ping to reduce log noise
        if (keepAliveCount % 10 === 0) {
          console.log(`💓 MongoDB connection alive (ping #${keepAliveCount})`);
        }
      }
    });
  } else {
    console.log('⚠️  MongoDB connection not ready, skipping ping');
  }
}, keepAliveInterval);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`🚫 Port ${PORT} is already in use. Please use a different port.`);
  }
});

module.exports = app;
