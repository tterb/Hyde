
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
  { name: 'lineWrapping' }, { name: 'editorFont' }, { name: 'editorFontSize' }, { name: 'editorLineHeight' }, { name: 'tabSize' }, { name: 'enableSpellCheck' }, { name: 'previewMode' }, { name: 'previewFont' }, { name: 'previewFontSize' }, { name: 'previewLineHeight' }, { name: 'hideYAMLFrontMatter' }, { name: 'matchBrackets' }, { name: 'keepInTray' }, { name: 'frontMatterTemplate' }
];

function getUserSettings() {
    opt.forEach(checkSetting);
    setPreviewMode(settings.get('previewMode'));
    opt.forEach(applySettings);
    formatHead();
    syncScrollCheck();
    if(process.platform === 'darwin') {
      $('.btn-group').remove();
      $('#menuToggle').remove();
      $('#metacity').hide();
    }
}

// If there are no settings for option, sets default
function checkSetting(opt) {
  if(!settings.has(opt.name))
    settings.set(opt.name, config.get(opt.name));
}

function applySettings(opt) {
  var selector = $('#'+opt.name.toString()),
      input = selector.find('input'),
      type = input.attr('type');
  if(settings.get(opt.name) && opt.action)
    opt.action();
  if(type === 'checkbox') {
    if(selector.length && input.length) {
      if(input.is(':checked') !== settings.get(opt.name))
        input.prop("checked", !input.prop("checked"));
    }
  } else if(type === 'text') {
    input.val(settings.get(opt.name));
  }
}

function syncScrollCheck() {
  if(settings.get('syncScroll'))
    syncScroll.attr('class', 'fa fa-link');
  else
    syncScroll.attr('class', 'fa fa-unlink');
  toggleSyncScroll;
}

var formatHead = () => {
  var dragArea = $('#draggable'),
      menuToggle = $('#menuToggle'),
      codeMirror = $('#textPanel > div');
  if(process.platfrom === 'darwin') {
    if(menu.is(':visible') !== toolbar.is(':visible'))
      toggleMenu();
  }
  if(menu.is(':visible')) {
    toolbar.css({ top: '26px' });
    toolbar.css('z-index', '999');
    dragArea.css('width', '-webkit-calc(100% - 255px)');
    menuToggle.hide();
    if(toolbar.is(':visible')) {
      body.css('paddingTop', '30px');
      menu.css('box-shadow', 'none');
      codeMirror.css('paddingTop', '10px');
    } else {
      body.css('paddingTop', '0px');
      menu.css('box-shadow', '0 1px 20px rgba(0,0,0,0.3)');
      codeMirror.css('paddingTop', '0px');
    }
  } else {
    toolbar.css({ top: '0px' });
    toolbar.css('z-index', '99999');
    body.css('paddingTop', '0px');
    if(toolbar.is(':visible')) {
      body.css('paddingTop', '7px');
      dragArea.css('width', '-webkit-calc(50% - 50px)');
      codeMirror.css('paddingTop', '7px');
    } else {
      menuToggle.show();
      body.css('paddingTop', '0px');
      dragArea.css({ 'width': 'calc(100% - 117px)' });
      codeMirror.css('paddingTop', '0px');
    }
  }
  if(preview.is(':visible') && parseInt($('#body').width(),10) > 924) {
    toolbar.css('width', '50%');
    $('.CodeMirror-sizer').css('margin-right', '0');
  } else {
    toolbar.css('width', '100%');
    $('.CodeMirror-sizer').css('margin-right', '8px');
  }
}

function toggleMenu() {
  var winButtons = $('#metacity').children('button');
  if(menu.attr('class').includes('hidden')) {
    menu.attr('class', 'slideInDown');
    menu.css('visibility', 'visible');
    menu.css('height', '27px');
    winButtons.css('marginTop', '2px');
    winButtons.css('marginBottom', '4px');
    $('#editArea').css('paddingTop', '0px');
    leftFade.css('top', '8px');
    settings.set('showMenu', true);
  } else {
    menu.attr('class', 'hidden slideInDown');
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
  if(process.platform === 'darwin') {
    toggleMenu();
    return;
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
  var markdown = $('#markdown'),
      html = $('#htmlPreview'),
      htmlText = "";
  if(markdown.is(':visible') && opt !== 'markdown') {
    markdown.hide();
    html.show();
    htmlText = html[0].innerHTML.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    html.text(htmlText);
    preview.css('padding', '27px 0 0 15px');
    preview.css('overflow', 'hidden');
  } else if(html.is(':visible') && opt !== 'html') {
    html.hide();
    markdown.show();
    preview.css('padding', '32px 15px 27px');
    preview.css('overflow-y', 'auto');
    settings.set('previewMode', 'markdown');
  }
  settings.set('previewMode', opt);
}

function toggleLineNumbers() {
  var state = settings.get('lineNumbers');
  if(state) {
    $('.CodeMirror-code > div').css('padding-left', '15px');
    $('.CodeMirror-gutters').hide();
  } else {
    $('.CodeMirror-code > div').css('padding-left', '22px');
    $('.CodeMirror-gutters').show();
  }
  settings.set('lineNumbers', !state);
}

function toggleWhitespace() {
  var state = settings.get('showTrailingSpace');
  if(state) {
    $('.cm-trailing-space-a').css('text-decoration', 'none');
    $('.cm-trailing-space-new-line').css('text-decoration', 'none');
  } else {
    $('.cm-trailing-space-a').css('text-decoration', 'underline');
    $('.cm-trailing-space-new-line').css('text-decoration', 'underline');
  }
  return settings.set('showTrailingSpace', !state);
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


// Handle settings-menu changes
$('#editorFont-input, #editorFont-up, #editorFont-down').bind('keyup mouseup', function () {
  var editor = $('#textPanel > div'),
      value = $('#editorFont-input').val();
  editor.css('fontSize', value.toString()+'px');
  settings.set('editorFontSize', value);
});

$('#editorTheme').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
    var theme = $(e.currentTarget).val().toLowerCase().replace(/ /g,"-");
    includeTheme(theme);
});

$('#previewMode').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
    var mode = $(e.currentTarget).val().toLowerCase();
    setPreviewMode(mode);
});

$('#previewFont-input, #previewFont-up, #previewFont-down').bind('keyup mouseup', function () {
  var editor = $('#textPanel > div'),
      value = $('#previewFont-input').val();
  editor.css('fontSize', value.toString()+'px');
  settings.set('previewFontSize', value);
});


$('.settings-toggle').change(() => {
  opt.forEach((temp) => {
    if(temp.name === $('.settings-toggle').attr('setting')) {
      if (temp.action) {
        temp.action();
      } else {
        var name = $('.settings-toggle').attr('setting');
        settings.set(name, !settings.get(name));
        settings.set($('.settings-toggle').attr('setting'))
      }
    }
  });
});
