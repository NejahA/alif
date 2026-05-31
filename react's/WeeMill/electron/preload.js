const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  downloadVideo: (url, quality) => ipcRenderer.invoke('download-video', { url, quality }),
  getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url)
});
