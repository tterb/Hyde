/*
* The MIT License (MIT)
* Copyright (c) 2017 Brett Stevenson <bstevensondev@gmail.com>
*/

const electron = require('electron');
var showdown  = require('showdown');
var remote = electron.remote;
var ipc = electron.ipcRenderer;
var dialog = electron.remote.dialog;
var fs = remote.require('fs');
const storage = require('electron-json-storage');
var console = require('console');
var parsePath = require("parse-filepath");
const config = require('./config');
const settings = require('electron-settings');
const setter = require('./js/settings');
const func = require('./js/functions');
const CMSpellChecker = require('codemirror-spell-checker');
var os = require("os");

var isFileLoadedInitially = false,
    currentTheme = settings.get('editorTheme'),
    currentFile = '';

// `remote.require` since `Menu` is a main-process module.
var buildEditorContextMenu = remote.require('electron-editor-context-menu');

window.addEventListener('contextmenu', function(e) {
  // Only show the context menu in text editors.
  if (!e.target.closest('textarea, input, [contenteditable="true"],section')) return;

  var menu = buildEditorContextMenu();
  // The 'contextmenu' event is emitted after 'selectionchange' has fired but possibly before the
  // visible selection has changed. Try to wait to show the menu until after that, otherwise the
  // visible selection will update after the menu dismisses and look weird.
  setTimeout(function() {
    menu.popup(remote.getCurrentWindow());
  }, 30);
});

getUserSettings();

var conf = {
    mode: "yaml-frontmatter",
    base: "gfm",
    viewportMargin: 100000000000,
    lineNumbers: settings.get('lineNumbers'),
    lineWrapping: settings.get('lineWrapping'),
    showTrailingSpace: settings.get('showTrailingSpace'),
    autoCloseBrackets: settings.get('matchBrackets'),
    autoCloseTags: settings.get('matchBrackets'),
    extraKeys: {
      Enter: 'newlineAndIndentContinueMarkdownList'
    }
}

var files = fs.readdirSync('./css/theme'),
    theme = settings.get('editorTheme');
if (files.includes(theme+'.css')) {
  conf.theme = theme;
} else {
  conf.theme = "one-dark";
}
includeTheme(theme);

if(settings.get('enableSpellCheck')) {
    conf.mode = "spell-checker";
    conf.backdrop = "yaml-frontmatter";
    CMSpellChecker({ codeMirrorInstance: CodeMirror });
}

var cm = CodeMirror.fromTextArea(document.getElementById("plainText"), conf);

function includeTheme(theme) {
  var head = document.getElementsByTagName('head')[0];
  settings.set('editorTheme', theme);
  var editorColor = $('.cm-s-'+theme+'.CodeMirror').css('background-color');
  var themeTag;
  currentTheme = theme;
  if(document.getElementById('themeLink')) {
    themeTag = document.getElementById('themeLink');
    themeTag.setAttribute('href', 'css/theme/'+theme+'.css');
    head.appendChild(themeTag);
    remote.getCurrentWindow().reload();
  } else {
    themeTag = document.createElement('link');
    themeTag.setAttribute('id', 'themeLink');
    themeTag.setAttribute('rel', 'stylesheet');
    themeTag.setAttribute('href', 'css/theme/'+theme+'.css');
    head.appendChild(themeTag);
  }
  settings.set('editorTheme', theme);
}

window.onload = function() {
  var plainText = document.getElementById('plainText'),
      markdownArea = document.getElementById('markdown');

  if(os.type === 'linux') {
      $('.CodeMirror').css('font-size', '1em');
  }

  cm.on('change',function(cMirror) {
    countWords();
    // get value right from instance
    var markdownText = cMirror.getValue();
    // Remove the YAML frontmatter from live-preview
    if(!settings.get('previewFrontMatter'))
      markdownText = removeFrontMatter(markdownText);
    // Convert emoji's
    markdownText = replaceWithEmojis(markdownText);
    //Markdown -> Preview
    html = marked(markdownText,{gfm: true});
    markdownArea.innerHTML = html;
    //Markdown -> HTML
    converter = new showdown.Converter();
    html = converter.makeHtml(markdownText);
    document.getElementById("htmlPreview").value = html;
    if(this.isFileLoadedInitially) {
      this.setClean();
      this.isFileLoadedInitially = false;
    }
    if(this.currentFile !== '') {
      this.updateWindowTitle(this.currentFile);
    } else {
      this.updateWindowTitle();
    }
  });

  // Get the most recently saved file
  storage.get('markdown-savefile', function(error, data) {
    if (error) throw error;
    if ('filename' in data) {
      fs.readFile(data.filename, 'utf-8', function (err, data) {
         if(err){
             alert("An error ocurred while opening the file "+ err.message)
         }
         cm.getDoc().setValue(data);
         cm.getDoc().clearHistory();
      });
      this.isFileLoadedInitially = true;
      this.currentFile = data.filename;
    }
  });


  document.getElementById("minimize").onclick = function() { remote.BrowserWindow.getFocusedWindow().minimize(); }
  document.getElementById("close").onclick = function() { closeWindow(window); }

  document.getElementById("unsavedConfirm").onclick = function() { saveFile(); }
  document.getElementById("unsavedDeny").onclick = function() {
  remote.BrowserWindow.getFocusedWindow().close();
  }

  $('.dropdown-submenu').mouseover(function() {
    $(this).children('ul').show();
  }).mouseout(function() {
    $(this).children('ul').hide();
  });
}



