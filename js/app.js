
const electron = require('electron');
const {app} = require('electron');
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = electron.remote.dialog;
const shell = electron.shell;
const fs = remote.require('fs');
const main = remote.require('./main');
const path = require('path');
const showdown  = require('showdown');
const notify = require('./js/notify');
const argHandling = require('./js/argHandling');
const katex = require('parse-katex');
const settings = require('electron-settings');
const storage = require('electron-json-storage');
const spellChecker = require('codemirror-spell-checker');
const packageJSON = require(path.join(__dirname, '/package.json'));
const Color = require('color');
const os = require('os');
const highlight = require('showdown-highlight');
require('showdown-youtube');

getUserSettings();
let currentTheme = settings.get('editorTheme');
let conf = {
	mode: 'yaml-frontmatter',
	base: 'gfm',
	viewportMargin: 100000000000,
	tabSize: 2,
	lineWrapping: true,
	lineNumbers: settings.get('lineNumbers'),
	showTrailingSpace: settings.get('showTrailingSpace'),
	autoCloseBrackets: settings.get('matchBrackets'),
	autoCloseTags: settings.get('matchBrackets'),
  matchBrackets: settings.get('matchBrackets'),
  matchTags: settings.get('matchBrackets'),
	extraKeys: {
		Enter: 'newlineAndIndentContinueMarkdownList'
	}
};

var theme = settings.get('editorTheme');
setEditorTheme(theme);
if(main.getThemes().filter((temp) => { return temp.value === theme; }))
	conf.theme = theme;
else
	conf.theme = 'one-dark';

if(settings.get('enableSpellCheck')) {
	conf.mode = 'spell-checker';
	conf.backdrop = 'yaml-frontmatter';
	spellChecker({ codeMirrorInstance: CodeMirror });
}

var cm = CodeMirror.fromTextArea(document.getElementById('plainText'), conf);

if(os.type() === 'Darwin') {
	$('#settings-title').css('paddingTop', '0.9em');
	$('#settings-title > img').css('marginTop', '-13px');
	$('#settings-title > h2').css('font-size', '3.175em');
	$('#settings-section h3').css('letter-spacing', '0.045em');
	$('#settings-section ul li').css('letter-spacing', '0.075em');
}

let themes = [],
		head = $('head');
main.getThemes().filter((temp) => {
	themes.push(temp.value);
});
themes.forEach(function(index) {
	var tag = document.createElement('link');
	tag.setAttribute('rel', 'stylesheet');
	tag.setAttribute('href', 'css/theme/'+index+'.css');
	head.append(tag);
});

function setEditorTheme(theme) {
	var themeTag;
	if(theme === undefined)
		theme = 'one-dark';
	themeTag = $('link[href="css/theme/'+theme.toString()+'.css"]');
	themeTag.attr('id', 'themeLink');
	var title = theme.replace(/-/g , ' ').replace(/\w\S*/g, function(str) {
		return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
	});
	$('#editorTheme').attr('title', title);
	settings.set('editorTheme', theme);
	if(currentTheme !== theme) {
		currentTheme = theme;
		cm.setOption('theme', theme);
	}
	var themeColor = $('.cm-s-'+theme).css('background-color');
	adaptTheme(themeColor, Color(themeColor).luminosity());
}

var converter = new showdown.Converter({
		ghCodeBlocks: true,
		ghCompatibleHeaderId: true,
		tables: true,
		tasklists: true,
		strikethrough: true,
		tablesHeaderId: true,
		simpleLineBreaks: true,
		smoothLivePreview: true,
		parseImgDimensions: true,
		simplifiedAutoLink: false,
		excludeTrailingPunctuationFromURLs: true,
		disableForced4SpacesIndentedSublists: true,
		extensions: ['youtube', highlight]
});

