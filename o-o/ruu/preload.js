const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  optimize: (mode) => ipcRenderer.invoke('optimize', mode)
});
