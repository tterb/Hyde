const {clipboard} = require('electron');
const {webContents} = require('electron');

var clkPref = function (opt) {
  currentValue = opt.value;
  if (currentValue === 'markdown') {
    $('#htmlPreview').hide();
    $('#markdown').show();
  } else if (currentValue === 'html') {
    $('#markdown').hide();
    $('#htmlPreview').show();
  }
  settings.set('previewMode', opt)
}

function toggleDeveloper() {
  var window = electron.remote.getCurrentWindow();
  window.toggleDevTools();
}

function showUnsavedDialog(win) {
  var $modal = jQuery('#unsaved-modal'),
      $text = $('#unsaved-body'),
      $filename = $('#bottom-file').text();
  if($modal.is(':visible') > 0) {
    if ($filename === 'New document') {
      $filename = 'This document';
    }
    $text.text("'"+$filename.toString()+"' has unsaved changes, do you want to save them?");
    $modal.modal();
  } else {
    $modal.modal('hide');
  }
}

function closeWindow(win) {
  if(!this.isClean()) {
    showUnsavedDialog(win);
  } else {
    win.close();
  }
}

function toggleSidebar() {
  var sidebar = $('#sidebar'),
      button = $('#side-button'),
      buttonImg = $('#side-img'),
      trigger = $('#side-trigger');
  if(parseInt(sidebar.css('left'), 10) < 0) {
    button.css('visibility','hidden');
    sidebar.css('left', '0px');
    trigger.css('left','250px');
    buttonImg.attr('src','img/left-arrow.png');
  } else {
    button.css('visibility','hidden');
    sidebar.css('left', '-250px');
    trigger.css('left','0px');
    buttonImg.attr('src','img/right-arrow.png');
  }
}


function copySelected() {
  var content = "Text that will be now on the clipboard as text";
  clipboard.writeText(content);
}

function pasteSelected() {
  var content = clipboard.readText();
}

function openFile() {
  electron.remote.getCurrentWindow().webContents.send('file-open');
}

function saveFile() {
  electron.remote.getCurrentWindow().webContents.send('file-save');
}

function saveFileAs() {
  electron.remote.getCurrentWindow().webContents.send('file-save-as');
}

function exportToPDF() {
  electron.remote.getCurrentWindow().webContents.send('file-pdf');
}

function selectMarkdown() {
  document.getElementById('previewPanel').focus();
}
// Generations and clean state of CodeMirror
var getGeneration = function () {
  return this.cm.doc.changeGeneration();
}

var setClean = function () {
  this.latestGeneration = this.getGeneration();
}

var isClean = function () {
  return this.cm.doc.isClean(this.latestGeneration);
}

// Update window title on various events
var updateWindowTitle = function (path) {
  var appName = "Hyde",
      isClean = this.isClean(),
      saveSymbol = "*",
      parsedPath,
      filename,
      dir,
      title;

  if (path) {
    parsedPath = parsePath(path);
    dir = parsedPath.dirname || process.cwd();
    title = appName + " - " + path.toString();
    filename = parsedPath.basename;
  } else {
    title = appName;
    filename = 'New document';
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
    $('#file-status').css('visibility', 'visible');
  } else {
    $('#file-status').css('visibility', 'hidden');
  }
  document.title = title;
  $('#bottom-file').html(filename);
  $('#bottom-file').title = path.toString();
}

function openSettings() {
    var HydeSettings = require('./js/settingsMenu');
    HydeSettings();
}

function openModal(opt) {
  let win = new remote.BrowserWindow({
      parent: remote.getCurrentWindow(),
      frame: false,
      autoHideMenuBar: true,
      modal: true
  })
  var path = 'file://' + __dirname + '/modal/' + opt.toString() + '.html';
  win.loadURL(path);
}

function toggleSearch(opt) {
  var dialog = $('#search-container'),
      searchBar = $('.CodeMirror-dialog-top');
  if(!searchBar.is(':visible')) {
    dialog.css('visibility', 'visible');
    if(opt === 'find') {
      cm.execCommand('find');
    } else if(opt === 'replace') {
      cm.execCommand('replace');
    } else { return; }
  }
}

function getPOS() {
    var word = cm.findWordAt(cm.getCursor());
    return 'Cursor: '+cm.getCursor().ch.toString()+'\nStart: '+word.anchor.ch.toString()+'       End: '+word.head.ch.toString()+'\nWord: '+cm.getRange(word.anchor, word.head).toString()+'\nSelection: ('+cm.getCursor("start").ch.toString()+', '+cm.getCursor("end").ch.toString()+')';
}

function getHistory() {
    return this.cm.doc.historySize();
}
