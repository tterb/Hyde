
var insertTexts = {
  link: ['[', '](#url#)'],
  image: ['![', '](#url#)'],
  horizontalRule: ['', '\n-------------------\n']
};


function toggleFormat(type) {
  'use strict';
  let modifiers;
  if(type === 'strong')
    modifiers = ['**', '__'];
  else if(type === 'em')
    modifiers = ['*', '_'];
  else if(type === 'strikethrough')
    modifiers = ['~~'];
  else if(type === 'code') //TODO: Handle inline vs code block
    modifiers = ['`'];
  cm.operation(() => { toggleState(type, modifiers); });
}

function toggleState(type, modifiers) {
  if(modifiers.length === 0) return;
  let startPoint = cm.getCursor('start');
  let endPoint = cm.getCursor('end');
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
    modifiers.forEach(function(modi) {
      if(selection === modi+text+modi) {
        text = selection.substring(modiLength, selection.length - modiLength);
        cursorPOS = {line:endPoint.line, char:endPoint.ch - (modiLength*2)};
      } else if(outerSelection === modi+selection+modi) {
        startPoint = outerStart;
        endPoint = outerEnd;
        text = outerSelection.substring(modiLength, outerSelection.length - modiLength);
        cursorPOS = {line:endPoint.line, char:endPoint.ch - (modiLength*2)};
      }
    });
    if(text === undefined) {
      startPoint = findBreak(startPoint, '1');
      endPoint = findBreak(endPoint, '-1');
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
    if(dir === '-1') {
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
  pos = pos || cm.getCursor('start');
  var stat = cm.getTokenAt(pos);
  if(!stat.type) return {};
  var types = stat.type.split(' ');
  var ret = {}, data, text;
  for(var i = 0; i < types.length; i++) {
    data = types[i];
    if(data === 'strong') {
      ret.bold = true;
    } else if(data === 'variable-2') {
      text = cm.getLine(pos.line);
      if(/^\s*\d+\.\s/.test(text)) {
        ret['ordered-list'] = true;
      } else {
        ret['unordered-list'] = true;
      }
    } else if(data === 'atom') {
      ret.quote = true;
    } else if(data === 'em') {
      ret.italic = true;
    } else if(data === 'quote') {
      ret.quote = true;
    } else if(data === 'strikethrough') {
      ret.strikethrough = true;
    } else if(data === 'comment') {
      text = cm.getLine(pos.line);
      if(text.indexOf('`') > -1) {
          ret.code = true;
      } else {
          ret.comment = true;
      }
    } else if(data === 'link') {
      ret.link = true;
    } else if(data === 'tag') {
      ret.image = true;
    } else if(data.match(/^header(-[1-6])?$/)) {
      ret[data.replace('header', 'heading')] = true;
    }
  }
  return ret;
}

function toggleBlockquote() {
  _toggleLine(cm, 'quote');
}

function toggleComment(editor) {
  _toggleLine(cm, 'comment');
}

function toggleUnorderedList(editor) {
  _toggleLine(cm, 'unordered-list');
}

function toggleOrderedList(editor) {
  _toggleLine(cm, 'ordered-list');
}


function _toggleLine(cm, name) {
  if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className)) return;
  var startPoint = cm.getCursor('start'),
      endPoint = cm.getCursor('end'),
      stat = getState(cm);
  var repl = {
    'quote': /^(\s*)>\s+/,
    'unordered-list': /^(\s*)(\*|-|\+)\s+/,
    'ordered-list': /^(\s*)\d+\.\s+/,
    'comment': /<!-- (.*) -->/
  };
  var map = {
    'quote': '> ',
    'unordered-list': '* ',
    'ordered-list': '1. ',
    'comment': ['<!-- ', ' -->']
  };
  for(var i = startPoint.line; i <= endPoint.line; i++) {
    var text = cm.getLine(i);
    if(stat[name])
      text = text.replace(repl[name], '$1');
    else if(map[name].constructor === Array)
      text = map[name][0] + text + map[name][1];
    else
      text = map[name] + text;
    cm.replaceRange(text, {line: i, ch: 0}, {line: i, ch: 99999999999999});
  }
  cm.focus();
}

function insert(obj) {
    if(obj === 'link')
      insertLink(cm, obj);
    else if(obj === 'image')
      insertLink(cm, obj);
    else if(obj === 'hr')
      insertHorizontalLine();
    else return;
}

function createTable(cols, rows, align) {
  if(!cols || !rows) return notify('Invalid table parameters', 'error');
  var startPoint = cm.getCursor('start'),
      text = cm.getLine(startPoint.line),
      start = text.slice(0, startPoint.ch),
      end = text.slice(startPoint.ch),
      table = separator = body = '| ',
      alignment = ' | ';
  if(align === 'center') {
    separator = '|:';
    alignment = ':|:';
  } else if(align === 'right') {
    alignment = ':| ';
  }

  for(let i = 1; i <= cols; i++) {
    table += 'Column '+i+' | ';
    separator += '--------'+alignment;
    body += ' Text     | ';
  }
  table += '  \n'+separator.slice(0,-1)+'  \n';
  for(let i = 0; i < rows; i++) {
    table += body+'  \n';
  }
  cm.replaceSelection(start + table + end);
}

