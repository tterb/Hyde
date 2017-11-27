
const electron = require('electron');
const remote = electron.remote;
const dialog = electron.remote.dialog;
const shell = electron.shell;
const fs = remote.require('fs');
const main = remote.require('./main');
const path = require('path');
const showdown  = require('showdown');
const notify = require('./js/notify');
const argHandling = require('./js/argHandling');
const katex = require('./js/parseTex');
const settings = require('electron-settings');
const storage = require('electron-json-storage');
const commandPalette = require('./js/commandPalette');
const spellChecker = require('codemirror-spell-checker');
const packageJSON = require(path.join(__dirname, '/package.json'));
const emoji = require('node-emoji');
const Color = require('color');
const os = require('os');
//conse marked = require('marked');
// const highlight = require('showdown-highlight');
require('showdown-youtube');

getUserSettings();
let currentTheme = settings.get('editorTheme');
let conf = {
	mode: 'yaml-frontmatter',
	base: 'gfm',
	viewportMargin: 10,
	tabSize: 2,
	lineWrapping: true,
	lineNumbers: settings.get('lineNumbers'),
	showTrailingSpace: settings.get('showTrailingSpace'),
	autoCloseBrackets: settings.get('matchBrackets'),
	autoCloseTags: settings.get('matchBrackets'),
  matchBrackets: settings.get('matchBrackets'),
  matchTags: settings.get('matchBrackets'),
	highlightSelectionMatches: true,
  cursorScrollMargin: 50,
	cursorBlinkRate: 425,
	autofocus: true,
	extraKeys: {
		Enter: 'newlineAndIndentContinueMarkdownList'
	}
};

if(settings.get('enableSpellCheck')) {
	conf.mode = 'spell-checker';
	conf.backdrop = 'yaml-frontmatter';
	spellChecker({ codeMirrorInstance: CodeMirror });
}

let themes = [],
		theme = settings.get('editorTheme');
main.getThemes().filter((temp) => { themes.push(temp.value); });
themes.forEach(function(file) {
	let tag = document.createElement('link');
	tag.setAttribute('rel', 'stylesheet');
	tag.setAttribute('href', 'assets/css/themes/'+file+'.css');
	$('head').append(tag);
});
if(themes.filter((temp) => { return temp.value === theme; }))
	conf.theme = theme;
else
	conf.theme = 'one-dark';

var cm = CodeMirror.fromTextArea(document.getElementById('markdownText'), conf);
setEditorTheme(theme);

if(os.type() === 'Darwin') {
	var settingsTitle = $('#settings-title'),
		settingsSection = $('#settings-section');
	$('.CodeMirror-scroll').css('paddingTop', '35px');
    settingsTitle.css('paddingTop', '1.5em');
    settingsTitle.find('> img').css('marginTop', '-13px');
    settingsTitle.find('> h2').css('font-size', '3.175em');
    settingsSection.find('h3').css('letter-spacing', '0.045em');
    settingsSection.find('ul li').css('letter-spacing', '0.075em');
}

function setEditorTheme(theme) {
	let themeTag;
	if(typeof(theme) !== 'string' || theme === undefined) {
		if(settings.get('editorTheme'))
			theme = settings.get('editorTheme');
		else
			theme = 'one-dark';
	}
	themeTag = $('link[href="assets/css/themes/'+theme+'.css"]');
	themeTag.attr('id', 'themeLink');
	let title = theme.replace(/-/g , ' ').replace(/\w\S*/g, function(str) {
		return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
	});
	$('#editorTheme').attr('title', title);
	settings.set('editorTheme', theme);
	if(currentTheme !== theme) {
		currentTheme = theme;
		cm.setOption('theme', theme);
	}
	let themeColor = $('.cm-s-'+theme).css('background-color');
	adaptTheme(themeColor, Color(themeColor).luminosity());
}

let converter = new showdown.Converter({
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
		extensions: ['youtube']
});

window.onload = () => {
	let themeColor = $('.cm-s-'+theme).css('background-color');
	adaptTheme(themeColor, Color(themeColor).luminosity());
	createModals();
	fillEmojiModal();

  // Render editor changes to live-preview
	cm.on('change', (cm) => { renderMarkdown(cm); sendIPC('has-changes'); });

	// Open preview links in default browser
	$('#mdPreview').find('a').on('click', function() {
		event.preventDefault();
		openInBrowser($(this).attr('href'));
	});

	// Read and handle file if given from commandline
	let filePath = __args__.file;
	let ext = ['.md','.markdown','.mdown','.mkdn','.mkd','.mdwn','.mdtxt','.mdtext'];
	if(filePath) {
    if(ext.indexOf(path.extname(filePath)) > -1)
      argHandling(filePath);
    else
      notify('The specified file is invalid', 'error');
	} else if(Object.keys(main.getWindows()).length <= 1) {
		storage.get('markdown-savefile', function(err, data) {
			if(err) notify(err, 'error');
			if('filename' in data) {
				fs.readFile(data.filename, 'utf-8', function(err, data) {
					if(err) notify('The last saved file no longer exists or has moved', 'info');
					cm.getDoc().setValue(data);
					cm.getDoc().clearHistory();
				});
        main.getWindows()[remote.getCurrentWindow().id].filePath = { 'filename' : data.filename };
				this.isFileLoadedInitially = true;
				this.currentFile = data.filename;
			}
		});
	}

	$('#minimize').on('click', () => { remote.BrowserWindow.getFocusedWindow().minimize(); });
	$('#close').on('click', () => { closeWindow(remote.BrowserWindow.getFocusedWindow()); });
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

	$('.table-button').on('click', () => {
		$('#table-modal').modal();
		createTable($('#columns').val(),$('#rows').val(),$('.on').attr('id').slice(0,-5));
	});
};

