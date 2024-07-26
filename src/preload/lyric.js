import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('getLyric', (callback) => {
  return ipcRenderer.on('lyric',callback)
})
contextBridge.exposeInMainWorld('getThemeColors', (callback) => {
  return ipcRenderer.on('themeColors',callback)
})