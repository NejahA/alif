const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (defaultName) => ipcRenderer.invoke('save-file', defaultName),
  convertFile: (data) => ipcRenderer.invoke('convert-file', data),
  onConversionProgress: (callback) => ipcRenderer.on('conversion-progress', (_event, value) => callback(value)),
  onConversionComplete: (callback) => ipcRenderer.on('conversion-complete', (_event, result) => callback(result)),
  onConversionError: (callback) => ipcRenderer.on('conversion-error', (_event, error) => callback(error)),
});