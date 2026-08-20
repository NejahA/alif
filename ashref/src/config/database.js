const mongoose = require('mongoose');
const logger = require('./logger');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ashref';

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    logger.info('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    logger.warn(`⚠️ MongoDB connection failed (${error.message}). Server running in offline database mode...`);
    setTimeout(connectDB, 10000);
    return null;
  }
};

const disconnectDB = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      logger.info('✅ MongoDB disconnected');
    }
  } catch (error) {
    logger.error('❌ MongoDB disconnection failed:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };

