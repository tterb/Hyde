/*
 * HYDE - markdown editor
 * Copyright (c) 2017 Brett Stevenson <bstevensondev@gmail.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
let windowState, mainWindow;

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
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'img/icon/png/64x64.png')
  }

  if (process.platform === 'darwin') {
    conf.titleBarStyle = 'hidden';
    conf.icon = path.join(__dirname, '/img/icon/icns/icon.icns');
  } else if (process.platform === 'win32') {
    conf.icon = path.join(__dirname, '/img/icon/ico/icon.ico');
  } else {
    conf.icon = path.join(__dirname, '/img/icon/png/64x64.png');
  }
  let newWindow = new BrowserWindow(conf);
  windows.add(newWindow)
  newWindow.loadURL(mainPage);
  if(file !== undefined)
    readFileIntoEditor(file);
  newWindow.once('ready-to-show', () => { newWindow.show(); return file; });

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

const getThemes = exports.getThemes = () =>  {
  var themeFiles = fs.readdirSync('./css/theme'),
      themes = [];
  themeFiles.forEach((str) => {
    var theme = { label: str.slice(0,-4), click: () => {str.slice(0,-4)} };
    if(str.indexOf('-') > -1)
      theme.label = theme.label.replace(/-/g , " ");
    theme.label = theme.label.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    themes.push(theme);
  });
  return themes;
}

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
    {label: "Settings", accelerator: "CmdOrCtrl+,", click: () => { toggleSettings(); }},
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
    {label: "Themes", submenu: []},
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
    {role: 'toggledevtools'}
  ]},
  {label: "&Window", submenu: [
    {label: "Minimize", click: () => {
      BrowserWindow.getFocusedWindow().minimize();
    }},
    {label: "Zoom", click: () => {
      toggleFullscreen();
    }},
    {type: "separator"},
    {label: "Bring to Front", click: () => {
      windows[0].show();
    }},
  ]},
  {role: 'help', submenu: [
    {label: "Documentation", click: () => {
      shell.openExternal(mod.repository.docs);
    }},
    {label: "Keybindings", click: () => {
      shell.openExternal(mod.repository.docs);
    }},
    {label: "Report Issue", click: () => {
      shell.openExternal(mod.bugs.url);
    }}
  ]},
];

if (process.platform === 'darwin') {
  template.unshift({
    label: "Hyde",
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Add syntax-themes to menu
  template[3].submenu[3].submenu = getThemes();

  // Window menu
  template[4].submenu = [
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
} else {
  template[2].submenu[2].submenu = getThemes();
}

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
    conf.icon = path.join(__dirname, '/img/icon/icns/icon.icns');
  } else if (process.platform === 'win32') {
    conf.icon = path.join(__dirname, '/img/icon/ico/icon.ico');
  } else {
    conf.icon = path.join(__dirname, '/img/icon/png/64x64.png');
  }

  mainWindow = new BrowserWindow(conf);
  windowState.manage(mainWindow);
  mainWindow.loadURL(mainPage);
  windows.add(mainWindow);
  mainWindow.webContents.openDevTools();

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

  app.on('before-quit', () => {
    windowState.saveState(mainWindow)
    isQuitting = true;
  });
});
