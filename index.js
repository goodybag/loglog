var Logger      = require('./lib/logger');
var transports  = require('./lib/transports');

module.exports = new Logger({
  transport: transports.console()
});

module.exports.transports = transports;