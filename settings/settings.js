
const func = require('../js/functions');
// const appFunc = require('../js/app');
const ipc = require('electron').ipcRenderer;
require('electron-settings');
let settings;
ipc.on('settingsObj', (event, settingsObj) => {
    settings = settingsObj;
})

// if(settings === undefined) {
//     window.close();
// }

/* General */
var showMenu = document.getElementById('show-menu');
showMenu.value = settings.get('showMenu');
showMenu.addEventListener('change', function(){settings.set('showMenu', Boolean(showMenu.value));});

var showToolbar = document.getElementById('show-toolbar');
showToolbar.value = settings.get('showToolbar');
showToolbar.addEventListener('change', function(){settings.set('showToolbar', Boolean(showToolbar.value));});

var livePreview = document.getElementById('live-preview');
livePreview.value = settings.get('livePreview');
livePreview.addEventListener('change', function(){settings.set('livePreview', Boolean(livePreview.value));});

var scrollMode = document.getElementById('scroll-mode');
scrollMode.value = settings.get('scrollMode');
scrollMode.addEventListener('change', function(){settings.set('scrollMode', scrollMode.value);});

/* Editor */
var editorTheme = document.getElementById('editor-theme');
editorTheme.value = settings.get('editorTheme');
editorTheme.addEventListener('change', function() {
    settings.set('editorTheme', editorTheme.value);
    includeTheme(theme);
});

var editorFont = document.getElementById('editor-font');
editorFont.value = settings.get('editorFont');
editorFont.addEventListener('change', function(){settings.set('editorFont', editorFont.value);});

var editorFontSize = document.getElementById('editor-font-size');
editorFontSize.value = settings.get('editorFontSize');
editorFontSize.addEventListener('change', function(){settings.set('editorFontSize', editorFontSize.value);});

var editorLineHeight = document.getElementById('editor-line-height');
editorLineHeight.value = settings.get('editorLineHeight');
editorLineHeight.addEventListener('change', function(){settings.set('editorLineHeight', editorLineHeight.value);});

var editorTabSize = document.getElementById('editor-tab-size');
editorTabSize.value = settings.get('editorTabSize');
editorTabSize.addEventListener('change', function(){settings.set('editorTabSize', editorTabSize.value);});

var editorLineNums = document.getElementById('editor-line-numbers');
editorLineNums.value = settings.get('editorLineNums');
editorLineNums.addEventListener('change', function(){settings.set('editorLineNums', Boolean(editorLineNums.value));});

var editorLineWrap = document.getElementById('editor-line-wrap');
editorLineWrap.value = settings.get('editorLineWrap');
editorLineWrap.addEventListener('change', function(){settings.set('editorLineWrap', Boolean(editorLineWrap.value));});

/* Preview */
var prevMode = document.getElementById('preview-mode');
prevMode.addEventListener('change', function(){settings.set('prevMode', prevMode.value);});

var prevFont = document.getElementById('preview-font');
prevFont.addEventListener('change', function(){settings.set('prevFont', prevFont.value);});

var prevFontSize = document.getElementById('preview-font-size');
prevFontSize.addEventListener('change', function(){settings.set('prevFontSize', prevFontSize.value);});

var prevLineHeight = document.getElementById('preview-line-height');
prevLineHeight.addEventListener('change', function(){settings.set('prevLineHeight', prevLineHeight.value);});
