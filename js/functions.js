
var clkPref = function (opt) {
  currentValue = opt.value;
  if (currentValue=='preview') {
    document.getElementById("htmlPreview").style.display = "none";
    document.getElementById("markdown").style.display = "block";
    document.getElementById("previewPanel").style.paddingTop = "25px";
    document.getElementById("previewPanel").style.paddingRight = "15px";
  } else if (currentValue=='html') {
    document.getElementById("markdown").style.display = "none";
    document.getElementById("htmlPreview").style.display = "block";
    document.getElementById("previewPanel").style.paddingTop = "0px";
    document.getElementById("previewPanel").style.paddingRight = "0px";
  }
}

function toggleTheme(opt) {
  currentValueTheme = opt.value;
  if (currentValueTheme=='light') {
    cm.setOption("theme", "zenburn");
    document.getElementById("previewPanel").className = "col-md-6 full-height";
  } else if (currentValueTheme=='dark') {
    cm.setOption("theme", "monokai");
    document.getElementById("previewPanel").className = "col-md-6 full-height preview-dark-mode";
  }
}

var changeTheme = function() {
  if(document.getElementById("previewPanel").className.includes("preview-dark-mode")) {
    cm.setOption("theme", "mdn-like");
    document.getElementById("previewPanel").className = "col-md-6 full-height";
    document.getElementById("toggle-theme").className = "fa fa-lightbulb-o editor-toolbar active";
  } else {
    cm.setOption("theme", "monokai");
    document.getElementById("previewPanel").className = "col-md-6 full-height preview-dark-mode";
    document.getElementById("toggle-theme").className = "fa fa-lightbulb-o editor-toolbar inactive";
  }
}

var formatHead = function() {
  var edit = $('#editArea');
  var toolbar = $('#toolbarArea');
  var toggle = $('#angleToolBar');
  var menu = $('#appMenu');
  var opt = $('#opt');
  var menuHeight = parseInt(menu.height());
  var editTop = 74;
  if($('#toolbarArea:hidden').length == 0) {
    editTop += 35;
  }
  if(menu.attr('class') == 'hidden') {
    opt.css({ top: '32px' });
    toolbar.css({ top: '74px' });
  } else {
    editTop += 19;
    opt.css({ top: '52px' });
    toolbar.css({ top: '93px' });
  }
  edit.css('padding-top', editTop);
}

var showToolBar = function() {
  var toolbar = $('#toolbarArea');
  var toggle = $('#angleToolBar');
  if($('#toolbarArea:hidden').length == 0) {
    toggle.attr('class', 'fa fa-angle-right');
    toggle.css('padding-left', '10px');
    toolbar.css('display', 'none');
  } else {
    toggle.attr('class', 'fa fa-angle-down');
    toggle.css('padding-left', '6px');
    toolbar.css('display', 'block');
  }
  formatHead();
};

function toggleMenu() {
    var menu = $('#appMenu');
    if(menu.attr('class') == 'hidden') {
        menu.attr('class', '');
        menu.css('visibility', 'visible');
        menu.css('height', '27px');
    } else {
        menu.attr('class', 'hidden');
        menu.css('visibility', 'hidden');
        menu.css('height', '0px');
    }
    formatHead();
}

// var showToolBar = function () {
//   var editTop = document.getElementById('editArea').style.paddingTop;
//   var toolbarHeight = document.getElementById('toolbarArea').offsetHeight;
//   var menuHeight = document.getElementById('appMenu').offsetHeight;
//   // if(!document.getElementById('appMenu').style.visibility == 'hidden') {
//   //   menuHeight = 27;
//   // }
//   if(document.getElementById("toolbarArea").style.display == "block"){
//     document.getElementById("angleToolBar").className = "";
//     document.getElementById("angleToolBar").className = "fa fa-angle-right";
//     document.getElementById("angleToolBar").style.paddingLeft = "10px";
//     document.getElementById("toolbarArea").style.display = "none";
//     document.getElementById("editArea").style.paddingTop = (editTop-toolbarHeight+menuHeight).toString()+"px";
//   } else {
//     document.getElementById("angleToolBar").className = "";
//     document.getElementById("angleToolBar").className = "fa fa-angle-down";
//     document.getElementById("angleToolBar").style.paddingLeft = "6px";
//     document.getElementById("toolbarArea").style.display = "block";
//     document.getElementById("editArea").style.paddingTop = (editTop+toolbarHeight+menuHeight).toString()+"px";
//   }
// }

// Generations and clean state of CodeMirror
var getGeneration = function () {
  return this.cm.doc.changeGeneration();
}

var setClean = function () {
  this.latestGeneration = this.getGeneration();
}

var isClean = function () {
  return this.cm.doc.isClean(this.latestGeneration);
}

// Update window title on various events
var updateWindowTitle = function (path) {
  var appName = "Hyde",
      isClean = this.isClean(),
      saveSymbol = "*",
      parsedPath,
      dir,
      title;

  if (path) {
    parsedPath = parsePath(path);
    dir = parsedPath.dirname || process.cwd();
    title = appName + " - " + path.toString();
    document.getElementById("bottom-file").innerHTML = parsedPath.basename;
  } else {
    title = appName;
    document.getElementById("bottom-file").innerHTML = "New document"
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
  }
  document.title = title;
  document.getElementById("title").innerHTML = title;
}