window.onload = () => {
	var markdownPreview = document.getElementById('markdown'),
			htmlPreview = $('#htmlPreview');

	var themeColor = $('.cm-s-'+theme).css('background-color');
	adaptTheme(themeColor, Color(themeColor).luminosity());
	createModals();
	fillEmojiModal();

	cm.on('change', (cm) => {
		var markdownText = cm.getValue();
		// Remove the YAML frontmatter from live-preview
		if(settings.get('hideYAMLFrontMatter'))
			markdownText = removeYAMLPreview(markdownText);
		// Convert emoji's
		markdownText = replaceWithEmojis(markdownText);
		// Render LaTex
		var renderedMD;
		if(settings.get('mathRendering'))
			renderedMD = markdownText[0]+katex.renderLaTeX(markdownText);
		// Markdown -> Preview
		renderedMD = converter.makeHtml(markdownText);
		markdownPreview.innerHTML = renderedMD;
		$('#markdown p').each(function() {
			if($(this).html() === '<br>') {
				$(this).css('margin-bottom', '0px');
			}
		});
		// Markdown -> HTML
		converter.setOption('noHeaderId', true);
		html = converter.makeHtml(markdownText);
		htmlPreview.val(html);
		// Open preview links in default browser
		$('#markdown a').on('click', function() {
			event.preventDefault();
			openInBrowser($(this).attr('href'));
		});
		// Handle preview checkboxes
		$('#markdown :checkbox').removeAttr('disabled');
		$('#markdown :checkbox').on('click', function() {
			event.preventDefault();
		});
		if(this.isFileLoadedInitially) {
			this.setClean();
			this.isFileLoadedInitially = false;
		}
		this.updateWindowTitle(this.currentFile);
		countWords();
	});

	// Read and handle file if given from commandline
	var filePath = __args__.file;
	var extensions = ['.md','.markdown','.mdown','.mkdn','.mkd','.mdwn','.mdtxt','.mdtext'];
	if(filePath && extensions.indexOf(path.extname(filePath)) > -1) {
		argHandling(filePath);
	} else if(main.getWindows().size <= 1) {
		storage.get('markdown-savefile', function(err, data) {
			if(err) throw err;
			if('filename' in data) {
				fs.readFile(data.filename, 'utf-8', function(err, data) {
					if(err) notify('An error ocurred while opening the file' + err.message, 'error');
					cm.getDoc().setValue(data);
					cm.getDoc().clearHistory();
				});
				this.isFileLoadedInitially = true;
				this.currentFile = data.filename;
			}
		});
		if(filePath) notify('The specified file is invalid', 'error');
	}

	$('#minimize').on('click', () => { remote.BrowserWindow.getFocusedWindow().minimize(); });
	$('#close').on('click', () => { closeWindow(remote.BrowserWindow.getFocusedWindow()); });
	$('#sidebar-new').on('click', () => { main.createWindow(); });
	$('#unsavedConfirm').on('click', () => { saveFile(); });
	$('#unsavedDeny').on('click', () => { remote.BrowserWindow.getFocusedWindow().close(); });
	// Handle link clicks in application
	$('.link').on('click', function() {
		event.preventDefault();
		openInBrowser($(this).attr('href'));
	});
	// Open dropdown sub-menus on hover
	$('.dropdown-submenu').mouseover(function() {
		$(this).children('ul').show();
	}).mouseout(function() {
		$(this).children('ul').hide();
	});
	$('#yamlPath').on('click', () => { setFrontMatterTemplate(); });
	$('#table-button').on('click', () => {
		$('#table-modal').modal();
		createTable($('#columns').val(),$('#rows').val(),$('.on').attr('id').slice(0,-5));
	});
};
$('#settings-menu').focus(function() {
	notify('Handler for .focus() called.', 'success');
});


/**************************
 * Synchronized scrolling *
 **************************/

var preview = $('#previewPanel'),
		markdown = $('#markdown'),
		syncScroll = $('#syncScrollToggle'),
		isSynced = settings.get('syncScroll');

 // Retaining state in boolean will be more CPU friendly rather than selecting on each event.
var toggleSyncScroll = () => {
	if(settings.get('syncScroll')) {
		syncScroll.attr('class', 'fa fa-unlink');
		isSynced = false;
		$(window).trigger('resize');
	} else {
		syncScroll.attr('class', 'fa fa-link');
		isSynced = true;
		$(window).trigger('resize');
	}
	settings.set('syncScroll', isSynced);
};
syncScroll.on('change', () => { toggleSyncScroll(); });

