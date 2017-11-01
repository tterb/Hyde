/**
 * Adapted from 'parse-katex' by joshuacaron
 * https://www.npmjs.com/package/parse-katex
**/

let fs = require('fs');
let katex = require('katex');
let _ = require('lodash');
let delimitInitial;

function parseExpression(raw, delimit, delimitEscaped, mathMode, finalPass) {
  finalPass = finalPass || false;
  var lines = raw.split('\n');
  var output = '';

  for(var j = 0; j < lines.length; j++) {
    var parsedLine = '';

    // Add a space if first character is a delimitter so that it gets properly formatted
    // if (lines[j][0] === delimit[0]) {
    //   lines[j] = ' ' + lines[j]
    //   delimitInitial = true
    // }

    // Split on delimiters if they are not escaped
    var pattern = '((?!\\\\).{1})' + _.escapeRegExp(delimitEscaped);
    var regex = new RegExp(pattern, 'g');
    var splitLine = lines[j].split(regex);

    // Add the characters before the delimitter to the previous line
    var l = 1;
    while(l < splitLine.length) {
      splitLine[l - 1] += splitLine[l];
      splitLine.splice(l, 1);
      ++l;
    }

    if(splitLine.length > 1 && splitLine.length % 2 === 1) {
      // If there were matches and the code is well-formed, parse each math section (odd indices)
      parsedLine = processLine(splitLine);
    } else {
      // If the LaTeX isn't wellformed (need matched $$s and at least 2), don't parse the line.
      parsedLine = lines[j];
    }
    // Sum up the resulting lines and add newlines back in
    output += j < lines.length - 1 ? parsedLine + '\n' : parsedLine;
  }

  // if(delimitInitial && finalPass) {
  //   output = output.slice(1, output.length);
  // }

  var r = new RegExp(_.escapeRegExp(_.escapeRegExp(delimitEscaped)), 'g');
  output = output.replace(r, delimit);
  return output;

  function processLine(rawLine) {
    var parsedLine = '';
    for(var i = 0; i < rawLine.length; ++i) {
      if(i % 2 === 0) {
        parsedLine += rawLine[i];
      } else {
        try {
          parsedLine += katex.renderToString(rawLine[i], {displayMode: mathMode});
        } catch (err) {
          // Render unformatted text if there is an error
          var original = delimitEscaped + rawLine[i] + delimitEscaped;
          parsedLine = mathMode ? '<p style="text-align:center;">' + original + '<p>' : original;
        }
      }
    }
    return parsedLine;
  }
}

var renderLaTeX = function(unparsed, config) {
  if(!config) {
    config = [['$$', '\$\$', true], ['$', '\$', false]];
  }
  delimitInitial = false;
  var parsed = unparsed;
  for(var i = 0; i < config.length; ++i) {
    var last = i === config.length - 1 ? true : false;
    parsed = parseExpression(parsed, config[i][0], config[i][1], config[i][2], last);
  }
  return parsed;
};

var templateEngine = function(filePath, callback) {
  var cssFile = '<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/' +
    '0.5.1/katex.min.css">';

  return fs.readFile(filePath, function(err, content) {
    if(err) { return callback(new Error(err)); }
    var rendered = renderLaTeX(content.toString());
    rendered = rendered.replace('</head>', cssFile + '</head>');
    return callback(null, rendered);
  });
};

module.exports = { renderLaTeX: renderLaTeX, render: renderLaTeX, templateEngine: templateEngine };