// function for adding heading
function toggleHeading() {
  _toggleHeading('larger');
}

function _toggleHeading(direction) {
  var startPoint = cm.getCursor('start'),
      endPoint = cm.getCursor('end');
  for(var i = startPoint.line; i <= endPoint.line; i++) {
    var text = cm.getLine(i);
    var currHeadingLevel = text.search(/[^#]/);
    if(direction !== undefined) {
      if(currHeadingLevel <= 0) {
        if(direction === 'smaller') {
          text = '###### ' + text;
        } else {
          text = '# ' + text;
        }
      } else if(currHeadingLevel === 6 && direction === 'larger') {
          text = text.substr(7);
      } else if(currHeadingLevel === 1 && direction === 'smaller') {
          text = text.substr(2);
      } else {
        if(direction === 'smaller') {
          text = text.substr(1);
        } else {
          text = '#' + text;
        }
      }
    }
    cm.replaceRange(text, {line: i, ch: 0}, {line: i, ch: 99999999999999});
  }
  cm.focus();
}

function selectWord() {
  var word, startPoint, endPoint;
  if(!cm.somethingSelected()) {
    word = cm.findWordAt(cm.getCursor());
    startPoint = word.anchor;
    endPoint = word.head;
  } else {
    word = cm.findWordAt(cm.getSelection());
    startPoint = word.anchor;
    endPoint = word.head;
  }
  cm.setSelection(startPoint, endPoint);
}

// Insert link or image-link syntax
function insertLink(cm, type) {
  var startPoint = cm.getCursor('start'),
      endPoint = cm.getCursor('end'),
      modi = ['[','](http://)'];
  if(type === 'image')
    modi[0] = '!'+modi[0];
  if(!cm.somethingSelected()) {
    var word = cm.findWordAt(cm.getCursor());
    startPoint = word.anchor;
    endPoint = word.head;
  }
  var text = cm.getRange(startPoint, endPoint);
  cm.setSelection(startPoint, endPoint);
  cm.replaceSelection(modi[0]+text+modi[1]);
  startPoint.ch += modi[0].length;
  if(startPoint !== endPoint) {
    endPoint.ch += modi[0].length;
  }
  cm.setCursor(endPoint.line, endPoint.ch+(modi[1].length-1));
  cm.focus();
}

function insertHorizontalLine() {
  var startPoint = cm.getCursor('start'),
      endPoint = cm.getCursor('end'),
      text = '\n-------------------\n';
  if(startPoint.ch > 2 || startPoint !== endPoint)
    text = '\n'+text+'\n';
  cm.replaceSelection(text);
}

// Inserts YAML-frontmatter from template file
function insertFrontMatter() {
  var path = settings.get('frontMatterTemplate'),
      extensions = ['yaml', 'yml', 'md', 'markdown', 'txt', 'text'];
  if(path.length < 1) {
    setFrontMatterTemplate();
    return notify('There is no specified frontmatter template', 'error');
  }
  if(!extensions.includes(path.split('.').pop()))
    return notify('Invalid specified template file', 'error');
  fs.readFile(path, 'utf8', function (err, data) {
    if(err) return notify(err, 'error');
    else {
      cm.execCommand('goDocStart');
      cm.replaceSelection(insertDate(data, formatDate()));
      cm.execCommand('newlineAndIndent');
      cm.setCursor(1);
      cm.execCommand('goLineRight');
    }
  });
  insertDate(formatDate());
}

function insertEmoji(emoji) {
  var startPoint = cm.getCursor('start'),
      endPoint = cm.getCursor('end');
  if(!cm.somethingSelected()) {
    var word = cm.findWordAt(cm.getCursor());
    startPoint = word.anchor;
    endPoint = word.head;
  }
  cm.setSelection(startPoint, endPoint);
  cm.replaceSelection(':'+emoji+':');
  startPoint.ch += 1;
  if(startPoint !== endPoint) {
    endPoint.ch += 1;
  }
  cm.setCursor(endPoint.line, endPoint.ch);
  cm.focus();
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
  var arr = [],
      str = '';
  doc.split('\n').forEach((line) => {
    arr.push(line);
    line = line.replace(/ \n/g,'');
    if(line.match(/date:/i))
      line = line+' '+date;
    str += line+'\n';
  });
  return str;
}

function removeYAMLPreview(preview) {
  var re = new RegExp(/((---\n))(\w|\d|\n|[().,\-:;@#$%^&*[\]''+–//®°⁰!?{}|`~]| )+?((---))/gm, 'mg');
  return preview.replace(re, '');
}
