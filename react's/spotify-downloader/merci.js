require('dotenv').config();
const express = require('express');
const yts = require('yt-search');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// API Routes²
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'merci.html'));
});

// Search YouTube for tracks
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    const results = await yts(query);
    
    const tracks = results.videos.slice(0, 10).map(video => ({
      id: video.videoId,
      name: video.title,
      artist: video.author.name,
      album: 'YouTube',
      cover: video.thumbnail,
      duration: video.duration * 1000,
      url: video.url,
    }));
    
    res.json({ success: true, tracks });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// Get track info from YouTube URL
app.get('/api/track', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    // Extract video ID from URL
    let videoId = null;
    
    // Handle different YouTube URL formats
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    } else {
      // Try to extract any 11-character YouTube ID
      const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (match) videoId = match[1];
    }
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Get video details using video ID
    const results = await yts(videoId);
    
    if (!results.videos || results.videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const video = results.videos[0];
    
    res.json({
      success: true,
      track: {
        id: video.videoId,
        name: video.title,
        artist: video.author.name,
        album: 'YouTube',
        cover: video.thumbnail,
        duration: video.duration * 1000,
        url: video.url,
      },
    });
  } catch (error) {
    console.error('Error getting track:', error);
    res.status(500).json({ error: 'Failed to get track info' });
  }
});

app.listen(PORT, () => {
  console.log(`Merci - Music Player running on port ${PORT}`);
  console.log(`Server started at ${new Date().toISOString()}`);
});
