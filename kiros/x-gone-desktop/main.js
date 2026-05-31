const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow;

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=x_gone";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log("Successfully connected to MongoDB");
  if (mainWindow) mainWindow.webContents.send('db-status', 'connected');
}).catch(err => {
  console.error("MongoDB connection error:", err);
  if (mainWindow) mainWindow.webContents.send('db-status', 'failed');
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    frame: false, // Frameless window
    transparent: true, // Allow custom styling and borders
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Changed to true if using preload
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the local UI instead of next.js server
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    // Check connection State
    if (mongoose.connection.readyState === 1) {
      mainWindow.webContents.send('db-status', 'connected');
    } else if (mongoose.connection.readyState === 2) {
      // connecting
    } else {
      mainWindow.webContents.send('db-status', 'failed');
    }
  });

  // Handle external links opening in the default browser instead of the Electron wrapper
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for window controls (close, minimize, maximize)
ipcMain.on('window-control', (event, action) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  
  if (action === 'close') win.close();
  if (action === 'minimize') win.minimize();
  if (action === 'maximize') {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

// Import DB Model
const Item = require('./models/Item');

// DB Handlers
ipcMain.handle('fetch-items', async () => {
  try {
    const items = await Item.find({}).lean().sort({ createdAt: 1 });
    return { success: true, data: items };
  } catch (err) {
    console.error('Fetch error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('add-item', async (event, payload) => {
  try {
    const newItem = await Item.create(payload);
    return { success: true, data: newItem.toJSON() };
  } catch (err) {
    console.error('Add error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('remove-item', async (event, id) => {
  try {
    await Item.findByIdAndDelete(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mass-wipe', async () => {
  try {
    await Item.deleteMany({});
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
