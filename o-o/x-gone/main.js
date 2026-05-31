const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Disable security warnings in dev
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Custom frame handles controls
    transparent: false,
    backgroundColor: '#080808',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In dev, load from local server
  if (!app.isPackaged) {
    win.loadURL('http://localhost:3000');
  } else {
    // In production, load from built files
    win.loadFile(path.join(__dirname, 'out/index.html'));
  }

  // IPC handlers for custom header
  ipcMain.on('minimize-window', () => win.minimize());
  ipcMain.on('close-window', () => win.close());

  // Build automation handlers
  ipcMain.on('start-build', (event, type) => {
    const { exec } = require('child_process');
    const command = type === 'windows' ? 'npm run electron:build' : 'npm run apk:build';
    
    event.reply('build-status', { type, status: 'starting', message: `Initializing ${type} build...` });

    const buildProcess = exec(command, { cwd: __dirname });

    buildProcess.stdout.on('data', (data) => {
      event.reply('build-status', { type, status: 'progress', message: data.toString() });
    });

    buildProcess.stderr.on('data', (data) => {
      event.reply('build-status', { type, status: 'warning', message: data.toString() });
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        event.reply('build-status', { type, status: 'success', message: `${type} build completed successfully!` });
      } else {
        event.reply('build-status', { type, status: 'error', message: `${type} build failed with exit code ${code}` });
      }
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
