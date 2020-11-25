const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require("path");
const fs = require("fs");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let initPath;
const template = [
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteandmatchstyle" },
      { role: "delete" },
      { role: "selectall" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { role: "toggledevtools" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    role: "window",
    submenu: [{ role: "minimize" }, { role: "close" }],
  },
];

if (process.platform === "darwin") {
  template.unshift({
    label: app.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services", submenu: [] },
      { type: "separator" },
      { role: "hide" },
      { role: "hideothers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  });

  // Edit menu
  template[1].submenu.push(
    { type: "separator" },
    {
      label: "Speech",
      submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
    }
  );

  // Window menu
  template[3].submenu = [
    { role: "close" },
    { role: "minimize" },
    { role: "zoom" },
    { type: "separator" },
    { role: "front" },
  ];
}

try {
  data = JSON.parse(fs.readFileSync(initPath, "utf8"));
} catch (e) {}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    backgroundColor: "#fff",
    webPreferences: {
      nodeIntegration: true,
      // https://www.electronjs.org/docs/api/webview-tag
      webviewTag: true, // Security warning since Electron 10
      zoomFactor: 1.0,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  mainWindow.loadURL("file://" + __dirname + "/index.html");

   // Display Dev Tools
  //mainWindow.openDevTools();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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