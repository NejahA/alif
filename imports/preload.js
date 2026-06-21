const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getShipments: () => ipcRenderer.invoke('get-shipments'),
  addShipment: (shipment) => ipcRenderer.invoke('add-shipment', shipment),
  updateShipment: (shipment) => ipcRenderer.invoke('update-shipment', shipment),
  deleteShipment: (id) => ipcRenderer.invoke('delete-shipment', id),
  exportCsv: () => ipcRenderer.invoke('export-csv'),
});