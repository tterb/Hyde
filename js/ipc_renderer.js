
const ipcRenderer = electron.ipcRenderer;

// Handling file saving through IPCRenderer
function saveAs() {
  storage.get('markdown-savefile', function(err, data) {
    options = {};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }
    dialog.showSaveDialog(options, function(filename) {
      if(filename === undefined)
        return notify("You didn't save the file", "warning");
      storage.set('markdown-savefile', {'filename' : filename}, function(err) {
        if(err) notify(err, "error");
      });
      var mdValue = cm.getValue();
      // filename is a string that contains the path and filename created in the save dialog.
      fs.writeFile(filename, mdValue, function(err) {
        if(err) notify("An error ocurred while creating the file "+ err.message, "error");
      });
      this.setClean();
      this.currentFile = filename;
      this.updateWindowTitle(filename);
    });
  });
}

ipc.on('file-new', function() {
  storage.set('markdown-savefile', {}, function(err) {
    if(err) notify(err, "error");
  });
  currentFile = '';
  cm.getDoc().setValue("");
});

// Handling file saving through IPCRenderer
ipc.on('file-save', function() {
  storage.get('markdown-savefile', function(err, data) {
    if(err) {
      saveAs();
      return;
    }
    if('filename' in data) {
      var filename = data.filename;
      if(filename === undefined)
        return notify("You didn't save the file", "info");
      storage.set('markdown-savefile', {'filename' : filename}, function(err) {
        if(err) notify(err, "error");
      });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(filename, mdValue, function(err) {
        if(err) notify("An error ocurred creating the file "+ err.message, "error");
      });
      this.setClean();
      this.currentFile = filename;
      updateWindowTitle(filename);
    } else {
      saveAs();
    }
  });
});

ipc.on('file-save-as', saveAs);

// Handling file opening through IPCRenderer
ipc.on('file-open', () => {
  storage.get('markdown-savefile', (err, data) => {
    if(err) notify(err, "error");
    var options = {
      'properties': ['openFile'],
      'filters': [{
        name: 'Markdown',
        'extensions': ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext']
      }]
    };
    if('filename' in data)
      options.defaultPath = data.filename;
    dialog.showOpenDialog(options, (file) => {
      if(file === undefined) {
        return notify("You didn't select a file to open", "info");
      }
      storage.set('markdown-savefile', {
        'filename' : file[0] }, (err) => {
          if(err) notify(err, "error");
        });

      // file is a string that contains the path and filename created in the save file dialog.
      fs.readFile(file[0], 'utf-8', (err, data) => {
        if (err) { alert("An error ocurred while opening the file "+ err.message); }
        cm.getDoc().setValue(data);
      });
      // app.addRecentDocument(file);
      this.isFileLoadedInitially = true;
      this.currentFile = file[0];
    });
  });
});

ipc.on('ctrl+q', () => { closeWindow(remote.BrowserWindow.getFocusedWindow()); });
ipc.on('ctrl+b', () => { toggleFormat('strong'); });
ipc.on('ctrl+d', () => { selectWord(); });
ipc.on('ctrl+i', () => { toggleFormat('em'); });
ipc.on('ctrl+-', () => { toggleFormat('strikethrough'); });
ipc.on('ctrl+shift+-', () => { insert('hr'); });
ipc.on('ctrl+/', () => { toggleComment(); });
ipc.on('ctrl+h', () => { toggleHeading(); });
ipc.on('ctrl+l', () => { insert('link'); });
ipc.on('ctrl+k', () => { insert('image'); });
ipc.on('ctrl+f', () => { toggleSearch('find'); });
ipc.on('ctrl+shift+f', () => { toggleSearch('replace'); });
ipc.on('ctrl+a', () => { cm.execCommand('selectAll') });
ipc.on('ctrl+shift+a', () => { cm.execCommand('indentAuto'); });
ipc.on('ctrl+r', () => { reloadWin(); });
ipc.on('ctrl+m', () => { if(process.platform !== 'darwin') toggleMenu(); });
ipc.on('ctrl+;', () => { toggleFormat('code'); });
ipc.on("ctrl+'", () => { toggleBlockquote(); });
ipc.on('ctrl+.', () => { toggleToolbar(); });
ipc.on('ctrl+p', () => { togglePreview(); });
ipc.on('ctrl+,', () => { toggleSettingsMenu(); });
ipc.on('ctrl+left', () => { cm.execCommand('indentLess'); });
ipc.on('ctrl+right', () => { cm.execCommand('indentMore'); });
ipc.on('ctrl+up', () => { cm.execCommand('goDocStart'); });
ipc.on('ctrl+down', () => { cm.execCommand('goDocEnd'); });
ipc.on('maximize', () => { toggleMaximize(); })
ipc.on('file-pdf', () => {
  // Save as PDF file
  options = {
    filters: [
      { name: 'PDF', extensions: ['pdf'] }
    ]
  };
  dialog.showSaveDialog(options, (filePath) => {
    ipc.send('export-to-pdf', filePath);
  });
});
ipc.on('insert-yaml', () => { insertFrontMatter(); });
ipc.on('markdown-preview', () => { setPreviewMode('markdown'); });
ipc.on('html-preview', () => { setPreviewMode('html'); });
ipc.on('about-modal', () => { $('#about-modal').modal(); });
ipc.on('markdown-modal', () => { $('#markdown-modal').modal(); });
ipc.on('table-modal', () => { $('#table-modal').modal(); });
ipc.on('ctrl+e', () => { $('#emoji-modal').modal(); });
ipc.on('keybinding-modal', () => { $('#keybinding-modal').modal(); });
ipc.on('open-file-manager', () => { shell.showItemInFolder(currentFile); })
ipc.on('set-theme', function(event, data) { setEditorTheme(data); })
