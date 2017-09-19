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
//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents');
if (setupEvents.handleSquirrelEvent()) { return; }
const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const shell = electron.shell;
const BrowserWindow = electron.BrowserWindow;
const {Menu, MenuItem} = require('electron');
const tray = require('./tray');
const func = require('./js/functions');
const mod = require('./package.json');
const settings = require('./config');
const keepInTray = settings.get('keepInTray');
const fs = require('fs');
const path = require('path');
const window = require('electron-window');
const localShortcut = require('electron-localshortcut');
const windowStateManager = require('electron-window-state');
const mainPage = (`file://${__dirname}/index.html`);
const yargs = require('yargs')
const args = yargs(process.argv)
    .alias('d', 'dev')
    .argv

// Keep a global reference of the window object
var windows = new Set();
let isQuitting = false;
let windowState, mainWindow;

// Allows render process to access active windows
const getWindows = exports.getWindows = () => {
  return windows;
}

function getConfig() {
  var conf = {
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    darkTheme: true,
    transparent: false
  }
  if (process.platform === 'darwin') {
    conf.titleBarStyle = 'hidden';
    conf.icon = path.join(__dirname, '/img/icon/icns/icon.icns');
  } else if (process.platform === 'win32') {
    conf.icon = path.join(__dirname, '/img/icon/ico/icon.ico');
  } else {
    conf.icon = path.join(__dirname, '/img/icon/png/64x64.png');
  }
  return conf;
}

// Check for file from commandline
var readFile = null;
process.argv.forEach(function(val, index, array) {
  if (index >= 2 && val.includes('.md')) {
    readFile = val;
  }
});

const createWindow = exports.createWindow = (file) => {
  let newWindow = window.createWindow(getConfig());
  let args = { file: readFile };
  windows.add(newWindow);
  newWindow.showUrl(path.join(__dirname, 'index.html'), args);
  // newWindow.showUrl(mainPage);
  newWindow.once('ready-to-show', () => { newWindow.show(); });
  // Open the DevTools.
  if (args.dev) { newWindow.webContents.openDevTools(); }
  // Emitted when the window is closed.
  newWindow.on('closed', () => {
    windows.delete(newWindow);
    newWindow = null;
  });

  // Open anchor links in browser
  newWindow.webContents.on('will-navigate', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
  tray.create(newWindow);
  return newWindow;
}

ipc.on('export-to-pdf', (event, pdfPath) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.printToPDF({ pageSize: 'A4' }, (error, data) => {
    if (error) throw error;
    fs.writeFile(pdfPath, data, (error) => {
      if (error) throw error;
      shell.openExternal('file://' + pdfPath);
      event.sender.send('wrote-pdf', pdfPath);
    });
  });
});

const getThemes = exports.getThemes = () => {
  var themes = [
    {'name': 'Base16 Dark', 'value': 'base16-dark'},
    {'name': 'Base16 Light', 'value': 'base16-light'},
    {'name': 'Dracula', 'value': 'dracula'},
    {'name': 'Duotone Dark', 'value': 'duotone-dark'},
    {'name': 'Eclipse', 'value': 'eclipse'},
    {'name': 'Hopscotch', 'value': 'hopscotch'},
    {'name': 'Itg Flat', 'value': 'itg-flat'},
    {'name': 'Material', 'value': 'material'},
    {'name': 'Monokai', 'value': 'monokai'},
    {'name': 'Neo', 'value': 'neo'},
    {'name': 'Oceanic', 'value': 'oceanic'},
    {'name': 'One Dark', 'value': 'one-dark'},
    {'name': 'Panda', 'value': 'panda'},
    {'name': 'Railscasts', 'value': 'railscasts'},
    {'name': 'Seti', 'value': 'seti'},
    {'name': 'Solarized Dark', 'value': 'solarized-dark'},
    {'name': 'Solarized Light', 'value': 'solarized-light'},
    {'name': 'Tomorrow Night', 'value': 'tomorrow-night'},
    {'name': 'Yeti', 'value': 'yeti'},
    {'name': 'Zenburn', 'value': 'zenburn'}
  ];
  return themes;
}

