
var body = $('#body'),
    menu = $('#appMenu'),
    toolbar = $('#toolbar'),
    leftFade = $('#leftFade'),
    rightFade = $('#rightFade'),
    preview = $('#previewPanel'),
    syncScroll = $('#syncScrollToggle');

var opt = [
  { name: 'showMenu', action: () => { toggleMenu(); }},
  { name: 'showToolbar', action: () => { toggleToolbar(); }},
  { name: 'showPreview', action: () => { togglePreview(); }},
  { name: 'syncScroll', action: () => { toggleSyncScroll; }},
  { name: 'isFullscreen', action: () => { toggleFullscreen(); }},
  { name: 'lineNumbers', action: () => { toggleLineNumbers(); }},
  { name: 'showTrailingSpace', action: () => { toggleWhitespace() }},
  { name: 'lineWrapping' }, { name: 'editorFont' }, { name: 'editorFontSize' }, { name: 'editorLineHeight' }, { name: 'tabSize' }, { name: 'enableSpellCheck' }, { name: 'previewMode' }, { name: 'previewFont' }, { name: 'previewFontSize' }, { name: 'previewLineHeight' }, { name: 'hideYAMLFrontMatter' }, { name: 'matchBrackets' }, { name: 'keepInTray' }
];

function getUserSettings() {
    opt.forEach(checkSetting)
    opt.forEach(applySettings);
    formatHead();
    syncScrollCheck();
}

// If there are no settings for option, sets default
function checkSetting(opt) {
    if(!settings.has(opt.name)) {
        settings.set(opt.name, config.get(opt.name));
    }
}

var set = [];
function applySettings(opt) {
  var selector = $('#'+opt.name.toString()),
      checkbox = selector.find('input');
  if(settings.get(opt.name) && opt.action)
      opt.action();
  if(selector.length && checkbox.length) {
    if(checkbox.is(':checked') !== settings.get(opt.name)) {
      checkbox.prop("checked", !checkbox.prop("checked"));
    }
  }
}

function syncScrollCheck() {
  if(settings.get('syncScroll')) {
      syncScroll.attr('class', 'fa fa-link');
  } else {
      syncScroll.attr('class', 'fa fa-unlink');
  }
  toggleSyncScroll;
}

var formatHead = () => {
  var dragArea = $('#draggable'),
      menuToggle = $('#menuToggle');
  if(menu.is(':visible')) {
    toolbar.css({ top: '26px' });
    toolbar.css('z-index', '999');
    dragArea.css('width', '-webkit-calc(100% - 255px)');
    menuToggle.hide();
    if(toolbar.is(':visible')) {
      body.css('paddingTop', '30px');
    } else {
      body.css('paddingTop', '0px');
    }
  } else {
    toolbar.css({ top: '0px' });
    toolbar.css('z-index', '99999');
    body.css('paddingTop', '0px');
    if(toolbar.is(':visible')) {
      dragArea.css('width', '-webkit-calc(50% - 50px)');
    } else {
      menuToggle.show();
      dragArea.css({ 'width': 'calc(100% - 117px)' });
    }
  }
  if(preview.is(':visible') && parseInt($('#body').width()) > 924) {
    toolbar.css('width', '50%');
    $('.CodeMirror-sizer').css('margin-right', '0');
  } else {
    toolbar.css('width', '100%');
    $('.CodeMirror-sizer').css('margin-right', '8px');
  }
}

function toggleMenu() {
  var winButtons = $('#metacity').children('button');
  if(menu.attr('class') === 'hidden') {
    menu.attr('class', '');
    menu.css('visibility', 'visible');
    menu.css('height', '26px');
    winButtons.css('marginTop', '2px');
    winButtons.css('marginBottom', '4px');
    $('#editArea').css('paddingTop', '0px');
    leftFade.css('top', '8px');
    settings.set('showMenu', true);
  } else {
    menu.attr('class', 'hidden');
    menu.css('visibility', 'hidden');
    menu.css('height', '0px');
    winButtons.css('marginTop', '3px');
    winButtons.css('marginBottom', '3px');
    leftFade.css('top', '0');
    settings.set('showMenu', false);
  }
  formatHead();
}

var toggleToolbar = () => {
  if(toolbar.is(':visible')) {
    toolbar.css('display', 'none');
    settings.set('showToolbar', false);
  } else {
    toolbar.css('display', 'block');
    settings.set('showToolbar', true);
  }
  formatHead();
};

function togglePreview() {
  var leftPanel = $('#leftPanel'),
      rightPanel = $('#rightPanel'),
      previewToggle = $('#previewToggle');
  if(preview.is(':visible')) {
    preview.css('display', 'none');
    leftPanel.width('100%');
    rightPanel.css('right', '-50%');
    leftFade.width('100%');
    rightFade.hide();
    syncScroll.hide();
    previewToggle.attr('class', 'fa fa-eye-slash');
    settings.set('showPreview', true);
  } else {
    preview.css('display', 'block');
    leftPanel.width('50%');
    rightPanel.css('right', '0');
    leftFade.width('50%');
    rightFade.show();
    syncScroll.show();
    previewToggle.attr('class', 'fa fa-eye');
    settings.set('showPreview', false);
  }
  formatHead();
}

function setPreviewMode(opt) {
  currentValue = opt.value;
  if (currentValue === 'markdown') {
    document.getElementById('htmlPreview').css('display', 'none');
    document.getElementById('markdown').css('display', 'block');
  } else if (currentValue === 'html') {
    document.getElementById('markdown').css('display', 'block');
    document.getElementById('htmlPreview').css('display', 'none');
  }
  settings.set('previewMode', opt)
}

function toggleLineNumbers() {
  if(settings.get('lineNumbers')) {
    $('.CodeMirror-code > div').css('padding-left', '15px');
    $('.CodeMirror-gutters').hide();
    settings.set('lineNumbers', false);
  } else {
    $('.CodeMirror-code > div').css('padding-left', '22px');
    $('.CodeMirror-gutters').show();
    settings.set('lineNumbers', true);
  }
  // cm.execCommand('reload');
}

function toggleWhitespace() {
  if(settings.get('showTrailingSpace')) {
    $('.cm-trailing-space-a').css('text-decoration', 'underline');
    $('.cm-trailing-space-new-line').css('text-decoration', 'underline');
  } else {
    $('.cm-trailing-space-a').css('text-decoration', 'none');
    $('.cm-trailing-space-new-line').css('text-decoration', 'none');
  }
  return settings.get('showTrailingSpace');
}

function toggleFullscreen() {
  var window = electron.remote.getCurrentWindow();
  if(!window.isFullScreen()) {
    window.setFullScreen(true);
    settings.set('isFullscreen', true);
  } else {
    window.setFullScreen(false);
    settings.set('isFullscreen', false);
  }
}
