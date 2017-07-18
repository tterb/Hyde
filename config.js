'use strict';
const Config = require('electron-config');

module.exports = new Config ({
  defaults: {
    showMenu: false,
    showToolbar: false,
    livePreview: true,
    syncScroll: true,
    isFullscreen: false,
    keepInTray: false,
    editorTheme: 'one-dark',
    editorFont: 'monospaced',
    editorFontSize: 9.5,
    editorLineHeight: 1.5,
    tabSize: 2,
    lineNumbers: false,
    lineWrapping: true,
    previewMode: 'markdown',
    previewFont: 'sans-serif',
    previewFontSize: 10,
    previewLineHeight: 1.45,
    previewFrontMatter: false,
    autoCloseBrackets: true
  }
});
