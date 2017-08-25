
var insertTexts = {
  link: ["[", "](#url#)"],
  image: ["![", "](#url#)"],
  table: ["", "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n"],
  horizontalRule: ["", "\n-------------------\n"]
};

function toggleFormat(type) {
  'use strict';
  let modifiers;
  if(type === "strong") {
    modifiers = ["**", "__"];
  } else if(type === "em") {
    modifiers = ["*", "_"];
  } else if(type === "strikethrough") {
    modifiers = ["~~"];
  } else if(type === "code") {
    modifiers = ["`"];
  }
  cm.operation(() => { _toggleFormat(modifiers); })
}


function _toggleFormat(modifiers) {
  'use strict';
  if (modifiers.length === 0) return;
  // exclude modifiers from selection
  let allModifiers = ["*", "_", '**', "__", "~~", "`"];
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  // get containing word if there's no selection
  if(!cm.somethingSelected()) {
    var word = cm.findWordAt(cm.getCursor());
    startPoint = word.anchor;
    endPoint = word.head;
    cm.setSelection(startPoint, endPoint);
  } else {
    for (let bFound = true; bFound; ) {
      bFound = false;
      for (let i = 0, len = allModifiers.length; i < len; i++) {
        let modi = allModifiers[i];
        if (cm.getSelection().startsWith(modi) &&
          cm.getSelection().endsWith(modi) &&
          endPoint.ch - startPoint.ch >= 2 * modi.length) {
          bFound = true;
          startPoint.ch += modi.length;
          endPoint.ch -= modi.length;
          break;
        }
      }
    }
    cm.setSelection(startPoint, endPoint);
  }

  // find modifiers around selection
  let foundModifiers = [];
  let modifierWidth = 0;
  let rangeStart = new CodeMirror.Pos(startPoint.line, startPoint.ch);
  let rangeEnd = new CodeMirror.Pos(endPoint.line, endPoint.ch);
  for (let bFound = true; bFound; ) {
    bFound = false;
    for (let i = 0, len = allModifiers.length; i < len; i++) {
      let modi = allModifiers[i];
      if (rangeStart.ch < modi.length || rangeEnd.ch > cm.getLine(rangeEnd.line).length - modi.length) {
        continue;
      }
      rangeStart.ch -= modi.length;
      rangeEnd.ch += modi.length;
      let text = cm.getRange(rangeStart, rangeEnd);
      if (text.startsWith(modi) && text.endsWith(modi)) {
        bFound = true;
        foundModifiers.push(modi);
        break;
      }
      rangeStart.ch += modi.length;
      rangeEnd.ch -= modi.length;
    }
  }

  // find given modifier in array(foundModifiers)
  let modifierIndex = -1;
  for (let i = 0; i < modifiers.length; i++) {
    modifierIndex = foundModifiers.indexOf(modifiers[i]);
    if (modifierIndex !== -1) break;
  }

  // if modifier found, delete it from array(boundModifiers). or push it to array
  let modifierLength = 0;
  if (modifierIndex !== -1) {
    modifierLength = -foundModifiers[modifierIndex].length;
    foundModifiers.splice(modifierIndex, 1);
  } else {
    foundModifiers.unshift(modifiers[0]);
    modifierLength = modifiers[0].length;
  }

  // replace text with modified modifiers
  let prefix = foundModifiers.join("");
  let suffix = foundModifiers.reverse().join("");
  cm.replaceRange(suffix, endPoint, rangeEnd);
  cm.replaceRange(prefix, rangeStart, startPoint);

  startPoint.ch += modifierLength;
  // only change endpoint when selection is in single line
  if (startPoint.line === endPoint.line) {
    endPoint.ch += modifierLength;
  }
  cm.setSelection(startPoint, endPoint);
  cm.focus();
}

function getState(cm, pos) {
  pos = pos || cm.getCursor("start");
  var stat = cm.getTokenAt(pos);
  if(!stat.type) return {};
  var types = stat.type.split(" ");
  var ret = {}, data, text;
  for(var i = 0; i < types.length; i++) {
    data = types[i];
    if(data === "strong") {
      ret.bold = true;
    } else if(data === "variable-2") {
      text = cm.getLine(pos.line);
      if(/^\s*\d+\.\s/.test(text)) {
        ret["ordered-list"] = true;
      } else {
        ret["unordered-list"] = true;
      }
    } else if(data === "atom") {
      ret.quote = true;
    } else if(data === "em") {
      ret.italic = true;
    } else if(data === "quote") {
      ret.quote = true;
    } else if(data === "strikethrough") {
      ret.strikethrough = true;
    } else if(data === "comment") {
      text = cm.getLine(pos.line);
      if(text.indexOf('`') > -1) {
          ret.code = true;
      } else {
          ret.comment = true;
      }
    } else if(data === "link") {
      ret.link = true;
    } else if(data === "tag") {
      ret.image = true;
    } else if(data.match(/^header(\-[1-6])?$/)) {
      ret[data.replace("header", "heading")] = true;
    }
  }
  return ret;
}

function toggleBlockquote() {
  _toggleLine(cm, "quote");
}

function toggleComment(editor) {
  _toggleLine(cm, "comment");
}

function toggleUnorderedList(editor) {
  _toggleLine(cm, "unordered-list");
}

function toggleOrderedList(editor) {
  _toggleLine(cm, "ordered-list");
}


