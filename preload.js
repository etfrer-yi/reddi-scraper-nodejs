const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setSubredditInfo: (data) => ipcRenderer.send('formSubmission', data)
})