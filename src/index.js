const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const remote = require('@electron/remote/main');
const path = require('path');
const fs = require('fs')
require('@electron/remote/main').initialize()
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}
var mainWindow = undefined;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'src/img/ico.png',
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
      
    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  require('@electron/remote/main').enable(mainWindow.webContents)


};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0 && process.platform === 'darwin') {
    createWindow();
  }
});

ipcMain.on('openPreferences', () => {
  var win = new BrowserWindow({ title: 'Preferences', icon: 'src/img/ico.png', autoHideMenuBar: true, webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true
  } })
  win.loadFile('src/preferences.html')
  require("@electron/remote/main").enable(win.webContents)
  
})

// function setMainMenu() {
//   const template = [
//     {
//       label: 'File',
//       submenu: [
//         {
//           label: 'Open File',
//           accelerator: 'CmdOrCtrl+O',
//           async click() {
//             mainWindow.webContents.send('FILE_OPEN', '')
//           }l
          
//         },
//         {
//           label: 'Save File',
//           accelerator: 'CmdOrCtrl+S',
//           async click() {
//             mainWindow.webContents.send('SAVE_FILE', '')
//           }
          
//         }
//       ]
//     },
//     {
//       label: 'Edit',
//       submenu: [
//         {
//           label: 'Reload',
//           accelerator: 'CmdOrCtrl+R',
//           async click() {
//             mainWindow.webContents.reloadIgnoringCache()
//             mainWindow.webContents.openDevTools();
//           }
//         }
//       ]
//     }
//   ];
//   Menu.setApplicationMenu(Menu.buildFromTemplate(template));
// }

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and import them here.