function _toggleLine(cm, name) {
  if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className)) return;
  var startPoint = cm.getCursor("start"),
      endPoint = cm.getCursor("end"),
      stat = getState(cm);
  var repl = {
    "quote": /^(\s*)\>\s+/,
    "unordered-list": /^(\s*)(\*|\-|\+)\s+/,
    "ordered-list": /^(\s*)\d+\.\s+/,
    "comment": /<!-- (.*) -->/
  };
  var map = {
    "quote": "> ",
    "unordered-list": "* ",
    "ordered-list": "1. ",
    "comment": ["<!-- ", " -->"]
  };
  for(var i = startPoint.line; i <= endPoint.line; i++) {
    var text = cm.getLine(i);
    if(stat[name])
      text = text.replace(repl[name], "$1");
    else if(map[name].constructor === Array)
      text = map[name][0] + text + map[name][1];
    else
      text = map[name] + text;
    cm.replaceRange(text, {line: i, ch: 0}, {line: i, ch: 99999999999999});
  }
  cm.focus();
}

function insert(obj) {
    var stat = getState(cm);
    if(obj === 'link')
      _replaceSelection(cm, stat.link, insertTexts.link, "http://");
    else if(obj === 'image')
      _replaceSelection(cm, stat.image, insertTexts.image, "http://");
    else if(obj === 'image')
      _replaceSelection(cm, stat.image, insertTexts.image, "http://");
    else if(obj === 'table')
      _replaceSelection(cm, stat.table, insertTexts.table);
    else if(obj === 'hr')
      _replaceSelection(cm, stat.image, insertTexts.horizontalRule);
    else return;
}

// function for adding heading
function toggleHeading() {
  _toggleHeading("larger");
}

function _toggleHeading(direction) {
  var startPoint = cm.getCursor("start"),
      endPoint = cm.getCursor("end");
  for(var i = startPoint.line; i <= endPoint.line; i++) {
    var text = cm.getLine(i);
    var currHeadingLevel = text.search(/[^#]/);
    if(direction !== undefined) {
      if(currHeadingLevel <= 0) {
        if(direction === "smaller") {
          text = "###### " + text;
        } else {
          text = "# " + text;
        }
      } else if(currHeadingLevel === 6 && direction === "larger") {
          text = text.substr(7);
      } else if(currHeadingLevel === 1 && direction === "smaller") {
          text = text.substr(2);
      } else {
        if(direction === "smaller") {
          text = text.substr(1);
        } else {
          text = "#" + text;
        }
      }
    }
    cm.replaceRange(text, {line: i, ch: 0}, {line: i, ch: 99999999999999});
  }
  cm.focus();
}

function _replaceSelection(cm, active, startEnd, url) {
  var startPoint = cm.getCursor("start"),
      endPoint = cm.getCursor("end"),
      start = startEnd[0],
      end = startEnd[1],
      text;
  if(url) {
    end = end.replace("#url#", url);
  }
  if(active) {
    text = cm.getLine(startPoint.line);
    start = text.slice(0, startPoint.ch);
    end = text.slice(startPoint.ch);
    cm.replaceRange(start + end, {line: startPoint.line, ch: 0});
  } else {
    text = cm.getSelection();
    cm.replaceSelection(start + text + end);
    startPoint.ch += start.length;
    if(startPoint !== endPoint) {
      endPoint.ch += start.length;
    }
  }
  cm.setSelection(startPoint, endPoint);
  cm.focus();
}

var temp = "";

function setFrontMatterTemplate() {
  storage.get('markdown-savefile', (error, data) => {
    if (error) alert(error);
    var options = {
      'properties': ['openFile'],
      'filters': [
        { name: 'All', 'extensions': ["yaml", "yml", "md", "markdown", "txt", "text"] },
        { name: 'YAML', 'extensions': ["yaml", "yml"] },
        { name: 'Markdown', 'extensions': ["md", "markdown"] },
        { name: 'Text', 'extensions': [ "txt", "text"] }
      ]
    };
    dialog.showOpenDialog(options, (file) => {
      if (file === undefined)
        return alert("You didn't select a file");
      fs.readFile(file[0], 'utf-8', (err, data) => {
        if (err)
          alert("An error ocurred while opening the file "+err.message);
        settings.set('frontMatterTemplate', file[0]);
      });
    });
  });
}

// Inserts YAML-frontmatter from template file
function insertFrontMatter() {
  var path = settings.get('frontMatterTemplate'),
      extensions = ["yaml", "yml", "md", "markdown", "txt", "text"];
  if(path.length < 1) {
    setFrontMatterTemplate();
    return alert("There is no specified frontmatter template");
  }
  if(!extensions.includes(path.split('.').pop()))
    return alert("Invalid specified template file");
  fs.readFile(path, 'utf8', function (err, data) {
    if(err) return alert(err);
    else {
      cm.execCommand('goDocStart');
      var text = insertDate(data, formatDate());
      cm.replaceSelection(insertDate(data, formatDate()));
      cm.execCommand('newlineAndIndent');
      cm.setCursor(1);
      cm.execCommand('goLineRight');
    }
  });
  insertDate(formatDate());
}

// Returns todays date in Jekyll-compatible format
function formatDate() {
  var today = new Date(),
      day = today.getDate(),
      month = today.getMonth()+1,
      year = today.getFullYear();
  if(month < 10) month = '0'+month;
  if(day < 10) day = '0'+day;
  return year+'-'+month+'-'+day;
}

// Automatically sets 'date' parameters to the current date
function insertDate(doc, date) {
  var str = "";
  var arr = [];
  doc.split('\n').forEach((line) => {
    arr.push(line);
    line = line.replace(/ \n/g,'');
    if(line.match(/date:/i))
      line = line+" "+date;
    str += line+'\n';
  });
  return str;
}

function removeYAMLPreview(text) {
    var re = new RegExp(/((---\n))(\w|\d|\n|[().,\-:;@#$%^&*\[\]\"\'+–\/\/®°⁰!?{}|`~]| )+?((---))/gm, "mg");
    return text.replace(re, "<br>");
}
