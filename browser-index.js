if ( typeof module === "object" && module && typeof module.exports === "object" ){
  var isNode = true, define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define( function( require, exports, module ){
  var Logger = require('./lib/logger');

  module.exports = new Logger({
    transport: require('loglog-dev-tools')()
  });

  module.exports.Logger = Logger;

  module.exports.transports = {};
});
