import app from './app.js';
import config from './config/index.js';
import connectDB from './config/database.js';
import logger from './config/logger.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(config.port, () => {
      logger.info(`Time Traveling Toaster backend listening on port ${config.port} [${config.env}]`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
