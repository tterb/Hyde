
var opt = [
    { name: 'showMenu', action: function() { toggleMenu(); }},
    { name: 'showToolbar', action: function() { toggleToolbar(); }},
    { name: 'showPreview', action: function() { togglePreview(); }},
    { name: 'syncScroll', action: function() { toggleSyncScroll; }},
    { name: 'isFullscreen', action: function() { toggleFullscreen(); }}
];

function getUserSettings() {
    opt.forEach(checkSetting)
    opt.forEach(applySettings);
    syncScrollCheck();
}

function checkSetting(opt) {
    if(!settings.has(opt.name)) {
        settings.set(opt.name, config.get(opt.name));
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

function applySettings(opt) {
    if(settings.get(opt.name)) {
        opt.action();
    }
}

var formatHead = function() {
  var edit = $('#editArea');
  var toolbar = $('#toolbarArea');
  var toggle = $('#angleToolBar');
  var menu = $('#appMenu');
  var dragArea = $('#draggable');
  var preview = $('#previewPanel');
  var menuHeight = parseInt(menu.height(),10);
  var editTop = 0;
  if(menu.is(':visible')) {
    toolbar.css({ top: '26px' });
    if($('#toolbarArea:hidden').length === 0) {
      $('#body').css('paddingTop', '30px');
    } else {
      $('#body').css('paddingTop', '0px');
    }
  } else {
    toolbar.css({ top: '0px' });
    $('#body').css('paddingTop', '0px');
    if(toolbar.attr('class') !== 'hidden') {
      dragArea.css('width', '47%');
      dragArea.css('left', '45%');
    } else {
      dragArea.css('width', '-webkit-calc(100% - 125px)');
      dragArea.css('left', '4%');
    }
  }
  if(preview.is(':visible')) {
    toolbar.css('width', '50%');
  } else {
    toolbar.css('width', '100%');
  }
}

function toggleMenu() {
  var menu = $('#appMenu');
  var buttons = $('#metacity').children('button');
  if(menu.attr('class') === 'hidden') {
    menu.attr('class', '');
    menu.css('visibility', 'visible');
    menu.css('height', '26px');
    buttons.css('marginTop', '2px');
    buttons.css('marginBottom', '4px');
    $('#frame').hide();
    $('#draggable-menu').show();
    $('#editArea').css('paddingTop', '0px');
    $('#menuToggle').hide();
    settings.set('showMenu', true);
  } else {
    menu.attr('class', 'hidden');
    menu.css('visibility', 'hidden');
    menu.css('height', '0px');
    buttons.css('marginTop', '3px');
    buttons.css('marginBottom', '3px');
    $('#frame').show();
    $('#draggable-menu').hide();
    $('#menuToggle').show();
    settings.set('showMenu', false);
  }
  formatHead();
}

var toggleToolbar = function() {
  var toolbar = $('#toolbarArea');
  var toggle = $('#angleToolBar');
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
    $('#rightFade').hide();
    $("#htmlRadio").hide();
    $("#previewRadio").hide();
    $("#prevToggle").children().hide();
    $('#togglePreview').attr('class', 'fa fa-eye-slash');
    settings.set('showPreview', true);
  } else {
    $('#previewPanel').css('display', 'block');
    $("#prevToggle").show();
    $("#prevToggle").children().show();
    $("#htmlRadio").hide();
    $("#previewRadio").hide();
    $('#leftPanel').width('50%');
    $('#rightFade').show();
    $('#togglePreview').attr('class', 'fa fa-eye');
    settings.set('showPreview', false);
  }
  formatHead();
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
