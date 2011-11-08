(function() {
  var assert, f, g;
  assert = function(x, y) {
    return x === y;
  };
  f = function(x) {
    return 5;
  };
  assert(f(4), 5);
  g = function(x) {
    return y;
  };
  assert(g(4), 10);
}).call(this);
