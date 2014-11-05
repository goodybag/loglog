if ( typeof module === "object" && module && typeof module.exports === "object" ){
  var isNode = true, define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define( function( require, exports, module ){
  var utils = require('./utils');

  var Logger = module.exports = function( component, options ){
    if ( component && typeof component === 'object' ){
      options = component;
      component = null;
    }

    this.component = component;
    this.cid = utils.uuid();

    this.options = utils.defaults( options || {}, {
      parents:          []
    , parent:           null
    , transports:       []
    , parentOriginCids: []
    });

    if ( this.options.transport ){
      this.options.transports = [ this.options.transport ];
    }

    // Copy some properties from options to root
    [
      'parent', 'parents'
    ].forEach( function( p ){
      this[ p ] = this.options[ p ];
    }.bind( this ) );
  };

  Logger.prototype.inheritableOptions = [
    'parent', 'parents', 'transports', 'parentOriginCids'
  ];

  Logger.prototype.create = function( cComponent, cOptions ){
    if ( typeof cComponent === 'object' ){
      cOptions = cComponent;
      cComponent = null;
    }

    cComponent = cComponent || this.component;

    var inheritedOptions = utils.pick( this.options, this.inheritableOptions );
    cOptions = utils.extend( {}, inheritedOptions, cOptions, {
      parent:           this
    , parents:          this.parents.slice(0)
                        // Don't let consumers know about the default loglog instance
    , parentOriginCids: this.cid === 1 ? [] : this.options.parentOriginCids.slice(0)
    });

    if ( this.options.data ){
      var inheritedData;

      if ( Array.isArray( this.options.childrenReceive ) ){
        inheritedData = utils.pick( this.options.data, this.options.childrenReceive );
      } else {
        inheritedData = utils.clone( this.options.data );
      }

      cOptions.data = utils.extend( {}, inheritedData, cOptions.data );
    }

    if ( this.component ){
      cOptions.parents.push( this.component );
      cOptions.parentOriginCids.push( this.cid );
    }

    return new Logger( cComponent, cOptions );
  };

  Logger.prototype.getEntry = function(){
    return {
      timestamp:        new Date()
    , uuid:             utils.uuid()
    , component:        this.component
    , parents:          this.options.parents
    , originCid:        this.cid
    , parentOriginCids: this.options.parentOriginCids
    };
  };

  [
    'info', 'warn', 'error', 'fatal'
  ].forEach( function( level ){
    Logger.prototype[ level ] = function(){
      var args = Array.prototype.slice.call( arguments );

      var data = utils.extend( {}, this.options.data );

      args.filter( function( a ){
        return typeof a === 'object' && !Array.isArray( a );
      }).forEach( function( a ){
        utils.extend( data, a );
      });

      var entry = utils.extend( this.getEntry(), {
        level:    level
      , message:  utils.format.apply( null, args.filter( function( a ){
                    return [ 'string', 'number', 'date' ].indexOf( typeof a ) > -1;
                  }))
      , data:     data
      });

      this.options.transports.forEach( function( transport ){
        transport( entry, this );
      }.bind( this ) );
    };
  });

  return module.exports;
});