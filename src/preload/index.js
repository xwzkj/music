import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('isElectron', true)
contextBridge.exposeInMainWorld('api', {
  'netease': (url, data) => {
    if (url.startsWith('/')) {
      url = url.slice(1);
    }
    // 将斜杠替换为下划线
    let path = url.replace(/\//g, '_');
    // console.log('[debug][api]调用网易云API', path, data);
    return ipcRenderer.invoke('netease', path, data)
  },
  'sendLyric': (lyricNowObj) => {
    return ipcRenderer.send('lyric', lyricNowObj);
  },
  'sendThemeColors': (data) => {
    return ipcRenderer.send('themeColors', data);
  },
  'setLyricWindowShow': (show) => {
    return ipcRenderer.send('lyricWindowShow', show);
  },
  'openUrl': (url) => {
    return ipcRenderer.invoke('openUrl', url);
  },
  'appVersion': await ipcRenderer.invoke('getAppVersion'),
  // 'appVersion': '1.0.0'

  'windowClose': () => {
    return ipcRenderer.send('window-close')
  },

  'receiveCookie': (callback) => {
    ipcRenderer.on('cookie', callback)
  },

  'getCookie': () => {
    return ipcRenderer.invoke('getCookie')
  },
})