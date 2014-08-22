var _     = require('lodash');
var uuid  = require('node-uuid');
var util  = require('util');

var Logger = module.exports = function( component, options ){
  if ( component && typeof component === 'object' ){
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

  // Copy some properties from options to root
  [
    'parent', 'parents'
  ].forEach( function( p ){
    this[ p ] = this.options[ p ];
  }.bind( this ) );
};

Logger.prototype.inheritableOptions = [
  'parent', 'parents', 'transport'
];

Logger.prototype.create = function( cComponent, cOptions ){
  if ( typeof cComponent === 'object' ){
    cOptions = cComponent;
    cComponent = null;
  }

  cComponent = cComponent || this.component;

  var inheritedOptions = _.pick( this.options, this.inheritableOptions );
  cOptions = _.extend( {}, inheritedOptions, cOptions, {
    parent:   this
  , parents:  this.parents.slice(0)
  });

  if ( this.options.data ){
    var inheritedData;

    if ( Array.isArray( this.options.childrenReceive ) ){
      inheritedData = _.pick( this.options.data, this.options.childrenReceive );
    } else {
      inheritedData = _.clone( this.options.data );
    }

    cOptions.data = _.extend( {}, inheritedData, cOptions.data );
  }

  if ( this.component ){
    cOptions.parents.push( this.component );
  }

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

    var data = _.extend( {}, this.options.data );

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