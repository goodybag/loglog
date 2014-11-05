if ( typeof module === "object" && module && typeof module.exports === "object" ){
  var isNode = true, define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define( function( require, exports, module ){
  var formatRegExp = /%[sdj%]/g;
  module.exports.format = function (f) {
    if (typeof f !== 'string') {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(inspect(arguments[i]));
      }
      return objects.join(' ');
    }

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
      if (x === '%') return '%';
      if (i >= len) return x;
      switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j': return JSON.stringify(args[i++]);
        default:
          return x;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (x === null || typeof x !== 'object') {
        str += ' ' + x;
      } else {
        str += ' ' + inspect(x);
      }
    }
    return str;
  };

  module.exports.extend = function( a ){
    var args = Array.prototype.slice.call( arguments, 1 );

    for ( var i = 0, l = args.length, key; i < l; ++i ){
      for ( key in args[ i ] ) a[ key ] = args[ i ][ key ];
    }

    return a;
  };

  module.exports.pick = function( obj, keys ){
    var result = {};

    for ( var i = 0, l = keys.length, k; i < l; ++i ){
      k = keys[ i ];
      if ( k in obj ) result[ k ] = obj[ k ];
    }

    return result;
  };

  module.exports.clone = function( obj ){
    var clone = {};

    for ( var key in obj ) clone[ key ] = obj[ key ];

    return clone;
  };

  module.exports.defaults = function( a, b ){
    a = a || {};

    for ( var key in b ){
      if ( !(key in a ) ) a[ key ] = b[ key ];
    }

    return a;
  };

  module.exports.uuid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  return module.exports;
});
