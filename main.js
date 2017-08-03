
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
const windowStateManager = require('electron-window-state');

// Keep a global reference of the window object
var windows = new Set();
let isQuitting = false;
let windowState;

// Allows render process to access active windows
const getWindows = exports.getWindows = () => {
  return windows;
}

const createWindow = exports.createWindow = (file) => {
  var conf = {
      width: windowState.width,
      height: windowState.height,
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
  {label: "&File", submenu: [
    {label: "New", accelerator: "CmdOrCtrl+N", click: () => { createWindow(); }},
    {label: "Open", accelerator: "CmdOrCtrl+O", click: () => { sendShortcut('file-open'); }},
    {type: "separator"},
    {label: "Save", accelerator: "CmdOrCtrl+S", click: () => { sendShortcut('file-save'); }},
    {label: "Save As", accelerator: "CmdOrCtrl+Shift+S", click: () => { sendShortcut('file-saveAs'); }},
    {label: "Export to PDF", click: () => {sendShortcut('file-pdf'); }},
    {type: "separator"},
    {label: "Settings", accelerator: "CmdOrCtrl+,", click: () => { openSettings(); }},
    {type: "separator"},
    {label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => { sendShortcut('ctrl+q'); }}
  ]},
  {label: "&Edit", submenu: [
    {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
    {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
    {type: "separator"},
    {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
    {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
    {label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
    {label: "Select All", accelerator: "CmdOrCtrl+A", role: 'selectall'},
    {type: "separator"},
    {label: "Find", accelerator: "CmdOrCtrl+F", click: () => { sendShortcut('ctrl+f'); }},
    {label: "Replace", accelerator: "CmdOrCtrl+Shift+F", click: () => { sendShortcut('ctrl+shift+f'); }},
    {type: "separator"},
    {label: "Auto-Indent", accelerator: "CmdOrCtrl+Shift+A", click: () => { sendShortcut('ctrl+shift+a'); }},
    {label: "Indent Less", accelerator: "CmdOrCtrl+Left", click: () => { sendShortcut('ctrl+left'); }},
    {label: "Indent More", accelerator: "CmdOrCtrl+Right", click: () => { sendShortcut('ctrl+right'); }},
    {type: "separator"},
    {label: "Toggle Comment", accelerator: "CmdOrCtrl+/", click: () => { sendShortcut('ctrl+/'); }}
  ]},
  {label: "&View", submenu: [
    {label: "Reload", accelerator:"CmdOrCtrl+R", click: () => { sendShortcut('CmdOrCtrl+r'); }},
    {type: "separator"},
    {label: "Themes", submenu: [
      {label: "Monokai", click: () => { includeTheme('monokai'); }},
      {label: "One Dark", click: () => { includeTheme('one-dark'); }},
      {label: "Solarized", click: () => { includeTheme('solarized'); }}
    ]},
    {type: "separator"},
    {label: "Toggle Menu", accelerator:"CmdOrCtrl+M", click: () => { sendShortcut('ctrl+m'); }},
    {label: "Toggle Toolbar", accelerator:"CmdOrCtrl+.", click: () => { sendShortcut('ctrl+.'); }},
    {label: "Toggle Preview", accelerator:"CmdOrCtrl+P", click: () => { sendShortcut("ctrl+p"); }},
    {label: "Toggle Full Screen", accelerator:"F11", click: () => {
      var focusedWindow = BrowserWindow.getFocusedWindow(),
          isFullScreen = focusedWindow.isFullScreen();
      focusedWindow.setFullScreen(!isFullScreen);
    }},
    {type: "separator"},
    {label: 'Toggle Developer Tools',
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
  ]},
  {label: "&Help", submenu: [
    {label: "Documentation", click: () => {
      shell.openExternal(mod.repository.docs);
    }},
    {label: "Keybindings", click: () => {
      shell.openExternal(mod.repository.docs);
    }},
    {label: "Report Issue", click: () => {
      shell.openExternal(mod.bugs.url);
    }},
    {type: "separator"},
    {label: "About Hyde", click: () => {
      dialog.showMessageBox({title: "About Hyde", type:"info", message: "An Electron powered markdown editor for Jekyll users.\nGPL v3.0 Copyright (c) 2017 Brett Stevenson <brettstevenson.me>", buttons: ["Close"] });
    }}
  ]}
];
// const menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);

function sendShortcut(cmd) {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow.webContents.send(cmd);
}

// Regestering local shortcuts for formatting markdown
localShortcut.register('CmdOrCtrl+b', () =>  { sendShortcut('ctrl+b'); });
localShortcut.register('CmdOrCtrl+i',() => { sendShortcut('ctrl+i'); });
localShortcut.register('CmdOrCtrl+-',() => { sendShortcut('ctrl+-'); });
localShortcut.register('CmdOrCtrl+/', () => { sendShortcut('ctrl+/'); });
localShortcut.register('CmdOrCtrl+l', () => { sendShortcut('ctrl+l'); });
localShortcut.register('CmdOrCtrl+f', () => { sendShortcut('ctrl+f'); });
localShortcut.register('CmdOrCtrl+Shift+f', () => { sendShortcut('ctrl+shift+f'); });
localShortcut.register('CmdOrCtrl+h', () => { sendShortcut('ctrl+h'); });
localShortcut.register('CmdOrCtrl+Alt+i', () => { sendShortcut('ctrl+alt+i'); });
localShortcut.register('CmdOrCtrl+Shift+t', () => { sendShortcut('ctrl+shift+t'); });
localShortcut.register('CmdOrCtrl+Shift+-', () => { sendShortcut('ctrl+shift+-'); });
localShortcut.register('CmdOrCtrl+r', () => { sendShortcut('ctrl+r'); });
localShortcut.register('CmdOrCtrl+m', () => { sendShortcut('ctrl+m'); });
localShortcut.register('CmdOrCtrl+.', () => { sendShortcut('ctrl+.'); });
localShortcut.register('CmdOrCtrl+p', () => { sendShortcut('ctrl+p'); });
localShortcut.register('CmdOrCtrl+,', () => { sendShortcut('ctrl+,'); });
localShortcut.register('CmdOrCtrl+up', () => { sendShortcut('ctrl+up'); });
localShortcut.register('CmdOrCtrl+left', () => { sendShortcut('ctrl+left'); });
localShortcut.register('CmdOrCtrl+right', () => { sendShortcut('ctrl+right'); });
localShortcut.register('CmdOrCtrl+down', () => { sendShortcut('ctrl+down'); });


// This method will be called when Electron has finished initialization
app.on('ready', function() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  windowState = windowStateManager({
    defaultWidth: settings.get('windowWidth'),
    defaultHeight: settings.get('windowHeight')
  });

  var conf = {
      width: windowState.width,
      height: windowState.height,
      x: windowState.x,
      y: windowState.y,
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
  windowState.manage(mainWindow);
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  windows.add(mainWindow);
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

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
    windowState.saveState(mainWindow)
    isQuitting = true;
  });
});
