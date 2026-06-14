const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Frameless for that premium look
    backgroundColor: '#000000',
    title: 'X-GONE',
    show: false, // Don't show until ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // IPC Handlers for frameless window controls
  ipcMain.on('window-close', () => {
    app.quit();
  });

  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();  
  });

  // Load the web app URL
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use a placeholder or provided icon
  const iconPath = path.join(__dirname, 'icon.png'); // Need to ensure an icon exists
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Always on Top', type: 'checkbox', checked: false, click: (item) => mainWindow.setAlwaysOnTop(item.checked) },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('X-GONE Workspace');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  // Tray creation would normally happen here if we had an icon.png
  // createTray(); 

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
