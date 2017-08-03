
'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const tray = require('./tray');
const func = require('./js/functions');
const mod = require('./package.json');
const settings = require('./config');
const keepInTray = settings.get('keepInTray');
const fs = require('fs');
const path = require('path');
const mainPage = (`file://${__dirname}/index.html`);
const {Menu, MenuItem, ipcMain} = require('electron');
const dialog = require('electron').dialog;
const shell = require('electron').shell;
const localShortcut = require('electron-localshortcut');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let isQuitting = false;
var windows = new Set();

const getWindows = exports.getWindows = () => {
  return windows;
}

const createWindow = exports.createWindow = (file) => {
  var conf = {
      width: 1000,
      height: 600,
      show: false,
      frame: false,
      autoHideMenuBar: true
  }
  if (process.platform === 'darwin') {
    conf.titleBarStyle = 'hidden';
    conf.icon = path.join(__dirname, '/img/icon/icon.icns');
  } else {
    conf.icon = path.join(__dirname, '/img/icon/icon.ico');
  }
  let newWindow = new BrowserWindow(conf);
  windows.add(newWindow)
  newWindow.loadURL(mainPage);

  newWindow.once('ready-to-show', () => { newWindow.show(); });

  // Open the DevTools.
  // newWindow.webContents.openDevTools();

  if(keepInTray) {
    newWindow.on('close', e => {
      if (!isQuitting) {
        e.preventDefault();
        if (process.platform === 'darwin') {
          app.hide();
        } else {
          newWindow.hide();
        }
      }
    });
  }

  // Emitted when the window is closed.
  newWindow.on('closed', () => {
    windows.delete(newWindow)
    newWindow = null
  });

  //Open anchor links in browser
  newWindow.webContents.on('will-navigate', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  tray.create(newWindow);
}

ipcMain.on('export-to-pdf', (event, filePath) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  // Use default printing options
  win.webContents.printToPDF({}, (error, data) => {
    if (error) throw error
    fs.writeFile(filePath, data, (error) => {
      if (error) { throw error; }
    })
  })
});

