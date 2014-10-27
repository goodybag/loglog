var Logger = require('./lib/logger');

module.exports = new Logger({
  transport: require('loglog-dev-tools')()
});

module.exports.Logger = Logger;

module.exports.transports = {};