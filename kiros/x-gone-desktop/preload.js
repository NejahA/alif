const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  windowControl: (action) => ipcRenderer.send('window-control', action),
  fetchItems: () => ipcRenderer.invoke('fetch-items'),
  addItem: (payload) => ipcRenderer.invoke('add-item', payload),
  removeItem: (id) => ipcRenderer.invoke('remove-item', id),
  toggleTask: (payload) => ipcRenderer.invoke('toggle-task', payload),
  massWipe: () => ipcRenderer.invoke('mass-wipe'),
  getDbStatus: () => ipcRenderer.invoke('get-db-status'),
  onDbStatus: (callback) => {
    const handler = (_event, status) => callback(status);
    ipcRenderer.on('db-status', handler);
    return () => ipcRenderer.removeListener('db-status', handler);
  }
});
