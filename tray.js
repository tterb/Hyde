'use strict';
const path = require('path');
const electron = require('electron');
const app = electron.app;
var iconPath = path.join(__dirname, 'img/icon/ico/icon.ico');
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

	if(process.platform === 'darwin')
		iconPath = path.join(__dirname, 'img/icon/icns/icon.icns');
	else if(process.platform === 'win32')
		iconPath = path.join(__dirname, 'img/icon/ico/icon.ico');
	else
		iconPath = path.join(__dirname, 'img/icon/png/48x48.png');

	tray = new electron.Tray(iconPath);
	tray.setToolTip('Hyde');
	tray.setContextMenu(contextMenu);
	tray.on('click', toggleHide);
};
