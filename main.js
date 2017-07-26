'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
var dialog = require('electron').dialog;
var shell = require('electron').shell;
const tray = require('./tray');
const func = require('./js/functions');
const setter = require('./js/settings');
const mod = require('./package.json');
const config = require('./config');
const keepInTray = config.get('keepInTray');
const fs = require('fs');
const path = require('path');
const mainPage = path.join('file://', __dirname, '/index.html');
var localShortcut = require('electron-localShortcut');
const {Menu, MenuItem, ipcMain} = require('electron');
// const window = require('./js/windowManager');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const windows = [];
let mainWindow;
let isQuitting = false;

function createWindow () {
  var i = windows.length;
  var conf = {
      width: 1000,
      height: 600,
      show: true,
      frame: false,
      autoHideMenuBar: true,
      icon: path.join(__dirname, '/img/favicon.ico')
  }

  if (process.platform === 'darwin') {
    conf.titleBarStyle = 'hidden';
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(conf);

  mainWindow.show();
  // and load the index.html of the app.
  mainWindow.loadURL(mainPage);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  if(keepInTray) {
      mainWindow.on('close', e => {
        if (!isQuitting) {
          e.preventDefault();
          if (process.platform === 'darwin') {
            app.hide();
          } else {
            mainWindow.hide();
          }
        }
      });
  }

  //Open anchor links in browser
  mainWindow.webContents.on('will-navigate', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  function sendShortcut(cmd) {
      var focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow.webContents.send(cmd);
  }

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
        {label: "Search", accelerator: "CmdOrCtrl+F", click: function() { sendShortcut('CmdOrCtrl+f'); }
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
        {
        label: 'Toggle Developer Tools',
        accelerator: function() {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        }(),
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
          dialog.showMessageBox({title: "Keybindings", type:"info", message: "An Electron powered markdown editor for Jekyll users.\nMIT Copyright (c) 2017 Brett Stevenson <brettstevenson.me>", buttons: ["Close"] });
        }},
        {label: "Report Issue", click: function () {
          shell.openExternal(mod.bugs.url);
        }},
        {label: "About Hyde MD", click: function () {
          dialog.showMessageBox({title: "About Hyde MD", type:"info", message: "An Electron powered markdown editor for Jekyll users.\nMIT Copyright (c) 2017 Brett Stevenson <brettstevenson.me>", buttons: ["Close"] });
        }}
      ]
    }
  ];
  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));


  ipcMain.on('export-to-pdf', (event, filePath) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    // Use default printing options
    win.webContents.printToPDF({}, (error, data) => {
      if (error) throw error
      fs.writeFile(filePath, data, (error) => {
        if (error) {
          throw error
        }
      })
    })
  });

  // Regestering local shortcuts for formatting markdown
  var focusedWindow = BrowserWindow.getFocusedWindow();
  localShortcut.register('CmdOrCtrl+b', function() {
      focusedWindow.webContents.send('ctrl+b');
  });

  localShortcut.register('CmdOrCtrl+i', function() {
      focusedWindow.webContents.send('ctrl+i');
  });

  localShortcut.register('CmdOrCtrl+/', function() {
      focusedWindow.webContents.send('ctrl+/');
  });

  localShortcut.register('CmdOrCtrl+l', function() {
      focusedWindow.webContents.send('ctrl+l');
  });

  localShortcut.register('CmdOrCtrl+h', function() {
      focusedWindow.webContents.send('ctrl+h');
  });

  localShortcut.register('CmdOrCtrl+Alt+i', function() {
      focusedWindow.webContents.send('ctrl+alt+i');
  });

  localShortcut.register('CmdOrCtrl+Shift+t', function() {
      focusedWindow.webContents.send('ctrl+shift+t');
  });

  localShortcut.register('CmdOrCtrl+m', function() {
    focusedWindow.webContents.send('ctrl+m');
  });

  localShortcut.register('CmdOrCtrl+.', function() {
    focusedWindow.webContents.send('ctrl+.');
  });

  localShortcut.register('CmdOrCtrl+Shift+M', function() {
    focusedWindow.webContents.send('ctrl+shift+M');
  });

  localShortcut.register('CmdOrCtrl+,', function() {
    focusedWindow.webContents.send('ctrl+,');
  });

  tray.create(mainWindow);
  if(windows.length > 0) {
    focusedWindow.webContents.send('file-new');
  }
  windows[i] = mainWindow;
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', function() {
  isQuitting = true;
});
