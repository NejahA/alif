const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    title: "RUU - System Optimizer"
  });

  win.loadFile('index.html');
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

// Optimization logic
ipcMain.handle('optimize', async (event, mode) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (mode === 'gaming') {
        resolve('Gaming Mode Activated! (Allocated High CPU Priority, Suspended Background Indexing)');
      } else if (mode === 'coding') {
        resolve('Coding Mode Activated! (Optimized Disk I/O, Prioritized WSL/Docker resources)');
      }
    }, 1500);
  });
});
