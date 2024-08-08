import { app, shell, BrowserWindow, ipcMain, net, session, screen } from 'electron'
import { join, dirname } from 'path'
import os from 'os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import ElectronStore from 'electron-store'
// const fs = require('fs')
import * as fs from 'fs'
import netease from 'NeteaseCloudMusicApi'

console.log('奶酪音乐 ©丸子');


let mainWindow: BrowserWindow;
let lyricWindow: BrowserWindow;
let store: ElectronStore<conf>;
let primaryDisplay: Electron.Display;
let lyricWindowLocked: boolean;
function mkdirIfUnexist(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function pathToAbsolute(filePath: string) {
  return join(dirname(app.getPath('exe')), filePath);
}
function lockLyricWindow(isLock: boolean) {
  if (isLock) {
    lyricWindow.setIgnoreMouseEvents(true, { forward: true })
    lyricWindowLocked = true
  } else {
    lyricWindow.setIgnoreMouseEvents(false)
    lyricWindowLocked = false
  }
  store.set('lyricWindow.locked', lyricWindowLocked)
}

if (is.dev) {
  //更改数据目录到程序文件夹内
  mkdirIfUnexist(pathToAbsolute('./data/userData'));
  app.setPath('userData', pathToAbsolute('./data/userData'));
  mkdirIfUnexist(pathToAbsolute('./data/sessionData'));
  app.setPath('sessionData', pathToAbsolute('./data/sessionData'));
  console.log('调试模式 运行目录', app.getPath('exe'))
}
//////////////////////////////////////////////////////////////////////////////////////////////ready
app.on('ready', async () => {
  //防多开 主要是多开有问题
  let singleRunKey = { key: 'com.xwzkj.music' }
  if (is.dev) {
    singleRunKey.key += '.dev'
  }
  if (!app.requestSingleInstanceLock(singleRunKey)) {
    app.quit()
  }


  primaryDisplay = screen.getPrimaryDisplay();
  store = new ElectronStore<conf>()
  // 往亦晕音乐api 本地处理
  ipcMain.handle('netease', async (_, path, data) => {
    try {
      let func = netease[path as keyof typeof netease] as Function
      let res = await func(data)
      return { data: res.body };
    } catch (e) {
      console.log('wyyapi', e);
      return e
    }
  })
  // 桌面歌词传递
  ipcMain.on('lyric', (_, data) => {
    console.log('lyric: ', data);

    if (lyricWindow) {
      lyricWindow.webContents.send('lyric', data)
    }
  })
  // 主题色传递
  ipcMain.on('themeColors', (_, data) => {
    console.log('theme: ', data);
    if (lyricWindow) {
      lyricWindow.webContents.send('themeColors', data)
    }
  })
  // 桌面歌词窗口打开关闭
  ipcMain.on('lyricWindowShow', (_, data) => {
    console.log('lyricWindowShow: ', data);
    if (data) {
      lyricWindow.show()
    } else {
      lyricWindow.hide()
    }
  })
  // 桌面歌词窗口锁定（鼠标穿透
  lyricWindowLocked = store.get('lyricWindow.locked')
  ipcMain.on('lyricWindowLock', (_, islock) => {
    // console.log('lyricWindowLock:', islock);
    lockLyricWindow(islock)
  })
  ipcMain.handle('isLyricWindowLocked', () => {
    // console.log('isLyricWindowLocked:', lyricWindowLocked);
    return lyricWindowLocked
  })
  //加载devTool插件
  if (os.platform() == 'win32') {
    await session.defaultSession.loadExtension("F:/code/web/vue-devtools")
  }
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
      sandbox: false,
      // webSecurity: false,
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }
  // 使用 session API 设置 CORS 头
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    delete details.responseHeaders!['access-control-allow-origin']
    details.responseHeaders!['Access-Control-Allow-Origin'] = ['*']
    // console.log(details.responseHeaders);
    callback({
      responseHeaders: details.responseHeaders
    })
  })

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
      sandbox: false,
    }
  })
  lyricWindow.setAlwaysOnTop(true, 'screen-saver')
  // 先隐藏 然后通过主窗口控制显示状态
  lyricWindow.hide();
  //开始读取配置
  console.log(store.get('lyricWindow'));
  // 设置窗口大小
  let temp: any = store.get('lyricWindow.size', [1000, 160])
  if (temp[0] >= primaryDisplay.workAreaSize.width || temp[1] > primaryDisplay.workAreaSize.height - 100) {
    temp = [1000, 160]
  }
  lyricWindow.setSize(temp[0], temp[1])
  // 设置位置
  temp = store.get('lyricWindow.position', [0, primaryDisplay.workAreaSize.height - 160])
  if (temp[0] < 0 || temp[0] > primaryDisplay.workAreaSize.width - 50 || temp[1] < 0 || temp[1] > primaryDisplay.workAreaSize.height - 50) {
    temp = [0, primaryDisplay.workAreaSize.height - 160]
  }
  lyricWindow.setPosition(temp[0], temp[1])
  //设置锁定
  temp = store.get('lyricWindow.locked', false)
  lockLyricWindow(temp)

  //加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    lyricWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/desktopLyric.html')
  } else {
    lyricWindow.loadFile(join(__dirname, '../renderer/desktopLyric.html'))
  }

  lyricWindow.setSkipTaskbar(true)


  // 窗口事件
  // 歌词窗口 保存位置
  lyricWindow.on('moved', () => {
    store.set('lyricWindow.position', lyricWindow.getPosition())
  })
  // 歌词窗口 保存大小
  lyricWindow.on('resized', () => {
    store.set('lyricWindow.size', lyricWindow.getSize())
  })
  mainWindow.on('close', (e) => {
    if (lyricWindow) {
      lyricWindow.close()
    }
  })
}