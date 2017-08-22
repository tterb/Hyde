
const {clipboard} = require('electron');
const {webContents} = require('electron');

function reloadWin() {
  remote.getCurrentWindow().reload();
}

function toggleDeveloper() {
  var window = electron.remote.getCurrentWindow();
  window.toggleDevTools();
}

function showUnsavedDialog(win) {
  var $modal = $('#unsaved-modal'),
      $filename = $('#bottom-file').text();
  if($modal.is(':visible')) {
    $modal.modal('hide');
  } else {
    if ($filename === 'New document') {
      $filename = 'This document';
    }
    $('#unsaved-body').text("'"+$filename.toString()+"' has unsaved changes, do you want to save them?");
    $modal.modal();
  }
}

function toggleModal(id) {
  id = "#"+id;
  $(id).modal();
}

// FIXME
function openNewFile(file) {
  let wins;
  file = path.join(__dirname, file);
  fs.readFile(file, 'utf-8', (err, data) => {
    if (err) { alert("An error ocurred while opening the file "+ err.message); }
    // cm.getDoc().setValue(data);
    openNewWindow();
    // app.addRecentDocument(file);
    this.isFileLoadedInitially = true;
    this.currentFile = file;
  });
  wins = Array.from(main.getWindows());
  return wins;
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
      buttonIcon = $('#side-icon'),
      trigger = $('#left-trigger');
  if(parseInt(sidebar.css('left'), 10) < 0) {
    button.css('visibility','hidden');
    sidebar.css('left', '0px');
    trigger.css('left','240px');
    buttonIcon.css('left', '62%');
    buttonIcon.css('visibility', 'hidden');
    buttonIcon.attr('class', 'fa fa-chevron-left');
  } else {
    button.css('visibility','hidden');
    sidebar.css('left', '-240px');
    trigger.css('left','0px');
    buttonIcon.css('left', '65%');
    buttonIcon.css('visibility', 'hidden');
    buttonIcon.attr('class', 'fa fa-chevron-right');
  }
}

function toggleSettings() {
  var settingsMenu = $('#settings-menu'),
      trigger = $('#settings-trigger'),
      button = $('#settings-button'),
      title = $('#settings-title');
  if(parseInt(settingsMenu.css('left'),10) < 0) {
    button.css('visibility','hidden');
    settingsMenu.css('left', '0px');
    trigger.css('left','320px');
    title.css('display', 'block');
    trigger.show();
  } else {
    button.css('visibility','hidden');
    settingsMenu.css('left', '-320px');
    title.css('display', 'none');
    trigger.hide();
  }
}


function copySelected() {
    clipboard.writeText(cm.getSelection().toString());
}

function pasteSelected() {
  cm.replaceSelection(clipboard.readText());
}

function openFile() {
  if(this.cm.getValue === "")
    electron.remote.getCurrentWindow().webContents.send('file-open');
  else {
    // TODO Open file in new window
    electron.remote.getCurrentWindow().webContents.send('file-open');
  }
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
  $('#previewPanel').focus();
}

// Generations and clean state of CodeMirror
var getGeneration = () => { return this.cm.doc.changeGeneration(); }
var setClean = () => { this.latestGeneration = this.getGeneration(); }
var isClean = () => { return this.cm.doc.isClean(this.latestGeneration); }

// Update window title on various events
var updateWindowTitle = (path) => {
  var appName = "Hyde",
      activeFile = $('#bottom-file'),
      status = $('#file-status'),
      isClean = this.isClean(),
      saveSymbol = "*",
      filename,
      title;
  if(path) {
    title = appName + " - " + path.toString();
    filename = parsePath(path).basename;
  } else {
    title = appName;
    filename = 'New document';
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
    status.css('visibility', 'visible');
  } else {
    status.css('visibility', 'hidden');
  }
  document.title = title;
  activeFile.html(filename);
  if(path !== undefined)
    activeFile.attr('data-tooltip', path.toString());
  else
    activeFile.attr('data-tooltip', 'None');
}

function openModal(opt) {
  let win = new remote.BrowserWindow({
      parent: remote.getCurrentWindow(),
      frame: false,
      autoHideMenuBar: true,
      modal: true
  });
  var path = path.join('file://', __dirname, '/modal/', opt.toString(), '.html');
  win.loadURL(path);
}

function toggleSearch(opt) {
  var dialog = $('#search-container'),
      searchBar = $('.CodeMirror-dialog-top');
  if(!searchBar.is(':visible')) {
    dialog.css('visibility', 'visible');
    if(opt === 'find')
      cm.execCommand('find');
    else if(opt === 'replace')
      cm.execCommand('replace');
    else return;
  }
}
