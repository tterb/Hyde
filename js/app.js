/*!
* The MIT License (MIT)
* Copyright (c) 2017 Brett Stevenson <bstevensondev@gmail.com>
 */

var showdown  = require('showdown');
var remote = require('electron').remote;
var ipc = require('electron').ipcRenderer;
var dialog = require('electron').remote.dialog;
var fs = remote.require('fs');
const storage = require('electron-json-storage');
var console = require('console');
var parsePath = require("parse-filepath");
var currentFile = '';
var isFileLoadedInitially = false;
const config = require('./config');

// require('electron-titlebar');
// const titlebar = document.getElementById('electron-titlebar');

// `remote.require` since `Menu` is a main-process module.
var buildEditorContextMenu = remote.require('electron-editor-context-menu');
var currentValue = 0, currentValueTheme = 0;

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

var conf = {
  mode: "gfm",
  viewportMargin: 100000000000,
  lineWrapping : true,
  autoCloseBrackets: true
}
var fs = require('fs');
var files = fs.readdirSync('./css/theme');
var theme = config.get('theme');

if (files.includes(theme+'.css')) {
  conf.theme = theme;
} else {
  conf.theme = "zenburn";
}

if (!config.get('lineNumbers')) {
    conf.lineNumbers = false;
}

var cm = CodeMirror.fromTextArea(document.getElementById("plainText"), conf);


window.onload = function() {
  var plainText = document.getElementById('plainText');
  var markdownArea = document.getElementById('markdown');

  cm.on('change',function(cMirror){
    countWords();
    // get value right from instance
    //yourTextarea.value = cMirror.getValue();
    var markdownText = cMirror.getValue();
    //Md -> Preview
    html = marked(markdownText,{gfm: true});
    markdownArea.innerHTML = replaceWithEmojis(html);
    //Md -> HTML
    converter = new showdown.Converter();
    html      = converter.makeHtml(markdownText);
    document.getElementById("htmlPreview").value = html;
    if(this.isFileLoadedInitially) {
      this.setClean();
      this.isFileLoadedInitially = false;
    }
    if(this.currentFile!='') {
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
      });
      this.isFileLoadedInitially = true;
      this.currentFile = data.filename;
    }
  });

  // const BrowserWindow = remote;
  // const win = BrowserWindow.getFocusedWindow();
  const win = remote.BrowserWindow.getFocusedWindow();

  document.getElementById("minimize").onclick = function() { remote.BrowserWindow.getFocusedWindow().minimize(); }
  document.getElementById("maximize").onclick = function() { win.isMaximized() ? win.unmaximize() : win.maximize(); }
  document.getElementById("close").onclick = function() { window.close(); }

  var syncButton = document.getElementById('syncScroll');
  if(config.get('isSyncScroll') === true) {
    syncButton.className = 'fa fa-link';
    //  $syncScroll.attr('checked', true);
    isSynced = 'one';
  } else {
    syncButton.className = 'fa fa-unlink';
    //  $syncScroll.attr('checked', false);
    isSynced = 'two';
  }
}


/**************************
  * Synchronized scrolling *
  **************************/

 var $prev = $('#previewPanel'),
   $markdown = $('#markdown'),
   $syncScroll = $('#syncScroll'),
   isSynced; // Initialized below.

 // Retaining state in boolean since this will be more CPU friendly instead of constantly selecting on each event.
 var toggleSyncScroll = () => {
    console.log('Toggle scroll synchronization.');
    isSynced = document.getElementById('syncScroll').className.includes('fa-link');

    // config.set('isSyncScroll', isSynced);
    if(isSynced === true) {
      document.getElementById('syncScroll').className = 'fa fa-unlink';
      isSynced = false;
      $(window).trigger('resize')
      // $syncScroll.attr('checked', true);
    } else {
     // If scrolling was just enabled, ensure we're back in sync by triggering window resize.
      document.getElementById('syncScroll').className = 'fa fa-link';
      isSynced = true;
      $(window).trigger('resize')
    //  $syncScroll.attr('checked', false);
   }
   config.set('isSyncScroll', !isSynced);
 }

 $syncScroll.on('change', toggleSyncScroll);

 /**
  * Scrollable height.
  */
 var codeScrollable = () => {
   var info = cm.getScrollInfo(),
     fullHeight = info.height,
     viewHeight = info.clientHeight;

   return fullHeight - viewHeight;
 }

 var prevScrollable = () => {
   var fullHeight = $markdown.height(),
     viewHeight = $prev.height();
   return fullHeight - viewHeight;
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
    //  console.log('Code scroll: %' + (Math.round(100 * percent)));
     muteScroll($prev, prevScroll);
     $prev.scrollTop(percent * prevScrollable());
   }
 }
 cm.on('scroll', codeScroll);
 $(window).on('resize', codeScroll);

 var prevScroll = () => {
     var scrollable = prevScrollable();
     if (scrollable > 0 && isSynced) {
       var percent = $(this).scrollTop() / scrollable;

       // Since we'll be triggering scroll events.
      //  console.log('Preview scroll: %' + (Math.round(100 * percent)));
       muteScroll(cm, codeScroll);
       cm.scrollTo(null, codeScrollable() * percent);
     }
 }
 $prev.on('scroll', prevScroll);




function newFile() {
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

var onChosenFileToOpen = function(theFileEntry) {
  console.log(theFileEntry);
  setFile(theFileEntry, false);
  readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function(theFileEntry) {
  setFile(theFileEntry, true);
  writeEditorToFile(theFileEntry);
};

function handleNewButton() {
  if (false) {
    newFile();
    cm.setValue("");
    console.log(cm.getValue().toString())
  } else {
    window.open('file://' + __dirname + '/index.html');
  }
}

function handleOpenButton() {
  dialog.showOpenDialog({properties: ['openFile']}, function(filename) {
      onChosenFileToOpen(filename.toString()); });
}

function handleSaveButton() {
  if (fileEntry && hasWriteAccess) {
    writeEditorToFile(fileEntry);
  } else {
    dialog.showSaveDialog(function(filename) {
       onChosenFileToSave(filename.toString(), true);
    });
  }
}

document.getElementById("new").addEventListener("click", handleNewButton);
document.getElementById("open").addEventListener("click", handleOpenButton);
document.getElementById("save").addEventListener("click", handleSaveButton);


/****************
 ** Word Count **
*****************/
function countWords() {
    wordcount = cm.getValue().split(/\b[\s,\.-:;]*/).length;
    document.getElementById("wordcount").innerHTML = "words: " + wordcount.toString();
    return cm.getValue().split(/\b[\s,\.-:;]*/).length;
}

document.getElementById("plainText").addEventListener("keypress", countWords)