function getHTML() { return converter.makeHtml(cm.getValue()); }


/**************************
 * Synchronized scrolling *
 **************************/

var preview = $('#previewPanel'),
		markdown = $('#mdPreview'),
		syncScroll = $('#syncScrollToggle'),
		isSynced = settings.get('syncScroll');
		
// if(settings.get('previewMode') === 'html')
//   markdown = $('#htmlPreview');

// Retaining state in boolean is more CPU friendly
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

// Reads specified file and returns 'false' if there is an error
function readFileIntoEditor(file) {
	if(file === '') return;
	fs.readFile(file, 'utf-8', function(err, data) {
		if(err) notify('Read Error: ' + err, 'error');
		cm.getDoc().setValue(data);
		cm.getDoc().clearHistory();
	});
	this.isFileLoadedInitially = true;
	this.currentFile = file;
  return true;
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

$('.spinner .btn').on('click', function() {
	let btn = $(this),
			input = btn.closest('.spinner').find('input'),
			value = parseFloat(input.val());
  if(btn.is(':first-of-type')) {
    if(input.attr('max') === undefined || value < parseFloat(input.attr('max')))
      value += 0.5;
    else
      btn.next('disabled', true);
  } else if(btn.is(':last-of-type')) {
    if(input.attr('min') === undefined || value > parseFloat(input.attr('min')))
      value -= 0.5;
    else
      btn.prev('disabled', true);
  }
	input.val(value);
	settings.set(btn.attr('id').split('-')[0], value);
  $('#mdPreview').css('font-size', settings.get('previewFontSize'));
  $('#textPanel > div').css('font-size', settings.get('editorFontSize'));
});

$('#leftAlign, #centerAlign, #rightAlign').on('click', function() {
	var btn = $(this);
	$('.on').removeClass('on');
	btn.addClass('on');
});

$(document).click(function(e) {
	if($(e.target).attr('class') !== 'palette-input')
    commandPalette().hide();
});
// Close on escape key
$(document).keydown((e) => {
  if(e.keyCode === 27) {
    commandPalette().hide();
		if($('#settingsMenu').css('left') === '0px')
			sendIPC('toggle-settings');
  }
});

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
});

// FIXME: fucks up when there is already a file in the editor
// Improve drag-and-drop file functionality
$(document).on('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    for(var file of e.dataTransfer.files) {
      fs.readFile(file.path, 'utf-8', (err, data) => {
				if(err) notify('An error ocurred while opening the file '+ err.message, 'error');
				cm.getDoc().setValue(data);
			});
      newWindow(file.path);
    }
  });
  $(document).on('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
		console.log('dragging');
  });

$(document).keydown((e) => {
  if(e.altKey && process.platform !== 'darwin') {
    toggleMenu();
  }
});

function sendIPC(cmd) {
  return remote.BrowserWindow.getFocusedWindow().webContents.send(cmd);
}

function openInBrowser(url) {
	shell.openExternal(url);
}

function renderMarkdown(cm) {
	let markdownText = cm.getValue();
	// Remove the YAML frontmatter
	if(settings.get('hideYAMLFrontMatter'))
		markdownText = removeYAMLPreview(markdownText);
	// Convert emoji's
  markdownText = emoji.emojify(markdownText, (name) => { return name; }, formatEmoji);
	var renderedMD = converter.makeHtml(markdownText);
  // Render LaTex
	let texConfig = [['$$', '\$\$', false], ['$$ ', ' \$\$', true]];
	if(settings.get('mathRendering'))
		renderedMD = katex.renderLaTeX(renderedMD, texConfig);
	// Markdown -> Preview
	$('#mdPreview').html(renderedMD);
  // Allows for making '<br>' tags more GitHub-esque
	$('#mdPreview').find('p').each(function() {
		if($(this).html() === '<br>') {
			$(this).attr('class', 'break');
		}
	});
	// Markdown -> HTML
	converter.setOption('noHeaderId', true);
  $('#htmlPreview').val(converter.makeHtml(markdownText));
	// Handle preview checkboxes
	$('#mdPreview').find(':checkbox').removeAttr('disabled');
	$('#mdPreview').find(':checkbox').on('click', function() {
		event.preventDefault();
	});
	if(this.isFileLoadedInitially) {
		this.setClean();
		this.isFileLoadedInitially = false;
	}
	this.updateWindowTitle(this.currentFile);
	countWords();
}

var formatEmoji = (code, name) => {
  return '<span class="emoji emoji-'+ name + code + '">'+ code +'</span>';
};
