
var insertTexts = {
  link: ["[", "](#url#)"],
  image: ["![", "](#url#)"],
  table: ["", "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n"],
  horizontalRule: ["", "\n-------------------\n"]
};

function toggleFormat(type) {
  'use strict';
  let modifiers;
  if(type === "strong")
    modifiers = ["**", "__"];
  else if(type === "em")
    modifiers = ["*", "_"];
  else if(type === "strikethrough")
    modifiers = ["~~"];
  else if(type === "code")
    modifiers = ["`"];
  cm.operation(() => { toggleState(type, modifiers); })
}

function toggleState(type, modifiers) {
  if(modifiers.length === 0) return;
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  // get word at cursor if there's no selection
  if(!cm.somethingSelected()) {
    var word = cm.findWordAt(cm.getCursor());
    startPoint = word.anchor;
    endPoint = word.head;
  }
  var currentState = cm.getTokenTypeAt(startPoint),
      selection = cm.getRange(startPoint, endPoint),
      modiLength = modifiers[0].length,
      outerStart = {line:startPoint.line, ch:startPoint.ch - modiLength},
      outerEnd = {line:endPoint.line, ch:endPoint.ch + modiLength},
      outerSelection = cm.getRange(outerStart, outerEnd),
      text = selection.substring(modiLength, selection.length - modiLength),
      cursorPOS;
  if(currentState && currentState.includes(type)) {
    modifiers.forEach(function(modi, index) {
      if(selection === modi+text+modi) {
        text = selection.substring(modiLength, selection.length - modiLength);
        cursorPOS = {line:endPoint.line, char:endPoint.ch - (modiLength*2)};
      } else if(outerSelection === modi+selection+modi) {
        startPoint = outerStart;
        endPoint = outerEnd;
        text = outerSelection.substring(modiLength, outerSelection.length - modiLength);
        cursorPOS = {line:endPoint.line, char:endPoint.ch - (modiLength*2)};
      } //else if(outerSelection.includes(modi+selection)) {
      //   startPoint = outerStart;
      //   endPoint = findBreak(endPoint, 1);
      //   text = getRange(startPoint, endPoint).substring(modiLength, outerSelection.length);
      //   txt = text;
      //   select = cm.getRange(startPoint, endPoint);
      //   cursorPOS = {line:endPoint.line, char:endPoint.ch - (modiLength*2)};
      // } else if(outerSelection.includes(selection+modi)) {
      //   endPoint = outerEnd;
      //   startPoint = findBreak(startPoint, 1);
      //   text = getRange(startPoint, endPoint).substring(0, outerSelection.length-modiLength);
      //   txt = text;
      //   select = cm.getRange(startPoint, endPoint);
      //   cursorPOS = {line:endPoint.line, char:endPoint.ch - (modiLength*2)};
      // }
    });
    if(text === undefined) {
      startPoint = findBreak(startPoint, "1");
      endPoint = findBreak(endPoint, "-1");
      text = modifiers[0]+cm.getRange(startPoint, endPoint)+modifiers[0];
      cursorPOS = {line:endPoint.line, char:endPoint.ch + (modiLength*2)};
    }
  } else {
    // Add modifiers to selection
    text = modifiers[0]+selection+modifiers[0];
    cursorPOS = {line:endPoint.line, char:endPoint.ch + (modiLength*2)};
  }
  cm.setSelection(startPoint, endPoint);
  cm.replaceSelection(text, startPoint, endPoint);
  cm.setCursor(cursorPOS.line, cursorPOS.char);
}

function findBreak(point, dir) {
  var char, temp;
  while(char !== ' ') {
    temp = {line:point.line, ch:point.ch};
    if(dir === "-1") {
      point = {line:point.line, ch:(point.ch + 1)};
      char = cm.getRange(temp, point);
    } else {
      point = {line:point.line, ch:(point.ch - 1)};
      char = cm.getRange(point, temp);
    }
  }
  return point;
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
  storage.get('markdown-savefile', (err, data) => {
    if(err) notify(err, "error");
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
      if(file === undefined)
        return notify("You didn't select a file", "error");
      fs.readFile(file[0], 'utf-8', (err, data) => {
        if(err)
          notify("An error ocurred while opening the file "+err.message, "error");
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
    return notify("There is no specified frontmatter template", "error");
  }
  if(!extensions.includes(path.split('.').pop()))
    return notify("Invalid specified template file", "error");
  fs.readFile(path, 'utf8', function (err, data) {
    if(err) return notify(err, "error");
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
