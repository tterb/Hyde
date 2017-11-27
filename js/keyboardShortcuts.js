// const win = require('electron').remote.BrowserWindow.getFocusedWindow();
const localShortcut = require('electron-localshortcut');
var keyshort = [];

// Read and register local keyboard shortcuts
function registerShortcuts(win) {
  fs.readFile(path.join(__dirname,'assets','json','keyboard-shortcuts.json'),'utf8', function (data) {
    data = JSON.parse(data);
    // keyshort = data;
    for(var i = 0; i < data.length; i++) {
      keyshort[i] = data[i].keys;
      localShortcut.register(win, data[i].keys, () => { win.webContents.send(data[i].command); });
    }
  });
  return keyshort;
}

module.exports = registerShortcuts;
