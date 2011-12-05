(function() {
  var Base, CALLABLE, IDENTIFIER, IDENTIFIER_STR, IS_STRING, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, METHOD_DEF, NEGATE, NO, SIMPLENUM, Scope, TAB, THIS, UTILITIES, YES, ast, compact, count, del, ends, extend, exts, flatten, last, lexer, merge, multident, o, parser, starts, unwrap, utility, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; }, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Scope = require('./scope').Scope;

  _ref = require('./helpers'), compact = _ref.compact, flatten = _ref.flatten, extend = _ref.extend, merge = _ref.merge, del = _ref.del, starts = _ref.starts, ends = _ref.ends, last = _ref.last;

  exports.extend = extend;

  YES = function() {
    return true;
  };

  NO = function() {
    return false;
  };

  THIS = function() {
    return this;
  };

  NEGATE = function() {
    this.negated = !this.negated;
    return this;
  };

  Base = (function() {

    function Base() {}

    Base.prototype.compile = function(o, lvl) {
      var node;
      o = extend({}, o);
      if (lvl) o.level = lvl;
      node = this.unfoldSoak(o) || this;
      node.tab = o.indent;
      if (o.level === LEVEL_TOP || !node.isStatement(o)) {
        return node.compileNode(o);
      } else {
        return node.compileClosure(o);
      }
    };

    Base.prototype.compileClosure = function(o) {
      if (this.jumps() || this instanceof Throw) {
        throw SyntaxError('cannot use a pure statement in an expression.');
      }
      o.sharedScope = true;
      return Closure.wrap(this).compileNode(o);
    };

    Base.prototype.cache = function(o, level, reused) {
      var ref, sub;
      if (!this.isComplex()) {
        ref = level ? this.compile(o, level) : this;
        return [ref, ref];
      } else {
        ref = new Literal(reused || o.scope.freeVariable('ref'));
        sub = new Assign(ref, this);
        if (level) {
          return [sub.compile(o, level), ref.value];
        } else {
          return [sub, ref];
        }
      }
    };

    Base.prototype.compileLoopReference = function(o, name) {
      var src, tmp;
      src = tmp = this.compile(o, LEVEL_LIST);
      if (!((-Infinity < +src && +src < Infinity) || IDENTIFIER.test(src) && o.scope.check(src, true))) {
        src = "" + (tmp = o.scope.freeVariable(name)) + " = " + src;
      }
      return [src, tmp];
    };

    Base.prototype.makeReturn = function(res) {
      var me;
      me = this.unwrapAll();
      if (res) {
        return new Call(new Literal("" + res + ".push"), [me]);
      } else {
        return new Return(me);
      }
    };

    Base.prototype.contains = function(pred) {
      var contains;
      contains = false;
      this.traverseChildren(false, function(node) {
        if (pred(node)) {
          contains = true;
          return false;
        }
      });
      return contains;
    };

    Base.prototype.containsType = function(type) {
      return this instanceof type || this.contains(function(node) {
        return node instanceof type;
      });
    };

    Base.prototype.lastNonComment = function(list) {
      var i;
      i = list.length;
      while (i--) {
        if (!(list[i] instanceof Comment)) return list[i];
      }
      return null;
    };

    Base.prototype.toString = function(idt, name) {
      var tree;
      if (idt == null) idt = '';
      if (name == null) name = this.constructor.name;
      tree = '\n' + idt + name;
      if (this.soak) tree += '?';
      this.eachChild(function(node) {
        return tree += node.toString(idt + TAB);
      });
      return tree;
    };

    Base.prototype.eachChild = function(func) {
      var attr, child, _i, _j, _len, _len2, _ref2, _ref3;
      if (!this.children) return this;
      _ref2 = this.children;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        if (this[attr]) {
          _ref3 = flatten([this[attr]]);
          for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
            child = _ref3[_j];
            if (func(child) === false) return this;
          }
        }
      }
      return this;
    };

    Base.prototype.traverseChildren = function(crossScope, func) {
      return this.eachChild(function(child) {
        if (func(child) === false) return false;
        return child.traverseChildren(crossScope, func);
      });
    };

    Base.prototype.invert = function() {
      return new Op('!', this);
    };

    Base.prototype.unwrapAll = function() {
      var node;
      node = this;
      while (node !== (node = node.unwrap())) {
        continue;
      }
      return node;
    };

    Base.prototype.children = [];

    Base.prototype.isStatement = NO;

    Base.prototype.jumps = NO;

    Base.prototype.isComplex = YES;

    Base.prototype.isChainable = NO;

    Base.prototype.isAssignable = NO;

    Base.prototype.unwrap = THIS;

    Base.prototype.unfoldSoak = NO;

    Base.prototype.assigns = NO;

    return Base;

  })();

  UTILITIES = {
    "extends": function() {
      return "function(child, parent) { for (var key in parent) { if (" + (utility('hasProp')) + ".call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }";
    },
    bind: function() {
      return 'function(fn, me){ return function(){ return fn.apply(me, arguments); }; }';
    },
    indexOf: function() {
      return "Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (" + (utility('hasProp')) + ".call(this, i) && this[i] === item) return i; } return -1; }";
    },
    hasProp: function() {
      return 'Object.prototype.hasOwnProperty';
    },
    slice: function() {
      return 'Array.prototype.slice';
    }
  };

  LEVEL_TOP = 1;

  LEVEL_PAREN = 2;

  LEVEL_LIST = 3;

  LEVEL_COND = 4;

  LEVEL_OP = 5;

  LEVEL_ACCESS = 6;

  TAB = '  ';

  IDENTIFIER_STR = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*";

  IDENTIFIER = RegExp("^" + IDENTIFIER_STR + "$");

  SIMPLENUM = /^[+-]?\d+$/;

  METHOD_DEF = RegExp("^(?:(" + IDENTIFIER_STR + ")\\.prototype(?:\\.(" + IDENTIFIER_STR + ")|\\[(\"(?:[^\\\\\"\\r\\n]|\\\\.)*\"|'(?:[^\\\\'\\r\\n]|\\\\.)*')\\]|\\[(0x[\\da-fA-F]+|\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\]))|(" + IDENTIFIER_STR + ")$");

  IS_STRING = /^['"]/;

  utility = function(name) {
    var ref;
    ref = "__" + name;
    Scope.root.assign(ref, UTILITIES[name]());
    return ref;
  };

  multident = function(code, tab) {
    code = code.replace(/\n/g, '$&' + tab);
    return code.replace(/\s+$/, '');
  };

  _ref2 = require('./helpers'), count = _ref2.count, starts = _ref2.starts, compact = _ref2.compact, last = _ref2.last;

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

  o = function(patternString, action, options) {
    var match;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) return [patternString, '$$ = $1;', options];
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    return [patternString, "$$ = " + action + ";", options];
  };

  exts = [];

  lexer = function(tokenType, code) {
    return exts.push({
      stage: 'lexer',
      type: tokenType,
      code: code
    });
  };

  parser = function(grammar) {
    return exts.push({
      stage: 'parser',
      grammar: grammar()
    });
  };

  ast = function(node) {
    return exts.push({
      stage: 'ast',
      nodes: [node()]
    });
  };

  lexer('literal', function() {
    var prev, value, _ref3;
    prev = last(this.tokens);
    value = this.chunk.charAt(0);
    if (value === '!' && (_ref3 = prev[0], __indexOf.call(CALLABLE, _ref3) >= 0) && !prev.spaced) {
      if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
      this.token('CALL_START', '(');
      this.token('CALL_END', '(');
      return 1;
    } else {
      return false;
    }
  });

  lexer('coffee_keywords', 'exporting');

  parser(function() {
    var extension;
    return extension = {
      Exporting: [
        o('EXPORTING ExportList', function() {
          return new Exporting($2);
        })
      ],
      ExportList: [
        o('Identifier', function() {
          return [$1];
        }), o('ExportList , Identifier', function() {
          return $1.concat($3);
        })
      ],
      Statement: [o('Exporting')]
    };
  });

  ast(function() {
    var Exporting;
    Exporting = (function() {

      __extends(Exporting, Base);

      function Exporting(exports) {
        this.exports = exports;
      }

      Exporting.prototype.children = ['exports'];

      Exporting.prototype.compileNode = function(o, level) {
        var code, exp, _i, _len, _ref3;
        code = "";
        _ref3 = this.exports;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          exp = _ref3[_i];
          code += ("" + this.tab + "exports[" + exp + "] = ") + exp.toString().split('"')[1] + ";\n";
        }
        return code;
      };

      return Exporting;

    })();
    return ['Exporting', Exporting];
  });

  exports.exts = exts;

}).call(this);