function menuThemes() {
  var themeFiles = fs.readdirSync(path.join(__dirname, '/css/theme')),
    themes = [];
  getThemes().forEach((str) => {
    var theme = { label: str.name, click: () => {
      var focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow.webContents.send("set-theme", str.value.toString()); }};
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
    {label: "Save As", accelerator: "CmdOrCtrl+Shift+S", click: () => { sendShortcut('file-save-as'); }},
    {label: "Export to PDF", click: () => { sendShortcut('file-pdf'); }},
    {type: "separator"},
    {label: "Show in File Manager", click: () => { ipc.send('open-file-manager'); }},
    {type: "separator"},
    {label: "Settings", accelerator: "CmdOrCtrl+,", click: () => { sendShortcut('ctrl+,'); }},
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
    {label: "Select All", accelerator: "CmdOrCtrl+A", click: () => { sendShortcut('ctrl+a'); }},
    {type: "separator"},
    {label: "Find", accelerator: "CmdOrCtrl+F", click: () => { sendShortcut('ctrl+f'); }},
    {label: "Replace", accelerator: "CmdOrCtrl+Shift+F", click: () => { sendShortcut('ctrl+shift+f'); }},
    {type: "separator"},
    {label: "Auto-Indent", accelerator: "CmdOrCtrl+Shift+A", click: () => { sendShortcut('ctrl+shift+a'); }},
    {label: "Indent Less", accelerator: "CmdOrCtrl+Left", click: () => { sendShortcut('ctrl+left'); }},
    {label: "Indent More", accelerator: "CmdOrCtrl+Right", click: () => { sendShortcut('ctrl+right'); }},
    {type: "separator"},
    {label: "Toggle Comment", accelerator: "CmdOrCtrl+/", click: () => { sendShortcut('ctrl+/'); }},
    {type: "separator"},
    {label: "Insert YAML-frontmatter", accelerator: "CmdOrCtrl+Shift+Y", click: () => { sendShortcut('insert-yaml'); }}
  ]},
  {label: "&View", submenu: [
    {label: "Reload", accelerator:"CmdOrCtrl+R", click: () => { sendShortcut('ctrl+r'); }},
    {type: "separator"},
    {label: "Toggle Menu", accelerator:"CmdOrCtrl+M", click: () => { sendShortcut('ctrl+m'); }},
    {label: "Toggle Toolbar", accelerator:"CmdOrCtrl+.", click: () => { sendShortcut('ctrl+.'); }},
    {label: "Toggle Preview", accelerator:"CmdOrCtrl+P", click: () => { sendShortcut("ctrl+p"); }},
    {label: "Toggle Full Screen", accelerator:"F11", click: () => { sendShortcut("mazimize"); }},
    {type: "separator"},
    {label: "Themes" },
    {type: "separator"},
    {label: "Preview Mode", submenu: [
      {label: "Markdown", click: () => { sendShortcut('markdown-preview'); }},
      {label: "HTML", click: () => { sendShortcut('html-preview'); }}
    ]},
    {type: "separator"},
    {role: 'toggledevtools'}
  ]},
  {label: "&Window", submenu: [
    {label: "Minimize", click: () => {
      BrowserWindow.getFocusedWindow().minimize();
    }},
    {label: "Zoom", click: () => {
      toggleMaximize();
    }},
    {type: "separator"},
    {label: "Bring to Front", click: () => {
      windows[0].show();
    }}
  ]},
  {label: "&Help", role: 'help', submenu: [
    {label: "Markdown Help", click: () => {
      sendShortcut('markdown-modal');
    }},
    {type: "separator"},
    {label: "Documentation", click: () => {
      shell.openExternal('https://JonSn0w.github.io/Hyde/documentation');
    }},
    {label: "Keybindings", click: () => {
      shell.openExternal('https://JonSn0w.github.io/Hyde/documentation#keybindings');
    }},
    {label: "Report Issue", click: () => {
      shell.openExternal('https://github.com/JonSn0w/Hyde/issues/new');
    }},
    {type: 'separator'},
    {label: "About Hyde", click: () => {
      sendShortcut('about-modal');
    }}
  ]}
];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {role: 'about', click: () => {
        sendShortcut('about-modal');
      }},
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
  template[1].submenu[7] = {label: "Show in Finder", click: () => { sendShortcut('open-file-manager'); }};
  template[3].submenu.splice(2,1);
  // Add syntax-themes to menu
  template[3].submenu[6].submenu = menuThemes();
  // Window menu
  template[4].submenu = [
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
} else {
  template[0].submenu[7] = {label: "Show in Explorer", click: () => { sendShortcut('open-file-manager'); }};
  template[2].submenu[7].submenu = menuThemes();
}

function sendShortcut(cmd) {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow.webContents.send(cmd);
}

