
var opt = [
  { name: 'showMenu', action: function() { toggleMenu(); }},
  { name: 'showToolbar', action: function() { toggleToolbar(); }},
  { name: 'showPreview', action: function() { togglePreview(); }},
  { name: 'syncScroll', action: function() { toggleSyncScroll; }},
  { name: 'isFullscreen', action: function() { toggleFullscreen(); }},
  { name: 'lineNumbers', action: function() { toggleLineNumbers(); }}
];

function getUserSettings() {
    opt.forEach(checkSetting)
    opt.forEach(applySettings);
    formatHead();
    syncScrollCheck();
}

function checkSetting(opt) {
    if(!settings.has(opt.name)) {
        settings.set(opt.name, config.get(opt.name));
    }
}

function applySettings(opt) {
    if(settings.get(opt.name)) {
        opt.action();
    }
}

function syncScrollCheck() {
    var syncScroll = $('#syncScroll');
    if(settings.get('syncScroll')) {
        syncScroll.attr('class', 'fa fa-link');
    } else {
        syncScroll.attr('class', 'fa fa-unlink');
    }
    toggleSyncScroll;
}

var formatHead = () => {
  var body = $('#body'),
      menu = $('#appMenu'),
      dragArea = $('#draggable'),
      toolbar = $('#toolbarArea');
  if(menu.is(':visible')) {
    toolbar.css({ top: '26px' });
    toolbar.css('z-index', '999');
    dragArea.css('width', '74%');
    $('#menuToggle').hide();
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
      dragArea.css('width', '46.75%');
    } else {
      $('#menuToggle').show();
      dragArea.css({ 'width': 'calc(100% - ' + 117 + 'px)' });
    }
  }
  if($('#previewPanel').is(':visible')) {
    toolbar.css('width', '50%');
    $('.CodeMirror-sizer').css('margin-right', '0');
  } else {
    toolbar.css('width', '100%');
    $('.CodeMirror-sizer').css('margin-right', '8px');
  }
}

function toggleMenu() {
  var buttons = $('#metacity').children('button'),
      menu = $('#appMenu');
  if(menu.attr('class') === 'hidden') {
    menu.attr('class', '');
    menu.css('visibility', 'visible');
    menu.css('height', '26px');
    buttons.css('marginTop', '2px');
    buttons.css('marginBottom', '4px');
    $('#frame').hide();
    $('#draggable-menu').show();
    $('#editArea').css('paddingTop', '0px');
    // $('#menuToggle').hide();
    settings.set('showMenu', true);
  } else {
    menu.attr('class', 'hidden');
    menu.css('visibility', 'hidden');
    menu.css('height', '0px');
    buttons.css('marginTop', '3px');
    buttons.css('marginBottom', '3px');
    $('#frame').show();
    $('#draggable-menu').hide();
    // $('#menuToggle').show();
    settings.set('showMenu', false);
  }
  formatHead();
}

var toggleToolbar = () => {
  var toolbar = $('#toolbarArea'),
      toggle = $('#angleToolBar');
  if(toolbar.is(':visible')) {
    toggle.attr('class', 'fa fa-angle-right');
    toggle.css('padding-left', '10px');
    toolbar.css('display', 'none');
    settings.set('showToolbar', false);
  } else {
    toggle.attr('class', 'fa fa-angle-down');
    toggle.css('padding-left', '6px');
    toolbar.css('display', 'block');
    settings.set('showToolbar', true);
  }
  formatHead();
};

function togglePreview() {
  if($('#previewPanel').is(':visible')) {
    $('#previewPanel').css('display', 'none');
    $('#leftPanel').width('100%');
    // $('#rightPanel').width('0%');
    $('#rightPanel').css('right', '-50%');
    $('#leftFade').width('100%');
    $('#rightFade').hide();
    // $("#prevToggle").children().hide();
    $("#syncScroll").hide();
    $('#togglePreview').attr('class', 'fa fa-eye-slash');
    settings.set('showPreview', true);
  } else {
    $('#previewPanel').css('display', 'block');
    $('#leftPanel').width('50%');
    // $('#rightPanel').width('50%');
    $('#rightPanel').css('right', '0');
    $('#leftFade').width('50%');
    $('#rightFade').show();
    // $("#prevToggle").children().show();
    $("#syncScroll").show();
    $('#togglePreview').attr('class', 'fa fa-eye');
    settings.set('showPreview', false);
  }
  formatHead();
}

function setPreviewMode(opt) {
  currentValue = opt.value;
  if (currentValue === 'markdown') {
    $('#htmlPreview').css('display', 'none');
    $('#markdown').css('display', 'block');
  } else if (currentValue === 'html') {
    $('#markdown').css('display', 'block');
    $('#htmlPreview').css('display', 'none');
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
