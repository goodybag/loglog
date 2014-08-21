var _     = require('lodash');
var uuid  = require('node-uuid');
var util  = require('util');

var Logger = module.exports = function( component, options ){
  if ( typeof component === 'object' ){
    options = component;
    component = null;
  }

  this.component = component;

  this.options = _.defaults( options || {}, {
    parents: []
  , parent:  null
  });

  if ( typeof this.options.transport !== 'function' ){
    throw new Error('Missing required option: `transport`');
  }

  if ( this.options.parent ){
    this.options.parents = this.options.parent.options.parents.concat( this.options.parents );
  }
};

Logger.prototype.create = function( cComponent, cOptions ){
  if ( typeof cComponent === 'object' ){
    options = cComponent;
    cComponent = null;
  }

  cComponent = cComponent || this.component;

  cOptions = _.extend({
    parent: this
  , data:   {}
  }, this.options, cOptions );

  return new Logger( cComponent, cOptions );
};

Logger.prototype.getEntry = function(){
  return {
    timestamp: new Date()
  , uuid:      uuid()
  , component: this.component
  , parents:   this.options.parents
  };
};

[
  'info', 'warn', 'error', 'fatal'
].forEach( function( level ){
  Logger.prototype[ level ] = function(){
    var args = Array.prototype.slice.call( arguments );

    var data = {};

    args.filter( function( a ){
      return typeof a === 'object' && !Array.isArray( a );
    }).forEach( function( a ){
      _.extend( data, a );
    });

    var entry = _.extend( this.getEntry(), {
      level:    level
    , message:  util.format.apply( util, args.filter( function( a ){
                  return [ 'string', 'number', 'date' ].indexOf( typeof a ) > -1
                }))
    , data:     data
    });

    this.options.transport( entry );
  };
});