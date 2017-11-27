'use strict';
const Config = require('electron-config');
module.exports = new Config({
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
    editorFontSize: 11.5,
    dynamicEditor: false,
    lineNumbers: false,
    showTrailingSpace: false,
    matchBrackets: true,
    enableSpellCheck: false,
    // Preview
    previewMode: 'markdown',
    previewProfile: 'Default',
    previewFontSize: 14,
    customCSS: false,
    mathRendering: true,
    hideYAMLFrontMatter: true,
    // Other
    showTooltips: true,
    keepInTray: false,
    frontMatterTemplate: ''
  }
});
