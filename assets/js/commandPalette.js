const CmdPalette = require('electron-command-palette');
const cmds = require(path.join(__dirname, '../','json','commands.json'));
let palette = new CmdPalette();
palette.add(cmds);

function commandPalette() {
  if($('.palette').is(':visible'))
    palette.hide();
  else
    palette.show();
}

function getPalette() {
  return palette;
}

module.exports = getPalette;
