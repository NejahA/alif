const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  toggleMode: (mode) => ipcRenderer.invoke('toggle-mode', mode),
  closeApp: () => ipcRenderer.invoke('close-app')
});
