const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  startBuild: (type) => ipcRenderer.send('start-build', type),
  onBuildStatus: (callback) => ipcRenderer.on('build-status', (_event, value) => callback(value)),
});
