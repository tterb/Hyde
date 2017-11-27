const package = require('./package.json');
const remote = require("electron").remote;
const autoUpdater = remote.autoUpdater;
// Register auto update event listener
autoUpdater.on('update-availabe', () => {
  console.log('update available');
});
autoUpdater.on('checking-for-update', () => {
  console.log('checking-for-update');
});
autoUpdater.on('update-not-available', () => {
  console.log('update-not-available');
});
autoUpdater.on('update-downloaded', (e) => {
  console.log(e);
  alert("Install?")
    autoUpdater.quitAndInstall();
});

autoUpdater.setFeedURL('http://localhost:9000/dist/win/');
autoUpdater.checkForUpdates();
window.autoUpdater = autoUpdater;

document.write(`Current version is: ${package.version}`);
