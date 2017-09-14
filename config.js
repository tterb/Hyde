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
    isMaximized: false,
    // Editor
    editorTheme: 'one-dark',
    editorFontSize: 9.5,
    dynamicEditor: false,
    tabSize: 2,
    lineNumbers: false,
    showTrailingSpace: true,
    matchBrackets: true,
    enableSpellCheck: false,
    // Preview
    previewMode: 'markdown',
    previewProfile: 'Default',
    previewFontSize: 10,
    previewLineHeight: 1.45,
    customCSS: false,
    hideYAMLFrontMatter: true,
    // Other
    showTooltips: true,
    keepInTray: false,
    frontMatterTemplate: ""
  }
});
