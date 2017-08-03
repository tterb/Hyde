'use strict';
const Config = require('electron-config');

module.exports = new Config ({
  defaults: {
    // UI Elements
    windowWidth: 1000,
    windowHeight: 600,
    showMenu: false,
    showToolbar: false,
    showPreview: true,
    syncScroll: true,
    isFullscreen: false,
    // Editor
    editorTheme: 'one-dark',
    editorFont: 'monospaced',
    editorFontSize: 9.5,
    editorLineHeight: 1.5,
    dynamicFontSize: false,
    tabSize: 2,
    lineNumbers: false,
    lineWrapping: true,
    showTrailingSpace: true,
    matchBrackets: true,
    enableSpellCheck: false,
    // Preview
    previewMode: 'markdown',
    previewFont: 'sans-serif',
    previewFontSize: 10,
    previewLineHeight: 1.45,
    previewFrontMatter: false,
    // Other
    keepInTray: false
  }
});
