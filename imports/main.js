const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const dataFile = path.join(app.getPath('userData'), 'imports.json');

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return { shipments: [], nextId: 1 };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Import Tracker',
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC Handlers
ipcMain.handle('get-shipments', () => {
  return loadData();
});

ipcMain.handle('add-shipment', (event, shipment) => {
  const data = loadData();
  shipment.id = data.nextId++;
  shipment.createdAt = new Date().toISOString();
  data.shipments.push(shipment);
  saveData(data);
  return data;
});

ipcMain.handle('update-shipment', (event, shipment) => {
  const data = loadData();
  const idx = data.shipments.findIndex(s => s.id === shipment.id);
  if (idx !== -1) {
    data.shipments[idx] = { ...data.shipments[idx], ...shipment };
    saveData(data);
  }
  return data;
});

ipcMain.handle('delete-shipment', (event, id) => {
  const data = loadData();
  data.shipments = data.shipments.filter(s => s.id !== id);
  saveData(data);
  return data;
});

ipcMain.handle('export-csv', async () => {
  const data = loadData();
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'imports-export.csv',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
  });
  if (!filePath) return false;

  const headers = ['ID', 'Item Name', 'Origin', 'Destination', 'Quantity', 'Weight (kg)', 'Status', 'ETA', 'Created'];
  const rows = data.shipments.map(s => [
    s.id, s.itemName, s.origin, s.destination, s.quantity, s.weight, s.status, s.eta, s.createdAt
  ].map(v => `"${v || ''}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(filePath, '\uFEFF' + csv, 'utf8');
  return true;
});