const clipboard = require('electron');
const parsePath = require('parse-filepath');

function reloadWin() {
    remote.getCurrentWindow().reload();
}

function toggleDevTools() {
  var window = electron.remote.getCurrentWindow();
  window.toggleDevTools();
}

function showUnsavedDialog() {
  var modal = $('#unsaved-modal'),
      filename = $('#bottomFile').text();
  if(modal.is(':visible')) {
    modal.modal('hide');
  } else {
    if(filename === 'New document')
      filename = 'This document';
    $('#unsavedContent').text(filename.toString()+' has unsaved changes, would you like to save them?');
    modal.modal();
  }
}

// FIXME: Fix open file in new window
function openNewFile(file) {
  let wins;
  file = path.join(__dirname, file);
  fs.readFile(file, 'utf-8', (err) => {
    if(err)
      notify('An error ocurred while opening the file '+ err.message, 'error');
    // cm.getDoc().setValue(data);
    openNewWindow();
    this.isFileLoadedInitially = true;
    this.currentFile = file;
    // app.addRecentDocument(file);
  });
  wins = Array.from(main.getWindows());
  return wins;
}

function closeWindow(win) {
  if(!this.isClean())
    showUnsavedDialog();
  else
    win.close();
}

function toggleSidebar() {
  var sidebar = $('#sidebar'),
      button = $('#sideButton'),
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

function toggleSettingsMenu() {
  var settingsMenu = $('#settingsMenu'),
      trigger = $('#settingsTrigger'),
      title = $('#settings-title');
  if(parseInt(settingsMenu.css('left'),10) < 0) {
    settingsMenu.css('left', '0px');
    trigger.css('left','310px');
    title.css('display', 'block');
    trigger.show();
    settingsMenu.focus();
  } else {
    settingsMenu.css('left', '-310px');
    title.css('display', 'none');
    trigger.hide();
    settingsMenu.off('focus');
  }
}

function copySelected() {
  clipboard.writeText(cm.getSelection().toString());
}

function pasteSelected() {
  cm.replaceSelection(clipboard.readText());
}

function openFile() { sendIPC('file-open'); }

function saveFile() { sendIPC('file-save'); }

function saveFileAs() { sendIPC('file-save-as'); }

function exportToPDF() { sendIPC('file-pdf'); }

function exportToHTML() { sendIPC('file-html'); }

// Generations and clean state of CodeMirror
var getGeneration = () => { return this.cm.doc.changeGeneration(); };
var setClean = () => { this.latestGeneration = this.getGeneration(); };
var isClean = () => { return this.cm.doc.isClean(this.latestGeneration); };

// Update window title and status bar filename
var updateWindowTitle = (path) => {
  var appName = 'Hyde',
      activeFile = $('#bottomFile'),
      status = $('#fileStatus'),
      saveSymbol = '*',
      filename,
      title;
  if(path) {
    title = appName + ' - ' + path.toString();
    filename = parsePath(path).basename;
  } else {
    title = appName;
    filename = 'New document';
  }
  if(!this.isClean()) {
    title = title + saveSymbol;
    status.css('visibility', 'visible');
  } else {
    status.css('visibility', 'hidden');
  }
  document.title = title;
  activeFile.html(filename);
  if(path !== undefined)
    activeFile.attr('data-tooltip', path.toString().replace(os.homedir(),'~'));
  else
    activeFile.attr('data-tooltip', 'None');
};

function toggleMaximize() {
  var window = electron.remote.getCurrentWindow();
  if(window.isMaximized) {
    window.unmaximize();
    settings.set('isMaximized', false);
  } else {
    window.maximize();
    settings.set('isMaximized', true);
  }
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

function appendCustomCSS() {
  var input = $('#custom-css').val();
  if(input.length <= 1) return;
  fs.writeFileSync(path.join(__dirname, 'css/preview/', 'custom.css'), input);
  toggleCustomCSS();
  $('#custom-css-modal').modal();
}
