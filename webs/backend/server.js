const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));

// 404 handler for undefined routes
const { notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(require('./middleware/errorHandler'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
