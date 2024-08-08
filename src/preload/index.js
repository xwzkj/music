import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('isElectron', true)

contextBridge.exposeInMainWorld('netease', (url, data) => {
  if (url.startsWith('/')) {
    url = url.slice(1);
  }
  // 将斜杠替换为下划线
  let path = url.replace(/\//g, '_');
  // console.log('[debug][api]调用网易云API', path, data);
  return ipcRenderer.invoke('netease', path, data)
})

contextBridge.exposeInMainWorld('sendLyric', (lyricNowObj) => {
  return ipcRenderer.send('lyric', lyricNowObj);
})
contextBridge.exposeInMainWorld('sendThemeColors', (data) => {
  return ipcRenderer.send('themeColors', data);
})

contextBridge.exposeInMainWorld('setLyricWindowShow',(show)=>{
  return ipcRenderer.send('lyricWindowShow',show);
})