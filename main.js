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
const mod = require('./package.json');
const settings = require('./config');
const tray = require('./tray');
const menuTemplate = require('./js/menu');
const keepInTray = settings.get('keepInTray');
const fs = require('fs');
const path = require('path');
const window = require('electron-window');
const localShortcut = require('electron-localshortcut');
const windowStateManager = require('electron-window-state');
const packageJSON = require(__dirname + '/package.json');
const mainPage = (`file://${__dirname}/index.html`);
const version = app.getVersion();
const args = require('yargs')
    .usage('Hyde v'+version+'\n\n Usage: hyde [options] <filename>\n\n If a filename isn\'t specified, the application will open with the most recently opened file. Additionally, if the specified file doesn\'t exist, a new file with the given filename will be created at the specified path.')
    .option('d', {
      alias: 'dev',
      describe: 'Open in development mode',
      type: 'boolean'
    })
    .alias('v', 'version')
    .version('v'+version)
    .help('h')
    .alias('h', 'help')
    .wrap(60)
    .argv;

// console.log('args.d: '+args.d+'\nargs.dev: '+args.dev);
// Keep a global reference of the window objects
var windows = new Set();
let isQuitting = false;
let windowState, mainWindow;

// Allows render process to access active windows
const getWindows = exports.getWindows = () => windows;
const lshortcuts = exports.lshortcuts = () => localShortcut;

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
  let argFile = { file: readFile };
  windows.add(newWindow);
  newWindow.showUrl(path.join(__dirname, 'index.html'), argFile);
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
  newWindow.webContents.on('will-navigate', (e, url) => {
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
ipc.on('export-to-html', (event, data, htmlPath) => {
	fs.writeFile(htmlPath, data, function(err) {
		if(err) notify('An error ocurred while creating \''+filename+'\' '+err.message, 'error');
	});
  event.sender.send('wrote-html', htmlPath);
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
  var themes = [],
      themeFiles = fs.readdirSync(path.join(__dirname, '/css/theme'));
  getThemes().forEach((str) => {
    var theme = { label: str.name, click: () => {
      var focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow.webContents.send("set-theme", str.value.toString()); }};
    themes.push(theme);
  });
  return themes;
}

var template = menuTemplate();
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

// Register local keyboard shortcuts
// var shortcuts = registerShortcuts();
localShortcut.register('CmdOrCtrl+Shift+a', () => { sendShortcut('auto-indent'); });
localShortcut.register('CmdOrCtrl+b', () => { sendShortcut('insert-bold'); });
localShortcut.register('CmdOrCtrl+d', () => { sendShortcut('select-word'); });
localShortcut.register('CmdOrCtrl+e', () => { sendShortcut('insert-emoji'); });
localShortcut.register('CmdOrCtrl+f', () => { sendShortcut('search-find'); });
localShortcut.register('CmdOrCtrl+Shift+f', () => { sendShortcut('search-replace'); });
localShortcut.register('CmdOrCtrl+h', () => { sendShortcut('insert-heading'); });
localShortcut.register('CmdOrCtrl+i', () => { sendShortcut('insert-italic'); });
localShortcut.register('CmdOrCtrl+k', () => { sendShortcut('insert-image'); });
localShortcut.register('CmdOrCtrl+l', () => { sendShortcut('insert-link'); });
localShortcut.register('CmdOrCtrl+m', () => { sendShortcut('toggle-menu'); });
localShortcut.register('CmdOrCtrl+n', () => { sendShortcut('file-new'); });
localShortcut.register('CmdOrCtrl+o', () => { sendShortcut('file-open'); });
localShortcut.register('CmdOrCtrl+Shift+p', () => { sendShortcut('toggle-palette'); });
localShortcut.register('CmdOrCtrl+r', () => { sendShortcut('win-reload'); });
localShortcut.register('CmdOrCtrl+s', () => { sendShortcut('file-save'); });
localShortcut.register('CmdOrCtrl+t', () => { sendShortcut('table-modal'); });
localShortcut.register('CmdOrCtrl+-', () => { sendShortcut('insert-strikethrough'); });
localShortcut.register('CmdOrCtrl+Shift+-', () => { sendShortcut('insert-hr'); });
localShortcut.register('CmdOrCtrl+/', () => { sendShortcut('insert-comment'); });
localShortcut.register('CmdOrCtrl+;', () => { sendShortcut('insert-code'); });
localShortcut.register("CmdOrCtrl+'", () => { sendShortcut("insert-quote"); });
localShortcut.register('CmdOrCtrl+.', () => { sendShortcut('toggle-toolbar'); });
localShortcut.register('CmdOrCtrl+p', () => { sendShortcut('toggle-preview'); });
localShortcut.register('CmdOrCtrl+s', () => { sendShortcut('file-save'); });
localShortcut.register('CmdOrCtrl+,', () => { sendShortcut('toggle-settings'); });
localShortcut.register('CmdOrCtrl+Shift+/', () => { sendShortcut('markdown-modal'); });
localShortcut.register('CmdOrCtrl+up', () => { sendShortcut('page-up'); });
localShortcut.register('CmdOrCtrl+down', () => { sendShortcut('page-down'); });
localShortcut.register('CmdOrCtrl+left', () => { sendShortcut('indent-less'); });
localShortcut.register('CmdOrCtrl+right', () => { sendShortcut('indent-more'); });

// Called after initialization
app.on('ready', function() {
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
  let argFile = { file: readFile };
  mainWindow.showUrl(path.join(__dirname, 'index.html'), argFile);
  // mainWindow.showUrl(path.join(__dirname, 'index.html'));
  windowState.manage(mainWindow);
  windows.add(mainWindow);
  tray.create(mainWindow);
  // Show Dev Tools
  if(args.dev) {
    require('devtron').install();
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('did-finish-load', () => {
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

  // Listen for crashes
  mainWindow.webContents.on('crashed', (err) => {
    console.error(err);
  });
});

// Listen for uncaughtExceptions
process.on('uncaughtException', (err) => {
  console.error(err)
});

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