//Set native menubar
var template = [
  {
    label: "&File",
    submenu: [
      {label: "New", accelerator: "CmdOrCtrl+N", click: function() {
        createWindow(); }
      },
      {label: "Open", accelerator: "CmdOrCtrl+O", click: function() {
        sendShortcut('file-open'); }
      },
      {type: "separator"},
      {label: "Save", accelerator: "CmdOrCtrl+S", click: function() {
        sendShortcut('file-save'); }
      },
      {label: "Save As", accelerator: "CmdOrCtrl+Shift+S", click: function() { sendShortcut('file-saveAs'); }
      },
      {label: "Export to PDF", click: function() {
        sendShortcut('file-pdf'); }
      },
      {type: "separator"},
      {label: "Settings", accelerator: "CmdOrCtrl+,", click: function() { openSettings(); }
      },
      {type: "separator"},
      {label: "Quit", accelerator: "CmdOrCtrl+Q", click: app.quit}
    ]
  },
  {
    label: "&Edit",
    submenu: [
      {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
      {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
      {type: "separator"},
      {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
      {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
      {label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
      {label: "Select All", accelerator: "CmdOrCtrl+A", role: 'selectall'},
      {type: "separator"},
      {label: "Find", accelerator: "CmdOrCtrl+F", click: function() { sendShortcut('CmdOrCtrl+f'); }
      },
      {label: "Replace", accelerator: "CmdOrCtrl+Shift+F", click: function() { sendShortcut('CmdOrCtrl+shift+f'); }
      },
      {type: "separator"},
      {label: "Auto-Indent", accelerator: "CmdOrCtrl+Shift+A", click: function() { sendShortcut('CmdOrCtrl+shift+a'); }
      },
      {label: "Indent Left", accelerator: "CmdOrCtrl+Left", click: function() { sendShortcut('CmdOrCtrl+left'); }
      },
      {label: "Indent Right", accelerator: "CmdOrCtrl+Right", click: function() { sendShortcut('CmdOrCtrl+right'); }
      },
      {type: "separator"},
      {label: "Toggle Comment", accelerator: "CmdOrCtrl+/", click: function() { sendShortcut('CmdOrCtrl+/'); }
      }
    ]
  },
  {
    label: "&View",
    submenu: [
      { label: "Reload", accelerator:"CmdOrCtrl+R", click: function() { sendShortcut('CmdOrCtrl+r'); }
      },
      {type: "separator"},
      { label: "Themes",
        submenu: [
          { label: "Monokai", click: function(){
            var cm = CodeMirror.fromTextArea(myTextArea);
            cm.setOption("theme", "monokai");
          }},
          { label: "Solarized", click: function(){
            func.pickTheme(this, "solarized");
          }}
        ]},
      {type: "separator"},
      { label: "Toggle Menu", accelerator:"CmdOrCtrl+M", click: function() { sendShortcut('CmdOrCtrl+m'); }
      },
      { label: "Toggle Toolbar", accelerator:"CmdOrCtrl+.", click: function() { sendShortcut('CmdOrCtrl+.'); }
      },
      { label: "Toggle Preview", accelerator:"CmdOrCtrl+Shift+M", click: function() { sendShortcut("CmdOrCtrl+Shift+M"); }
      },
      { label: "Toggle Full Screen", accelerator:"F11", click: function() {
        var focusedWindow = BrowserWindow.getFocusedWindow();
        let isFullScreen = focusedWindow.isFullScreen();
        focusedWindow.setFullScreen(!isFullScreen);
      }},
      {type: "separator"},
      {
      label: 'Toggle Developer Tools',
      accelerator: (function() {
        if (process.platform === 'darwin')
          return 'Command+Alt+I';
        else
          return 'Ctrl+Shift+I';
      }()),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.toggleDevTools();
      }}
    ]
  },
  {
    label: "&Help",
    submenu: [
      {label: "Documentation", click: function () {
        shell.openExternal(mod.repository.docs);
      }},
      {label: "Keybindings", click: function () {
        shell.openExternal(mod.repository.docs);
      }},
      {label: "Report Issue", click: function () {
        shell.openExternal(mod.bugs.url);
      }},
      {type: "separator"},
      {label: "About Hyde", click: function () {
        dialog.showMessageBox({title: "About Hyde", type:"info", message: "An Electron powered markdown editor for Jekyll users.\nMIT Copyright (c) 2017 Brett Stevenson <brettstevenson.me>", buttons: ["Close"] });
      }}
    ]
  }
];
// const menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);

function sendShortcut(cmd) {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow.webContents.send(cmd);
}

// Regestering local shortcuts for formatting markdown
localShortcut.register('CmdOrCtrl+b', function() { sendShortcut('ctrl+b'); });
localShortcut.register('CmdOrCtrl+i', function() { sendShortcut('ctrl+i'); });
localShortcut.register('CmdOrCtrl+-', function() { sendShortcut('ctrl+-'); });
localShortcut.register('CmdOrCtrl+/', function() { sendShortcut('ctrl+/'); });
localShortcut.register('CmdOrCtrl+l', function() { sendShortcut('ctrl+l'); });
localShortcut.register('CmdOrCtrl+f', function() { sendShortcut('ctrl+f'); });
localShortcut.register('CmdOrCtrl+Shift+f', function() { sendShortcut('ctrl+shift+f'); });
localShortcut.register('CmdOrCtrl+h', function() { sendShortcut('ctrl+h'); });
localShortcut.register('CmdOrCtrl+Alt+i', function() { sendShortcut('ctrl+alt+i'); });
localShortcut.register('CmdOrCtrl+Shift+t', function() { sendShortcut('ctrl+shift+t'); });
localShortcut.register('CmdOrCtrl+Shift+-', function() { sendShortcut('ctrl+shift+-'); });
localShortcut.register('CmdOrCtrl+r', function() { sendShortcut('ctrl+r'); });
localShortcut.register('CmdOrCtrl+m', function() { sendShortcut('ctrl+m'); });
localShortcut.register('CmdOrCtrl+.', function() { sendShortcut('ctrl+.'); });
localShortcut.register('CmdOrCtrl+Shift+m', function() { sendShortcut('ctrl+shift+m'); });
localShortcut.register('CmdOrCtrl+,', function() { sendShortcut('ctrl+,'); });


// This method will be called when Electron has finished initialization
// app.on('ready', createWindow);
app.on('ready', function() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  var conf = {
      width: 1000,
      height: 600,
      show: true,
      frame: false,
      autoHideMenuBar: true
  }
  if (process.platform === 'darwin') {
    conf.titleBarStyle = 'hidden';
    conf.icon = path.join(__dirname, '/img/icon/icon.icns');
  } else {
    conf.icon = path.join(__dirname, '/img/icon/icon.ico');
  }
  let mainWindow = new BrowserWindow(conf);

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  windows.add(mainWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

  app.on('before-quit', function() {
    isQuitting = true;
  });
});
