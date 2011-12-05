(function() {
  var CALLABLE, ast, compact, count, exts, last, lexer, parser, starts, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  _ref = require('./helpers'), count = _ref.count, starts = _ref.starts, compact = _ref.compact, last = _ref.last;

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  exts = [];

  lexer = function(tokenType, code) {
    return exts.push({
      type: tokenType,
      code: code
    });
  };

  parser = function(code) {};

  ast = function(code) {};

  lexer('literal', function() {
    var prev, value, _ref2;
    prev = last(this.tokens);
    value = this.chunk.charAt(0);
    if (value === '!' && (_ref2 = prev[0], __indexOf.call(CALLABLE, _ref2) >= 0) && !prev.spaced) {
      if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
      this.token('CALL_START', '(');
      this.token('CALL_END', '(');
      return 1;
    } else {
      return false;
    }
  });

  parser(function() {});

  ast(function() {});

  exports.exts = exts;

}).call(this);
