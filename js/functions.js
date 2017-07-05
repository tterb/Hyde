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

var changeTheme = function (opt) {
  currentValueTheme = opt.value;
  if (currentValueTheme=='light') {
    cm.setOption("theme", "default");
    document.getElementById("previewPanel").className = "col-md-6 full-height";
  } else if (currentValueTheme=='dark') {
    cm.setOption("theme", "zenburn");
    document.getElementById("previewPanel").className = "col-md-6 full-height preview-dark-mode";
  }
}

var showToolBar = function () {
  if(document.getElementById("toolbarArea").style.display == "block"){
    document.getElementById("angleToolBar").className = "";
    document.getElementById("angleToolBar").className = "fa fa-angle-right";
    document.getElementById("toolbarArea").style.display = "none";
    document.getElementById("editArea").style.paddingTop = "60px";
    document.getElementById("textPanel").style.paddingTop = "25px";
  } else {
    document.getElementById("angleToolBar").className = "";
    document.getElementById("angleToolBar").className = "fa fa-angle-down";
    document.getElementById("toolbarArea").style.display = "block";
    document.getElementById("editArea").style.paddingTop = "110px";
    document.getElementById("textPanel").style.paddingTop = "0px";
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
  var appName = "Hyde",
      isClean = this.isClean(),
      saveSymbol = "*",
      parsedPath,
      dir,
      title;

  if (path) {
    parsedPath = parsePath(path);
    dir = parsedPath.dirname || process.cwd();
    title = appName + " - " + parsedPath.basename + " - " + dir;
    document.getElementById("bottom-file").innerHTML = parsedPath.basename;
  } else {
    title = appName + " - New document";
    document.getElementById("bottom-file").innerHTML = "New document"
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
  }
  document.title = title;
}