/**************************
  * Synchronized scrolling *
  **************************/

 var $prev = $('#previewPanel'),
     $markdown = $('#markdown'),
     $syncScroll = $('#syncScroll'),
     isSynced = settings.get('syncScroll');

 // Retaining state in boolean since this will be more CPU friendly instead of constantly selecting on each event.
 var toggleSyncScroll = () => {
    if(settings.get('syncScroll')) {
      $syncScroll.attr('class', 'fa fa-unlink');
      isSynced = false;
      $(window).trigger('resize');
    } else {
      $syncScroll.attr('class', 'fa fa-link');
      isSynced = true;
      $(window).trigger('resize');
   }
   settings.set('syncScroll', isSynced);
 }
 $syncScroll.on('change', toggleSyncScroll());

 /**
  * Scrollable height.
  */
 var codeScrollable = () => {
   var info = cm.getScrollInfo();
   return info.height - info.clientHeight;
 }

 var prevScrollable = () => {
   return $markdown.height() - $prev.height();
 }

 /**
  * Temporarily swaps out a scroll handler.
  */
 var muteScroll = (obj, listener) => {
   obj.off('scroll', listener);
   obj.on('scroll', tempHandler);

   var tempHandler = () => {
     obj.off('scroll', tempHandler);
     obj.on('scroll', listener);
   }
 }

 /**
  * Scroll Event Listeners
  */
 var codeScroll = () => {
   var scrollable = codeScrollable();
   if (scrollable > 0 && isSynced) {
     var percent = cm.getScrollInfo().top / scrollable;

     // Since we'll be triggering scroll events.
     muteScroll($prev, prevScroll);
     $prev.scrollTop(percent * prevScrollable());
   }
 }
 cm.on('scroll', codeScroll);
 $(window).on('resize', codeScroll);
 $(window).on('resize', function() {
    settings.set('windowWidth', parseInt($(window).width(),10));
    settings.set('windowHeight', parseInt($(window).height(),10));
 });

 var prevScroll = () => {
     var scrollable = prevScrollable();
     if (scrollable > 0 && isSynced) {
       var percent = $(this).scrollTop() / scrollable;

       // Since we'll be triggering scroll events.
       muteScroll(cm, codeScroll);
       cm.scrollTo(percent * codeScrollable());
     }
 }
 $prev.on('scroll', prevScroll);


const BrowserWindow = remote.BrowserWindow;
var path = require('path'),
    appPath = path.resolve(__dirname);
let newWindow;

function newFile() {
    var conf = {
      width: 1000,
      height: 600,
      show: true,
      frame: false,
      autoHideMenuBar: true
  }
  if (process.platform === 'darwin') {
    conf.titleBarStyle = 'hidden';
    conf.icon = path.join(__dirname, '/img/icon/icon.icns')
  } else {
    conf.icon = path.join(__dirname, '/img/icon/icon.ico');
  }
  // openSettings();
  newWindow = new BrowserWindow(conf);
  newWindow.loadURL(path.join('file://', __dirname, '/index.html'));
  newWindow.webContents.on('close', () => {
    newWindow = undefined;
  });
}

function newFiles() {
  // if(!this.isClean()) {
  //   showUnsavedDialog(window);
  // }
  fileEntry = null;
  hasWriteAccess = false;
  cm.setValue("");
}

function setFile(theFileEntry, isWritable) {
  fileEntry = theFileEntry;
  hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
  fs.readFile(theFileEntry.toString(), function (err, data) {
    if (err) {
      console.log("Read failed: " + err);
    }
    cm.setValue(String(data));
    cm.getDoc().clearHistory()
  });
}

function writeEditorToFile(theFileEntry) {
  var str = cm.getValue();
  fs.writeFile(theFileEntry, cm.getValue(), function (err) {
    if (err) {
      console.log("Write failed: " + err);
      return;
    }
    console.log("Write completed.");
  });
}

function handleNewButton() {
  if (false) {
    newFiles();
    this.cm.setValue("");
    console.log(cm.getValue().toString())
  } else {
    window.open(path.join('file://', __dirname, '/index.html'));
  }
  return cm.getValue().toString();
}


/****************
 ** Word Count **
*****************/
function countWords() {
    var wordcount = cm.getValue().split(/\b[\s,\.-:;]*/).length;
    document.getElementById("wordcount").innerHTML = "words: " + wordcount.toString();
    return cm.getValue().split(/\b[\s,\.-:;]*/).length;
}

document.getElementById("plainText").addEventListener("keypress", countWords)
