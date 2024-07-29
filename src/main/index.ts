import { app, shell, BrowserWindow, ipcMain, net, session, screen } from 'electron'
import { join, dirname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import ElectronStore from 'electron-store'
// const fs = require('fs')
import * as fs from 'fs'
import * as netease from 'NeteaseCloudMusicApi'

console.log('奶酪音乐 ©丸子');


let mainWindow: BrowserWindow;
let lyricWindow: BrowserWindow;
let store: ElectronStore<conf>;
let primaryDisplay: Electron.Display;
function mkdirIfUnexist(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function pathToAbsolute(filePath: string) {
  return join(dirname(app.getPath('exe')), filePath);
}

if (is.dev) {
  //更改数据目录到程序文件夹内
  mkdirIfUnexist(pathToAbsolute('./data/userData'));
  app.setPath('userData', pathToAbsolute('./data/userData'));
  mkdirIfUnexist(pathToAbsolute('./data/sessionData'));
  app.setPath('sessionData', pathToAbsolute('./data/sessionData'));
  console.log('调试模式 运行目录',app.getPath('exe'))
}
//////////////////////////////////////////////////////////////////////////////////////////////ready
app.on('ready', () => {
  //防多开 主要是多开有问题
  let singleRunKey = { key: 'com.xwzkj.music' }
  if (is.dev) {
    singleRunKey.key += '.dev'
  }
  if (!app.requestSingleInstanceLock(singleRunKey)) {
    app.quit()
  }

  primaryDisplay = screen.getPrimaryDisplay();
  store = new ElectronStore<conf>({
    defaults: {
      lyricWindow: {
        position: [0, primaryDisplay.workAreaSize.height-160]
      }
    }
  })

  //往亦晕音乐api 本地处理
  ipcMain.handle('netease', async (_, path, data) => {
    try {
      let func = netease[path as keyof typeof netease] as Function
      let res = await func(data)
      return { data: res.body };
    } catch (e) {
      return e
    }
  })
  //桌面歌词传递
  ipcMain.on('lyric', (_, data) => {
    console.log('lyric: ', data);

    if (lyricWindow) {
      lyricWindow.webContents.send('lyric', data)
    }
  })
  //主题色传递
  ipcMain.on('themeColors', (_, data) => {
    console.log('theme: ', data);
    if (lyricWindow) {
      lyricWindow.webContents.send('themeColors', data)
    }
  })
  //加载devTool插件
  session.defaultSession.loadExtension(join(__dirname, '../../resources/devTool/6.6.3_0'))

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.xwzkj.music')
  createWindow()

  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    console.log(additionalData, commandLine)
    //试图运行第二个实例，将第一个实例窗口聚焦
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
})
app.on('window-all-closed', () => {
  app.quit()
})

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1150,
    minWidth: 900,
    height: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  if(is.dev){
    mainWindow.webContents.openDevTools()
  }
  lyricWindow = new BrowserWindow({
    width: 1000,
    height: 160,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    titleBarStyle: 'hidden',
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      preload: join(__dirname, '../preload/lyric.mjs'),
      sandbox: false
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    lyricWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/desktopLyric.html')
  } else {
    lyricWindow.loadFile(join(__dirname, '../renderer/desktopLyric.html'))
  }
  if(is.dev){
    lyricWindow.webContents.openDevTools()
  }else{
    lyricWindow.setSkipTaskbar(true)
  }
  lyricWindow.setAlwaysOnTop(true, 'screen-saver')
  lyricWindow.setPosition(
    store.get('lyricWindow.position')[0],
    store.get('lyricWindow.position')[1]
  )
  console.log(lyricWindow.getPosition());
  
  // lyricWindow.setIgnoreMouseEvents(true, { forward: true })

  // 歌词窗口 保存位置
  lyricWindow.on('moved', () => {
    store.set('lyricWindow.position',lyricWindow.getPosition())
  })

  mainWindow.on('close', (e) => {
    if (lyricWindow) {
      lyricWindow.close()
    }
  })
}