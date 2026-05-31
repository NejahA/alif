const { contextBridge, ipcRenderer } = require('electron');

// Safe bridge for the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize'),
});
