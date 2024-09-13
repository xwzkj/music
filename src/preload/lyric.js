import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('getLyric', (callback) => {
  return ipcRenderer.on('lyric', callback)
})
contextBridge.exposeInMainWorld('getThemeColors', (callback) => {
  return ipcRenderer.on('themeColors', callback)
})
contextBridge.exposeInMainWorld('lyricWindowLock', (isLock) => {
  return ipcRenderer.send('lyricWindowLock', isLock)
})
contextBridge.exposeInMainWorld('isLyricWindowLocked', () => {
  return ipcRenderer.invoke('isLyricWindowLocked')
})
