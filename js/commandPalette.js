const CmdPalette = require('electron-command-palette');
const cmds = require(path.join(__dirname, '../', 'commands.json'));
let palette = new CmdPalette();
// palette.register("openFile", function() { sendShortcut('open-file'); });
let functs = [
  {
    'key': 'saveAsFile',
    'action': function() { saveAs(); }
  },
  {
    'key': 'saveFile',
    'action': () => { ipcSend('file-save'); }
  },
  {
    'key': 'openFile',
    'action': () => { ipcSend('file-open'); }
  }
];
palette.add(cmds);
palette.register(functs);

function commandPalette() {
  if($('.palette').is(':visible'))
    palette.hide();
  else
    palette.show();
}

module.exports = commandPalette;
