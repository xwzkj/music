import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('lyric', (callback) => {
  return ipcRenderer.on('lyric',callback)
})