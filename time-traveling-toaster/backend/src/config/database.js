import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    
    // Attempt fallback to local MongoDB if Atlas connection fails
    if (config.mongo.uri !== 'mongodb://127.0.0.1:27017/time-traveling-toaster') {
      console.log('Attempting fallback connection to local MongoDB (127.0.0.1:27017)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/time-traveling-toaster');
        console.log(`Connected to local MongoDB: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error(`Local MongoDB fallback also failed: ${localErr.message}`);
      }
    }
    
    process.exit(1);
  }
};

export default connectDB;