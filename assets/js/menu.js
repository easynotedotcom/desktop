const { app, Menu, dialog} = require("electron");
const path = require("path");
const isMac = process.platform === "darwin";
const version = app.getVersion()

const template = [
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }]
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" }
    ]
  },
  // { role: 'viewMenu' }
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
      { role: "togglefullscreen" }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }]
  },
  {
    role: "Help",
    submenu: [
      { label: "Get Started With Easynote",
      click: async () => {
        const { shell } = require('electron')
        await shell.openExternal('https://www.youtube.com/watch?v=OkPqo-7Xglc&ab_channel=Easynote')
      } },
      { label: "About",
        click(){
          const { shell } = require('electron')
          dialog.showMessageBox({
           icon:path.join(__dirname, "../icons/png/256x256.png"),
           message: 'Copyright: Easynote AB                                   ' +
                    'Website: easynote.com',
           detail: 'Version ' + version + ' Developed by Lukas Tucker @ Easynote',
           title: 'Easynote'})
        }}],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = {
  menu
};
