require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Note: We're using the fallback to process.env.MONGO_URI directly, but you could construct it if needed.
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Basic Default Route
app.get('/', (req, res) => {
  res.send('H-Ref Database Connection Successful and Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
