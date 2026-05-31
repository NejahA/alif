// This file is required by electron-builder's react-cra preset
// It loads the actual main process file from the electron folder
try {
  module.exports = require('../electron/main.js');
} catch (e) {
  console.error('Failed to load main process:', e);
}
