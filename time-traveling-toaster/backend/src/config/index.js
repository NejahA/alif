import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  env: process.env.NODE_ENV || 'development',
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/time-traveling-toaster',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-too',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  
  game: {
    startingEnergy: 100,
    timeTravelCost: 25,
    toastReward: 10,
    maxToasts: 1000,
    timePeriods: ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic']
  }
};

export default config;
