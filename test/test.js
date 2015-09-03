var assert  = require('assert');
var loglog  = require('../');

describe( 'Basic Methods', function(){
  var getAssertLoggerOfLevel = function( level ){
    return loglog.create({
      transport: function( entry ){
        assert.equal( entry.level, level );
      }
    });
  }

  it ('.info', function(){
    var logger = getAssertLoggerOfLevel('info');
    assert.equal( typeof logger.info, 'function' );
    logger.info('Test!');
  });

  it ('.warn', function(){
    var logger = getAssertLoggerOfLevel('warn');
    assert.equal( typeof logger.warn, 'function' );
    logger.warn('Test!');
  });

  it ('.error', function(){
    var logger = getAssertLoggerOfLevel('error');
    assert.equal( typeof logger.error, 'function' );
    logger.error('Test!');
  });

  it ('.debug', function(){
    var logger = getAssertLoggerOfLevel('debug');
    assert.equal( typeof logger.debug, 'function' );
    logger.debug('Test!');
  });

  it ('.info with formatted string', function(){
    var loggerA = loglog.create({
      transport: function( entry ){
        assert.equal( entry.message, 'My name is Bob and I am 42.' );
      }
    });

    var loggerB = loglog.create({
      transport: function( entry ){
        assert.equal( entry.message, 'My name is Bob and I am a Cat. I am super cool.' );
      }
    });

    loggerA.info( 'My name is %s and I am %s.', 'Bob', 42 );
    loggerB.info( 'My name is %s and I am a %s.', 'Bob', 'Cat', 'I am super cool.' );
  });

  it ('Logging circular json structure to console should not throw an error', function(){
    var logger = loglog.create();
    var obj = {};
    obj.self = obj;
    logger.info( obj );
  });
});

describe( 'Inheritance', function(){
  it ('.create', function(){
    var loggerA = loglog.create('Child A');
    var loggerB = loggerA.create('Child B');
    var loggerC = loggerB.create('Child C');

    assert.equal( loggerA.component, 'Child A' );
    assert.equal( loggerB.component, 'Child B' );
    assert.equal( loggerC.component, 'Child C' );

    assert.deepEqual( loggerA.parents, [] );
    assert.deepEqual( loggerB.parents, ['Child A'] );
    assert.deepEqual( loggerC.parents, ['Child A', 'Child B'] );

    assert.deepEqual( loggerA.options.parentOriginCids, [] );
    assert.deepEqual( loggerB.options.parentOriginCids, [loggerA.cid] );
    assert.deepEqual( loggerC.options.parentOriginCids, [loggerA.cid, loggerB.cid] );
  });

  it ('.create with default data', function(){
    var loggerA = loglog.create('Child A', {
      data: { a: 1, b: 2 }
    , transport: function( entry ){
        assert.equal( entry.data.a, 1 );
        assert.equal( entry.data.b, 2 );
        assert.equal( entry.data.c, 3 );
      }
    });

    var loggerB = loggerA.create('Child B', {
      transport: function( entry ){
        assert.equal( entry.data.a, 1 );
        assert.equal( entry.data.b, 2 );
        assert.equal( entry.data.c, 4 );
      }
    });

    loggerA.info( 'ohai', { c: 3 } );
    loggerB.info( 'ohai', { c: 4 } );
  });

  it ('.create with inheriting specific default data', function(){
    var loggerA = loglog.create('Child A', {
      data: { a: 1, b: 2 }
    , childrenReceive: ['b']
    });

    var loggerB = loggerA.create('Child B', {
      transport: function( entry ){
        assert.equal( entry.data.a, undefined );
        assert.equal( entry.data.b, 2 );
        assert.equal( entry.data.c, 3 );
      }
    });

    loggerB.info( 'ohai', { c: 3 } );
  });

  it ('.create with default data mixin with child default data', function(){
    var loggerA = loglog.create('Child A', {
      data: { a: 1, b: 2 }
    , transport: function( entry ){
        assert.equal( entry.data.a, 1 );
        assert.equal( entry.data.b, 2 );
      }
    });

    var loggerB = loggerA.create('Child B', {
      data: { b: 3, c: 4 }
    , transport: function( entry ){
        assert.equal( entry.data.a, 1 );
        assert.equal( entry.data.b, 3 );
        assert.equal( entry.data.c, 4 );
      }
    });

    loggerA.info('ohai');
    loggerB.info('ohai');
  });

  describe ('Multiple transports', function(){
    it ('.create with multiple transports', function(){
      var i = 0;
      var loggerA = loglog.create('Child A', {
        transports: [
          function( entry ){ assert.equal( i++, 0 ); }
        , function( entry ){ assert.equal( i++, 1 ); }
        , function( entry ){ assert.equal( i++, 2 ); }
        ]
      });

      loggerA.info('ohai');

      assert.equal( i, 3 );
    });

    it ('.create with multiple transports inherited', function(){
      var i = 0;
      var loggerA = loglog.create('Child A', {
        transports: [
          function( entry ){ i++; }
        , function( entry ){ i++; }
        , function( entry ){ i++; }
        ]
      });

      var loggerB = loggerA.create('Child B');

      loggerA.info('ohai');
      loggerB.info('ohai');

      assert.equal( i, 6 );
    });

    it ('.create with multiple transports overridden', function(){
      var i = 0;
      var loggerA = loglog.create('Child A', {
        transports: [
          function( entry ){ i++; }
        , function( entry ){ i++; }
        , function( entry ){ i++; }
        ]
      });

      var loggerB = loggerA.create('Child B', {
        transports: [
          function( entry ){ i--; }
        , function( entry ){ i--; }
        ]
      });

      loggerA.info('ohai');
      loggerB.info('ohai');

      assert.equal( i, 1 );
    });
  });
});