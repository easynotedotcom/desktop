const { app, screen, BrowserWindow, Menu, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require("path");
const fs = require("fs");
const { menu } = require("./assets/js/menu");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let childWindow;
let initPath;


const isWindows = process.platform === "win32";

if (!isWindows){
  console.log(false)
}

try {
  data = JSON.parse(fs.readFileSync(initPath, "utf8"));
} catch (e) {}

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: width*0.8,
    height: height*0.8,
    show: false,
    frame:false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, "assets/icons/win/icon4.ico"),
    backgroundColor: "#fff",
    webPreferences: {
      preload: path.join(__dirname, "/assets/js/preload.js"),
      nodeIntegration: true,
      // https://www.electronjs.org/docs/api/webview-tag
      webviewTag: true, // Security warning since Electron 10
      zoomFactor: 1.0,
      enableRemoteModule: true,
    },
    frame: isWindows ? false : true
  });
  childWindow = new BrowserWindow({
    width: width*.5,
    height: height*.5,
    icon: path.join(__dirname, "assets/icons/png/Group 1849.png"),
    frame: false,
    transparent:true
  });

  mainWindow.loadFile('index.html');
  childWindow.loadFile('splash.html');

  childWindow.on('closed', function () {
    childWindow = null;
  });
  childWindow.once('ready-to-show', () => {
    childWindow.show()
  });
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    setInterval(function() {
      // your code goes here...
      autoUpdater.checkForUpdatesAndNotify();
  },60 * 1000); // 60 * 1000 milsec 1
    setTimeout(function() {
      mainWindow.show()}, 4000);
      setTimeout(function() {
        childWindow.close()}, 4000);
  });

  mainWindow.loadURL("file://" + __dirname + "/index.html");
  childWindow.loadURL("file://" + __dirname + "/splash.html");
}

app.on("web-contents-created", (e, contents) => { 
  if (contents.getType() == "webview") {
    ({ window: contents, }); 
  } 
});

app.on('ready', () => {
  initPath = path.join(app.getPath("userData"), "init.json");
  createWindow();
  
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    data = {
      bounds: mainWindow.getBounds(),
    };
    fs.writeFileSync(initPath, JSON.stringify(data));
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on(`display-app-menu`, function(e, args) {
  if (isWindows && mainWindow) {
    menu.popup({
      window: mainWindow,
      x: args.x,
      y: args.y
    });
  }
});