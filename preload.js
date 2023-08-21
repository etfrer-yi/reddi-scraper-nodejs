const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setSubredditInfo: (data) => ipcRenderer.send('formSubmission', data),
  setLoadingScreen: (callback) => ipcRenderer.on('webScraping', callback),
  setWordCounts: (callback) => ipcRenderer.on('finishScraping', callback)
})