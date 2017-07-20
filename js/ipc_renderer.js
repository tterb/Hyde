// Handling file saving through IPCRenderer
function saveAs() {
  storage.get('markdown-savefile', function(error, data) {
    options = {};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }
    dialog.showSaveDialog(options, function (fileName) {
      if (fileName === undefined){
        console.log("You didn't save the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName}, function(error) { if (error) alert(error); });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, mdValue, function (err) {
        if(err) {
          alert("An error ocurred creating the file "+ err.message)
        }
      });
      this.setClean();
      this.currentFile = fileName;
      this.updateWindowTitle(fileName);
    });
  });
}

ipc.on('file-new', function() {
  storage.set('markdown-savefile', {}, function(error) { if (error) alert(error); });
  currentFile = '';
  cm.getDoc().setValue("");
});

// Handling file saving through IPCRenderer
ipc.on('file-save', function() {
  storage.get('markdown-savefile', function(error, data) {
    if (error) {
      saveAs();
      return;
    }
    if ('filename' in data) {
      var fileName = data.filename;
      if (fileName === undefined){
        console.log("You didn't save the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName}, function(error) { if (error) alert(error); });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, mdValue, function (err) {
       if(err){
         alert("An error ocurred creating the file "+ err.message)
       }
      });
      this.setClean();
      this.currentFile = fileName;
      updateWindowTitle(fileName);
    } else {
      saveAs();
    }
  });
});

ipc.on('file-save-as', saveAs);

// Handling file opening through IPCRenderer
ipc.on('file-open', function() {
  storage.get('markdown-savefile', function(error, data) {
    if (error) alert(error);

    var options = {'properties' : ['openFile'], 'filters' : [{name: 'Markdown', 'extensions':['md']}]};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }

    dialog.showOpenDialog(options, function (fileName) {
      if (fileName === undefined){
        console.log("You didn't open the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName[0]}, function(error) { if (error) alert(error); });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.readFile(fileName[0], 'utf-8', function (err, data) {
        if(err){
          alert("An error ocurred while opening the file "+ err.message)
        }
        cm.getDoc().setValue(data);
      });
      this.isFileLoadedInitially = true;
      this.currentFile = fileName[0];
    });
  });
});

function copySelected() {
    const {clipboard} = require('electron');
    var content = window.getSelection().toString();
    console.log(window.getSelection().toString());
    clipboard.writeText(content);
}

ipc.on('ctrl+b', function() {
  toggleFormat('bold');
});

ipc.on('ctrl+i', function() {
  toggleFormat('italic');
});

ipc.on('ctrl+-', function() {
  toggleFormat('strikethrough');
});

ipc.on('ctrl+/', function() {
  toggleComment();
});

ipc.on('ctrl+l', function() {
  drawLink();
});

ipc.on('ctrl+h', function() {
  toggleHeadingSmaller();
});

ipc.on('ctrl+alt+i', function() {
  drawImage();
});

ipc.on('ctrl+shift+t', function() {
  drawTable();
});

ipc.on('ctrl+f', function() {
  cm.execCommand('find');
});

ipc.on('ctrl+shift+f', function() {
  cm.execCommand('replace');
});

ipc.on('ctrl+h', function() {
  cm.execCommand('replace');
});

ipc.on('ctrl+shift+a', function() {
  cm.execCommand('indentAuto');
});

ipc.on('ctrl+left', function() {
  cm.execCommand('indentLess');
});

ipc.on('ctrl+right', function() {
  cm.execCommand('indentMore');
});

ipc.on('ctrl+m', function() {
  toggleMenu();
});

ipc.on('ctrl+.', function() {
  toggleToolbar();
});

ipc.on('ctrl+,', function() {
  openSettings();
});

ipc.on('ctrl+p', function() {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.send('show-settings-window');
});

ipc.on('file-pdf', () => {
  // Only save PDF files
  options = {
    filters: [
      {name: 'PDF', extensions: ['pdf']}
    ]
  };

  dialog.showSaveDialog(options, (fileName) => {
    ipc.send('export-to-pdf', fileName);
  });

});
