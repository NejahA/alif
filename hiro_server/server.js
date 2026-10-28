import app from './api/index.js';

const PORT = process.env.PORT || 3456;

app.listen(PORT, () => {
  console.log(`🌱 hi§ro live server running locally at http://localhost:${PORT}`);
  console.log(`⚡ Real-time SSE stream active at http://localhost:${PORT}/api/events`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/api/hiro/health`);
});