// Scrollable height.
var codeScrollable = () => {
	var info = cm.getScrollInfo();
	return info.height - info.clientHeight;
};
var prevScrollable = () => {
	return markdown.height() - preview.height();
};
// Temporarily swaps out a scroll handler.
var muteScroll = (obj, listener) => {
	obj.off('scroll', listener);
	obj.on('scroll', tempHandler);
	var tempHandler = () => {
		obj.off('scroll', tempHandler);
		obj.on('scroll', listener);
	};
};
// Scroll Event Listeners
var codeScroll = () => {
	var scrollable = codeScrollable();
	if(scrollable > 0 && isSynced) {
		var percent = cm.getScrollInfo().top / scrollable;
		muteScroll(preview, prevScroll);
		preview.scrollTop(percent * prevScrollable());
	}
};
cm.on('scroll', codeScroll);
$(window).on('resize', codeScroll);
$(window).on('resize', manageWindowSize());
var prevScroll = () => {
	var scrollable = prevScrollable();
	if(scrollable > 0 && isSynced) {
		var percent = $(this).scrollTop() / scrollable;
		muteScroll(cm, codeScroll);
		cm.scrollTo(percent * codeScrollable());
	}
};
preview.on('scroll', prevScroll);


function openNewFile(target) {
	var filePath = path.join(__dirname, target);
	main.createWindow();
	readFileIntoEditor(filePath);
	app.addRecentDocument(filePath);
}

function setFile(file, isWritable) {
	fileEntry = file;
	hasWriteAccess = isWritable;
}

function readFileIntoEditor(file) {
	if(file === '') return;
	fs.readFile(file, function (err, data) {
		if(err) notify('Read failed: ' + err, 'error');
		cm.getDoc().setValue(String(data));
		cm.getDoc().clearHistory();
	});
	this.isFileLoadedInitially = true;
	this.currentFile = file;
}

function writeEditorToFile(file) {
	fs.writeFile(file, this.cm.getValue(), function (err) {
		if(err) return notify('Write failed: ' + err, 'error');
		notify('Write completed.', 'success');
	});
}

// Resize toolbar when window is below necessary width
$(window).on('resize', () => {
	if(parseInt($('#body').width(),10) > 987 && $('#previewPanel').is(':visible')) {
		toolbar.css('width', '50%');
	} else {
		toolbar.css('width', '100%');
	}
});

$('#version-modal').text('v'+main.appVersion());

$('.spinner .btn:first-of-type').on('click', function() {
	var btn = $(this),
			input = btn.closest('.spinner').find('input'),
			value = parseFloat(input.val());
	if(input.attr('max') === undefined || value < parseFloat(input.attr('max'))) {
		input.val(value + 0.5);
	} else {
		btn.next('disabled', true);
	}
	settings.set(btn.attr('id').split('-')[0], input.val());
  $('#markdown').css('font-size', settings.get('previewFontSize'));
  $('#textPanel > div').css('font-size', settings.get('editorFontSize'));
});

$('.spinner .btn:last-of-type').on('click', function() {
	var btn = $(this),
			input = btn.closest('.spinner').find('input'),
			value = parseFloat(input.val());
	if(input.attr('min') === undefined || value > parseFloat(input.attr('min'))) {
		input.val(value - 0.5);
	} else {
		btn.prev('disabled', true);
	}
	settings.set(btn.attr('id').split('-')[0], input.val());
	$('#markdown').css('font-size', settings.get('previewFontSize'));
	$('#textPanel > div').css('font-size', settings.get('editorFontSize'));
	// $('#markdown').css('font-size', input.val()+'px');
});

$('#leftAlign, #centerAlign, #rightAlign').on('click', function() {
	var btn = $(this);
	$('.on').removeClass('on');
	btn.addClass('on');
	i++;
});

// Word count
function countWords() {
	var wordcount = cm.getValue().split(/\b[\s,.-:;]*/).length;
	document.getElementById('wordcount').innerHTML = 'words: ' + wordcount.toString();
	return cm.getValue().split(/\b[\s,.-:;]*/).length;
}

// Allows render process to create new windows
function openNewWindow() {
	main.createWindow();
}

function openInBrowser(url) {
	shell.openExternal(url);
}
