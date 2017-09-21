const electron = require('electron');
const remote = electron.remote;
// const main = remote.require('./main');

function createMenuTemplate() {
  var template = [
    {label: "&File", submenu: [
      {label: "New", accelerator: "CmdOrCtrl+N", click: () => { createWindow(); }},
      {label: "Open", accelerator: "CmdOrCtrl+O", click: () => { main.sendShortcut('file-open'); }},
      {type: "separator"},
      {label: "Save", accelerator: "CmdOrCtrl+S", click: () => { main.sendShortcut('file-save'); }},
      {label: "Save As", accelerator: "CmdOrCtrl+Shift+S", click: () => { main.sendShortcut('file-save-as'); }},
      {label: "Export to PDF", click: () => { main.sendShortcut('file-pdf'); }},
      {type: "separator"},
      {label: "Show in File Manager", click: () => { ipc.send('open-file-manager'); }},
      {type: "separator"},
      {label: "Settings", accelerator: "CmdOrCtrl+,", click: () => { main.sendShortcut('ctrl+,'); }},
      {type: "separator"},
      {label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => { main.sendShortcut('ctrl+q'); }}
    ]},
    {label: "&Edit", submenu: [
      {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
      {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
      {type: "separator"},
      {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
      {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
      {label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
      {label: "Select All", accelerator: "CmdOrCtrl+A", click: () => { main.sendShortcut('ctrl+a'); }},
      {type: "separator"},
      {label: "Find", accelerator: "CmdOrCtrl+F", click: () => { main.sendShortcut('ctrl+f'); }},
      {label: "Replace", accelerator: "CmdOrCtrl+Shift+F", click: () => { main.sendShortcut('ctrl+shift+f'); }},
      {type: "separator"},
      {label: "Auto-Indent", accelerator: "CmdOrCtrl+Shift+A", click: () => { main.sendShortcut('ctrl+shift+a'); }},
      {label: "Indent Less", accelerator: "CmdOrCtrl+Left", click: () => { main.sendShortcut('ctrl+left'); }},
      {label: "Indent More", accelerator: "CmdOrCtrl+Right", click: () => { main.sendShortcut('ctrl+right'); }},
      {type: "separator"},
      {label: "Toggle Comment", accelerator: "CmdOrCtrl+/", click: () => { main.sendShortcut('ctrl+/'); }},
      {type: "separator"},
      {label: "Insert YAML-frontmatter", accelerator: "CmdOrCtrl+Shift+Y", click: () => { main.sendShortcut('insert-yaml'); }}
    ]},
    {label: "&View", submenu: [
      {label: "Reload", accelerator:"CmdOrCtrl+R", click: () => { main.sendShortcut('ctrl+r'); }},
      {type: "separator"},
      {label: "Toggle Menu", accelerator:"CmdOrCtrl+M", click: () => { main.sendShortcut('ctrl+m'); }},
      {label: "Toggle Toolbar", accelerator:"CmdOrCtrl+.", click: () => { main.sendShortcut('ctrl+.'); }},
      {label: "Toggle Preview", accelerator:"CmdOrCtrl+P", click: () => { main.sendShortcut("ctrl+p"); }},
      {label: "Toggle Full Screen", accelerator:"F11", click: () => { main.sendShortcut("mazimize"); }},
      {type: "separator"},
      {label: "Themes" },
      {type: "separator"},
      {label: "Preview Mode", submenu: [
        {label: "Markdown", click: () => { main.sendShortcut('markdown-preview'); }},
        {label: "HTML", click: () => { main.sendShortcut('html-preview'); }}
      ]},
      {type: "separator"},
      {role: 'toggledevtools'}
    ]},
    {label: "&Window", submenu: [
      {label: "Minimize", click: () => {
        BrowserWindow.getFocusedWindow().minimize();
      }},
      {label: "Zoom", click: () => {
        toggleMaximize();
      }},
      {type: "separator"},
      {label: "Bring to Front", click: () => {
        windows[0].show();
      }}
    ]},
    {label: "&Help", role: 'help', submenu: [
      {label: "Markdown Help", click: () => {
        main.sendShortcut('markdown-modal');
      }},
      {type: "separator"},
      {label: "Documentation", click: () => {
        // shell.openExternal(packageJSON.)
        shell.openExternal(packageJSON.docs);
      }},
      {label: "Keybindings", click: () => {
        shell.openExternal(packageJSON.keybindings);
      }},
      {label: "Report Issue", click: () => {
        shell.openExternal(packageJSON.repository.bugs);
      }},
      {type: 'separator'},
      {label: "About Hyde", click: () => {
        main.sendShortcut('about-modal');
      }}
    ]}
  ];
  return template;
}

module.exports = createMenuTemplate;
