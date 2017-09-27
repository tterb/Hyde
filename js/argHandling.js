
function argHandling(filePath) {
	// Handle files specified via the command-line
	if(!filePath) return;
	filePath = path.normalize(filePath);
	var filename = path.basename(filePath);
	if(filePath[0] === '~')
		filePath.replace('~', require('os').homedir());
	if(filePath === filename)
		filePath = path.join(process.cwd(), filename);
	// If specified file exists
	if(fs.existsSync(filePath)) {
		readFileIntoEditor(path.join(filePath));
	} else {
		// Create specified file if it doesn't exist
		storage.set('markdown-savefile', {'filename' : filePath}, (err) => { if(err) notify(err, 'error'); });
		fs.writeFile(filePath, '', (err) => {
			if(err) notify('An error ocurred while creating the file '+ err.message, 'error');
		});
		fs.readFile(filePath, 'utf-8', (err, data) => {
			if(err) notify('An error ocurred while opening the file '+ err.message, 'error');
			cm.getDoc().setValue(data);
		});
		this.setClean();
		options.defaultPath = filePath;
		this.isFileLoadedInitially = true;
		this.currentFile = filePath;
		this.updateWindowTitle(filename);
	}
}

module.exports = argHandling;
