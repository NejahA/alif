const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

function createWindow () {
  const win = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    frame: false, // make it sleek, no default window border
    transparent: true,
    show: false
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // check if dev or production
  if (process.env.NODE_ENV !== 'production' && !app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
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

// IPC listeners for OS actions
ipcMain.handle('get-system-stats', () => {
  return {
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    cpus: os.cpus()
  };
});

ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('toggle-mode', (event, mode) => {
  console.log(`Switching to Mode: ${mode}`);
  // Fake killing processes for safety since we don't want to actually kill user's apps right now
  if(mode === 'Gaming') {
    return "Optimized system for Gaming. Backgound dev servers paused.";
  } else if (mode === 'Coding') {
    return "Optimized system for Coding. Quick-launched IDE context.";
  }
  return "Mode reset.";
});
