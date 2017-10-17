
function createMenuTemplate() {
	var template = [
		{label: '&File', submenu: [
			{label: 'New', accelerator: 'CmdOrCtrl+N', click: () => { createWindow(); }},
			{label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => { main.ipcSend('file-open'); }},
			{type: 'separator'},
			{label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => { main.ipcSend('file-save'); }},
			{label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S', click: () => { main.ipcSend('file-save-as'); }},
			{label: 'Export to PDF', click: () => { main.ipcSend('file-pdf'); }},
      {label: 'Export to HTML', click: () => { main.ipcSend('file-html'); }},
			{type: 'separator'},
			{label: 'Show in File Manager', click: () => { ipc.send('open-file-manager'); }},
			{type: 'separator'},
			{label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => { main.ipcSend('toggle-settings'); }},
			{type: 'separator'},
			{label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { main.ipcSend('win-close'); }}
		]},
		{label: '&Edit', submenu: [
			{label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo'},
			{label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo'},
			{type: 'separator'},
			{label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut'},
			{label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy'},
			{label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste'},
			{label: 'Select All', accelerator: 'CmdOrCtrl+A', click: () => { main.ipcSend('select-all'); }},
			{type: 'separator'},
			{label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => { main.ipcSend('search-find'); }},
			{label: 'Replace', accelerator: 'CmdOrCtrl+Shift+F', click: () => { main.ipcSend('search-replace'); }},
			{type: 'separator'},
			{label: 'Auto-Indent', accelerator: 'CmdOrCtrl+Shift+A', click: () => { main.ipcSend('auto-indent'); }},
			{label: 'Indent Less', accelerator: 'CmdOrCtrl+Left', click: () => { main.ipcSend('indent-less'); }},
			{label: 'Indent More', accelerator: 'CmdOrCtrl+Right', click: () => { main.ipcSend('indent-more'); }},
			{type: 'separator'},
			{label: 'Toggle Comment', accelerator: 'CmdOrCtrl+/', click: () => { main.ipcSend('insert-comment'); }},
			{type: 'separator'},
			{label: 'Insert YAML-frontmatter', accelerator: 'CmdOrCtrl+Shift+Y', click: () => { main.ipcSend('insert-yaml'); }}
		]},
		{label: '&View', submenu: [
			{label: 'Reload', accelerator:'CmdOrCtrl+R', click: () => { main.ipcSend('win-reload'); }},
			{type: 'separator'},
			{label: 'Toggle Menu', accelerator:'CmdOrCtrl+M', click: () => { main.ipcSend('toggle-menu'); }},
			{label: 'Toggle Toolbar', accelerator:'CmdOrCtrl+.', click: () => { main.ipcSend('toggle-toolbar'); }},
			{label: 'Toggle Preview', accelerator:'CmdOrCtrl+P', click: () => { main.ipcSend('toggle-preview'); }},
			{label: 'Toggle Full Screen', accelerator:'F11', click: () => { main.ipcSend('mazimize'); }},
			{type: 'separator'},
			{label: 'Themes' },
			{type: 'separator'},
			{label: 'Preview Mode', submenu: [
				{label: 'Markdown', click: () => { main.ipcSend('markdown-preview'); }},
				{label: 'HTML', click: () => { main.ipcSend('html-preview'); }}
			]},
			{type: 'separator'},
			{role: 'toggledevtools'}
		]},
		{label: '&Window', submenu: [
			{label: 'Minimize', click: () => {
				BrowserWindow.getFocusedWindow().minimize();
			}},
			{label: 'Zoom', click: () => {
				toggleMaximize();
			}},
			{type: 'separator'},
			{label: 'Bring to Front', click: () => {
				windows[0].show();
			}}
		]},
		{label: '&Help', role: 'help', submenu: [
			{label: 'Markdown Help', click: () => {
				main.ipcSend('markdown-modal');
			}},
			{type: 'separator'},
			{label: 'Documentation', click: () => {
				// shell.openExternal(packageJSON.)
				shell.openExternal(packageJSON.docs);
			}},
			{label: 'Keybindings', click: () => {
				shell.openExternal(packageJSON.keybindings);
			}},
			{label: 'Report Issue', click: () => {
				shell.openExternal(packageJSON.repository.bugs);
			}},
			{type: 'separator'},
			{label: 'About Hyde', click: () => {
				main.ipcSend('about-modal');
			}}
		]}
	];
	return template;
}

module.exports = createMenuTemplate;
