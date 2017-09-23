
function argHandling(filePath) {
	// Read file if given from commandline
	if(!filePath) return;
	filePath = path.normalize(filePath);
	var filename = path.basename(filePath);
	var extensions = ['.md','.markdown','.mdown','.mkdn','.mkd','.mdwn','.mdtxt','.mdtext'];
	if(filePath[0] === '~')
		filePath.replace('~', require('os').homedir());
	if(filePath === filename)
		filePath = path.join(process.cwd(), filename);
	if(fs.existsSync(filePath)) {
		readFileIntoEditor(path.join(filePath));
	} else {
		storage.set('markdown-savefile', {'filename' : filename}, function(err) {
			if(err) notify(err, 'error');
		});
		fs.writeFile(filePath, '', function(err) {
			if(err) notify('An error ocurred while creating the file '+ err.message, 'error');
		});
		fs.readFile(filePath, 'utf-8', (err, data) => {
			if (err) { alert('An error ocurred while opening the file '+ err.message); }
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
