import { app, shell, BrowserWindow, ipcMain, net, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as netease from 'NeteaseCloudMusicApi'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1150,
    height: 800,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
app.on('ready', () => {
  ipcMain.handle('netease', async (_, path, data) => {
    try {
      let res = await netease[path](data)
      // console.log('neteaseApi', path, res);
      return { data: res.body};
    } catch (e) {
      return e
    }
  })
  session.defaultSession.loadExtension(join(__dirname, '../../resources/devTool/6.6.3_0'))

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.xwzkj.music')
  createWindow()
})
app.on('window-all-closed', () => {
  app.quit()
})