var _   = require('lodash');
var clc = require('cli-color');

var levels = {
  info:   clc.blue
, warn:   clc.yellow
, error:  clc.red
, fatal:  clc.redBright
};

module.exports = function( options ){
  options = _.defaults( options || {}, {
    maxDataLines: 5
  });

  return function( entry ){
    var data;

    if ( Object.keys( entry.data ).length > 0 ){
      data = JSON.stringify( entry.data, true, '  ' );
    } else {
      data = '';
    }

    if ( data.length > options.maxDataLines ){
      data = data.split('\n').slice( 0, options.maxDataLines );
      data.push('...');
      data = data.join('\n');
    }

    var args = [];

    if ( entry.component ){
      args.push( ( levels[ entry.level ] || levels.info )(
        '[' + entry.parents.concat( entry.component ).join('.') + ']' )
      );
    }

    args.push( entry.message );
    args.push( data );

    console.log.apply( console, args );
  };
};