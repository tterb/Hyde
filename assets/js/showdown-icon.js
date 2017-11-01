/**
 * Showdown Icon Extension, Glyphicon and FontAwesome support for showdown
 * http://github.com/dbtek/showdown-icon
 * 2014, Ismail Demirbilek
 * License: MIT
 */
(function() {
  var a = function(a) {
    return [{
      type: "lang",
      regex: "\\B(\\\\)?@glyphicon-([\\S]+)\\b",
      replace: function(a, b, c) {
        return b === "\\" ? a : '<span class="glyphicon glyphicon-' + c + '">' + "</span>"
      }
    }, {
      type: "lang",
      regex: "\\B(\\\\)?@fa-([\\S]+)\\b",
      replace: function(a, b, c) {
        return b === "\\" ? a : '<i class="fa fa-' + c + '">' + "</i>"
      }
    }]
  };
  typeof window != "undefined" && window.Showdown && window.Showdown.extensions && (window.Showdown.extensions.icon = a), typeof module != "undefined" && (module.exports = a)
})();
