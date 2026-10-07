const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  dummy: () => ipcRenderer.send('dummy-event')
});
