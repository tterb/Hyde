'use strict';
const Config = require('electron-config');

module.exports = new Config ({
  defaults: {
    firstLaunch: false,
    showMenu: false,
    showToolbar: false,
    livePreview: true,
    syncScroll: false,
    keepInTray: false,
    editorTheme: 'one-dark',
    editorFont: 'default',
    editorFontSize: 10,
    editorLineHeight: 1.5,
    tabSize: 2,
    lineNumbers: false,
    lineWrapping: true,
    previewMode: 'markdown',
    previewFont: 'default',
    previewFontSize: 10,
    previewLineHeight: 1.45,
    autoCloseBrackets: true
  }
});
