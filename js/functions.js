var clkPref = function (opt) {
  currentValue = opt.value;
  if ( currentValue=='preview' ) {
    document.getElementById("htmlPreview").style.display = "none";
    document.getElementById("markdown").style.display = "block";
  } else if ( currentValue=='html' ) {
    document.getElementById("markdown").style.display = "none";
    document.getElementById("htmlPreview").style.display = "block";
  }
}

var changeTheme = function (opt) {
  currentValueTheme = opt.value;
  if ( currentValueTheme=='dark' ) {
    cm.setOption("theme", "monokai");
    document.getElementById("previewPanel").className = "col-md-6 full-height preview-dark-mode";
    document.getElementByClassName("CodeMirror-gutters").borderRight = "1px solid rgba(255,255,255,0.5)"
  } else if ( currentValueTheme=='light' ) {
    cm.setOption("theme", "solarized");
    document.getElementById("previewPanel").className = "col-md-6 full-height preview-light-mode";
    document.getElementByClassName("CodeMirror-gutters").borderRight = "1px solid rgba(0,0,0,0.5)"
  }
}

var showToolBar = function () {
  if(document.getElementById("toolbarArea").style.display == "block") {
    document.getElementById("angleToolBar").className = "";
    document.getElementById("angleToolBar").className = "fa fa-chevron-right";
    document.getElementById("toolbarArea").style.display = "none";
    document.getElementById("editArea").style.paddingTop = "24px";
    document.getElementById("textPanel").style.paddingTop = "10px";
    document.getElementByClassName("CodeMirror").paddingTop = "3px";
  } else {
    document.getElementById("angleToolBar").className = "";
    document.getElementById("angleToolBar").className = "fa fa-chevron-down";
    document.getElementById("toolbarArea").style.display = "block";
    document.getElementById("editArea").style.paddingTop = "53px";
    document.getElementById("textPanel").style.paddingTop = "15px";
    document.getElementByClassName("CodeMirror").paddingTop = "12px";
  }
}

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
  var appName = "Hyde MD",
      isClean = this.isClean(),
      saveSymbol = "*",
      parsedPath,
      dir,
      title;

  if (path) {
    parsedPath = parsePath(path);
    dir = parsedPath.dirname || process.cwd();
    title = parsedPath.basename + " - " + dir + " - " + appName;
  } else {
    title = "New document - " + appName;
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
  }
  document.title = title;
}