// Register local keyboard shortcuts for formatting Markdown
localShortcut.register('CmdOrCtrl+Shift+a', () => { sendShortcut('ctrl+shift+a'); });
localShortcut.register('CmdOrCtrl+b', () => { sendShortcut('ctrl+b'); });
localShortcut.register('CmdOrCtrl+d', () => { sendShortcut('ctrl+d'); });
localShortcut.register('CmdOrCtrl+e', () => { sendShortcut('ctrl+e'); });
localShortcut.register('CmdOrCtrl+i', () => { sendShortcut('ctrl+i'); });
localShortcut.register('CmdOrCtrl+-', () => { sendShortcut('ctrl+-'); });
localShortcut.register('CmdOrCtrl+Shift+-', () => { sendShortcut('ctrl+shift+-'); });
localShortcut.register('CmdOrCtrl+/', () => { sendShortcut('ctrl+/'); });
localShortcut.register('CmdOrCtrl+l', () => { sendShortcut('ctrl+l'); });
localShortcut.register('CmdOrCtrl+f', () => { sendShortcut('ctrl+f'); });
localShortcut.register('CmdOrCtrl+Shift+f', () => { sendShortcut('ctrl+shift+f'); });
localShortcut.register('CmdOrCtrl+h', () => { sendShortcut('ctrl+h'); });
localShortcut.register('CmdOrCtrl+k', () => { sendShortcut('ctrl+k'); });
localShortcut.register('CmdOrCtrl+t', () => { sendShortcut('table-modal'); });
localShortcut.register('CmdOrCtrl+r', () => { sendShortcut('ctrl+r'); });
localShortcut.register('CmdOrCtrl+m', () => { sendShortcut('ctrl+m'); });
localShortcut.register('CmdOrCtrl+;', () => { sendShortcut('ctrl+;'); });
localShortcut.register("CmdOrCtrl+'", () => { sendShortcut("ctrl+'"); });
localShortcut.register('CmdOrCtrl+.', () => { sendShortcut('ctrl+.'); });
localShortcut.register('CmdOrCtrl+p', () => { sendShortcut('ctrl+p'); });
localShortcut.register('CmdOrCtrl+,', () => { sendShortcut('ctrl+,'); });
localShortcut.register('CmdOrCtrl+Shift+/', () => { sendShortcut('markdown-modal'); });
localShortcut.register('CmdOrCtrl+up', () => { sendShortcut('ctrl+up'); });
localShortcut.register('CmdOrCtrl+left', () => { sendShortcut('ctrl+left'); });
localShortcut.register('CmdOrCtrl+right', () => { sendShortcut('ctrl+right'); });
localShortcut.register('CmdOrCtrl+down', () => { sendShortcut('ctrl+down'); });

// Called when Electron has finished initialization
app.on('ready', function() {
  require('devtron').install();
  // Create native application menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  // Initialize windowStateManager
  windowState = windowStateManager({
    defaultWidth: settings.get('windowWidth'),
    defaultHeight: settings.get('windowHeight')
  });
  // Create main BrowserWindow
  mainWindow = window.createWindow(getConfig());
  let args = { file: readFile };
  mainWindow.showUrl(path.join(__dirname, 'index.html'), args);
  // mainWindow.showUrl(path.join(__dirname, 'index.html'));
  windowState.manage(mainWindow);
  windows.add(mainWindow);
  // Show Dev Tools
  if(args.dev) { mainWindow.webContents.openDevTools(); }
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  if(keepInTray) {
    mainWindow.on('close', e => {
      if (!isQuitting) {
        e.preventDefault();
        if(process.platform === 'darwin') {
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
    // On OSX it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd+Q
    if(process.platform !== 'darwin') {
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
    // Store current window state
    windowState.saveState(mainWindow)
    isQuitting = true;
  });

  mainWindow.on('unresponsive', (err) => {
    console.error(err);
  });

  //Listen for crashes
  mainWindow.webContents.on('crashed', (err) => {
    console.error(err);
  });
});

// Listen for uncaughtExceptions
process.on('uncaughtException', (err) => {
  console.error(er)
});

let rightClickPos = null;
const contextMenu = new Menu();
contextMenu.append(new MenuItem({ role: 'undo' }))
contextMenu.append(new MenuItem({ role: 'redo' }))
contextMenu.append(new MenuItem({ type: 'separator' }))
contextMenu.append(new MenuItem({ label: "Cut", role: "cut" }))
contextMenu.append(new MenuItem({ label: "Copy", role: "copy" }))
contextMenu.append(new MenuItem({ label: "Paste", role: "paste" }))
contextMenu.append(new MenuItem({ label: "Select All", click: () => { sendShortcut('ctrl+a'); } }))
contextMenu.append(new MenuItem({ type: 'separator' }))
contextMenu.append(new MenuItem({ label: 'Show in File Manager', click: () => { sendShortcut('open-file-manager'); } }))
contextMenu.append(new MenuItem({ type: 'separator' }))
contextMenu.append(new MenuItem({ label: 'Inspect Element', click: () => { mainWindow.inspectElement(rightClickPos.x, rightClickPos.y); }}))


app.on('browser-window-created', function(event, win) {
  win.webContents.on('context-menu', function(e, params) {
    rightClickPos = { x: params.x, y: params.y };
    contextMenu.popup(win, params.x, params.y);
  });
});

ipc.on('show-context-menu', function(event) {
  const win = BrowserWindow.fromWebContents(event.sender);
  contextMenu.popup(win);
});

const appVersion = exports.appVersion = () => {
  return app.getVersion();
}

const Tray = electron.Tray
let appIcon = null

ipc.on('put-in-tray', function (event) {
  const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Remove',
    click: function () {
      event.sender.send('tray-removed')
    }
  }])
  appIcon.setToolTip('Electron Demo in the tray.')
  appIcon.setContextMenu(contextMenu)
})

ipc.on('remove-tray', function () {
  appIcon.destroy()
})

app.on('window-all-closed', function () {
  if (appIcon) appIcon.destroy()
})
