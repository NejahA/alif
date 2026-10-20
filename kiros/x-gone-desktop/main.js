const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

let mainWindow;

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=x-gone";

function connectToDatabase() {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  }).then(() => {
    console.log("Successfully connected to MongoDB");
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('db-status', 'connected');
    }
  }).catch(err => {
    console.error("MongoDB connection error:", err.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('db-status', 'failed');
    }
    // Retry connection after 5 seconds
    setTimeout(connectToDatabase, 5000);
  });
}

connectToDatabase();

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 720,
    minHeight: 520,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    icon: iconPath,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    const status = mongoose.connection.readyState === 1 ? 'connected' : 
                   mongoose.connection.readyState === 2 ? 'connecting' : 'failed';
    mainWindow.webContents.send('db-status', status);
  });

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

// IPC handlers for window controls
ipcMain.on('window-control', (event, action) => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
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

ipcMain.handle('get-db-status', () => {
  return mongoose.connection.readyState === 1 ? 'connected' :
         mongoose.connection.readyState === 2 ? 'connecting' : 'failed';
});

// DB Handlers
ipcMain.handle('fetch-items', async () => {
  try {
    const items = await Item.find({}).lean().sort({ createdAt: 1 });
    const formatted = items.map(item => ({
      ...item,
      id: item._id.toString(),
      _id: item._id.toString(),
      isCompleted: item.isCompleted || false,
      createdAt: new Date(item.createdAt).getTime(),
      expiresAt: new Date(item.expiresAt).getTime()
    }));
    return { success: true, data: formatted };
  } catch (err) {
    console.error('Fetch error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('add-item', async (event, payload) => {
  try {
    const newItem = await Item.create(payload);
    const formatted = {
      ...newItem.toObject(),
      id: newItem._id.toString(),
      _id: newItem._id.toString(),
      isCompleted: newItem.isCompleted || false,
      createdAt: new Date(newItem.createdAt).getTime(),
      expiresAt: new Date(newItem.expiresAt).getTime()
    };
    return { success: true, data: formatted };
  } catch (err) {
    console.error('Add error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('toggle-task', async (event, { id, isCompleted }) => {
  try {
    const cleanId = String(id).trim();
    await Item.findByIdAndUpdate(cleanId, { isCompleted });
    return { success: true };
  } catch (err) {
    console.error('Toggle error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('remove-item', async (event, id) => {
  try {
    if (!id) return { success: false, error: 'No ID provided' };
    const cleanId = String(id).trim();
    
    let res = null;
    if (mongoose.isValidObjectId(cleanId)) {
      res = await Item.findByIdAndDelete(cleanId);
    } else {
      res = await Item.deleteOne({ _id: cleanId });
    }
    return { success: true };
  } catch (err) {
    console.error('Remove error:', err.message);
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
