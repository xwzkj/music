import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('netease', (url, data) => {
  if (url.startsWith('/')) {
    url = url.slice(1);
  }
  // 将斜杠替换为下划线
  let path = url.replace(/\//g, '_');
  return ipcRenderer.invoke('netease', path, data)
})