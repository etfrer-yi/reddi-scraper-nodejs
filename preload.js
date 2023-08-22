const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setSubredditInfo: (data) => ipcRenderer.invoke('formSubmission', data),
  setPage: (callback) => ipcRenderer.on('webScraping', callback),
})