'use strict';
const path = require('path');
const electron = require('electron');
const app = electron.app;
var iconPath = path.join(__dirname,'assets','img','icon');
let tray = null;

exports.create = function(mainWindow) {
	if(process.platform === 'darwin' || tray) {
		return;
	}

	const toggleHide = () => {
		if(mainWindow.isVisible()) {
			mainWindow.hide();
		} else {
			mainWindow.show();
		}
	};

	const contextMenu = electron.Menu.buildFromTemplate([
		{ label: 'Show/Hide', click() { toggleHide(); }},
		{ type: 'separator' },
		{ label: 'Quit', click() { app.quit(); }}
	]);

	let icon;
	if(process.platform === 'darwin')
		icon = path.join(__dirname,iconPath,'icns','icon.icns');
	else if(process.platform === 'win32')
		icon = path.join(__dirname,iconPath,'ico','icon.ico');
	else
		icon = path.join(__dirname,iconPath,'png','48x48.png');

	tray = new electron.Tray(icon);
	tray.setToolTip('Hyde');
	tray.setContextMenu(contextMenu);
	tray.on('click', toggleHide);
};
