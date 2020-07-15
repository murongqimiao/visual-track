import {app, BrowserWindow, Menu, globalShortcut} from 'electron'
import IPC from '../IPC.js'
import path from 'path'

let mainWindow
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

// 创建主窗体
const createWindow = () => {
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    width: 1008,
    height: 950,
    minWidth: 1008,
    minHeight: 950,
    maxWidth: 2008,
    maxHeight: 1950,
    useContentSize: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  globalShortcut.register('CommandOrControl+Q', () => {
    mainWindow.webContents.send(IPC.PRESS_CTRL_Q)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
