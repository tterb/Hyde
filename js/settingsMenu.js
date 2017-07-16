'use strict';

// const {BrowserWindow, ipcMain} = require('electron');
const electron = require('electron');
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
var path = require('path');
var appPath = path.resolve(__dirname);

let settingsWindow;

function showSettingsWindow() {
    if (typeof settingsWindow !== 'undefined') {
        settingsWindow.close();
        return;
    }
    // const debug = (moeApp.flag.debug | moeApp.config.get('debug')) != 0;
    const conf = {
        icon: appPath + '/img/favicon.ico',
        autoHideMenuBar: true,
        width: 400,
        height: 500,
        resizable: false,
        maximizable: false,
        show: true,
        frame: false
    };
    settings.set('editorTheme', 'one-dark');
    // if (process.platform == 'darwin') conf.titleBarStyle = 'hidden-inset';
    // else conf.frame = false;

    settingsWindow = new BrowserWindow(conf);
    settingsWindow.loadURL('file://' + appPath.slice(0,-3) + '/settings/settings.html');
    settingsWindow.webContents.openDevTools();
    settingsWindow.webContents.on('did-finish-load', () => {
        settingsWindow.webContents.send('settingsObj', settings);
    });
    settingsWindow.webContents.on('close', () => {
        settingsWindow = undefined;
    })
}


// ipcMain.on('show-settings-window', showSettingsWindow);

module.exports = showSettingsWindow;
