// Handle files specified via the command-line
function argHandling(filePath) {
	if(!filePath) return;
	filePath = path.normalize(filePath);
	var filename = path.basename(filePath);
	if(filePath[0] === '~')
		filePath.replace('~', require('os').homedir());
  // Append the current path if only filename is given
	if(filePath === filename)
		filePath = path.join(process.cwd(), filename);
  // Create specified file if it doesn't exist
	if(!fs.existsSync(filePath)) {
    fs.writeFile(filePath, '', (err) => {
			if(err) notify('An error ocurred while creating the file '+ err.message, 'error');
		});
  }
  storage.set('markdown-savefile', {'filename' : filePath}, (err) => { if(err) notify(err, 'error'); });
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if(err) notify('An error ocurred while opening the file '+ err.message, 'error');
    cm.getDoc().setValue(data);
    cm.getDoc().clearHistory();
    this.setClean();
    options.defaultPath = filePath;
    this.isFileLoadedInitially = true;
    this.currentFile = filePath;
    this.updateWindowTitle(filePath);
  });
}

module.exports = argHandling;
