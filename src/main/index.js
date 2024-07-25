import { app, shell, BrowserWindow, ipcMain, net, session } from 'electron'
import { join, dirname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const fs = require('fs')
import * as netease from 'NeteaseCloudMusicApi'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1150,
    height: 800,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    // titleBarStyle: 'hidden',
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

function mkdirIfUnexist(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function pathToAbsolute(filePath) {
  return join(dirname(app.getPath('exe')), filePath);
}
console.log(pathToAbsolute('./data/userData'))
//更改数据目录到程序文件夹内
mkdirIfUnexist(pathToAbsolute('./data/userData'));
app.setPath('userData', pathToAbsolute('./data/userData'));
mkdirIfUnexist(pathToAbsolute('./data/sessionData'));
app.setPath('sessionData', pathToAbsolute('./data/sessionData'));

app.on('ready', () => {
  //往亦晕音乐api 本地处理
  ipcMain.handle('netease', async (_, path, data) => {
    try {
      let res = await netease[path](data)
      return { data: res.body };
    } catch (e) {
      return e
    }
  })
  //加载devTool插件
  session.defaultSession.loadExtension(join(__dirname, '../../resources/devTool/6.6.3_0'))

  // Set app user model id for windows
  if (is.dev) {
    electronApp.setAppUserModelId('com.xwzkj.music.dev')
  } else {
    electronApp.setAppUserModelId('com.xwzkj.music')
  }
  createWindow()
})
app.on('window-all-closed', () => {
  app.quit()
})