# Loglog - Hierarchical logging

> Loglog is an extensible, hierarchical logger with sensible transport methods for node.js and the browser

__Install__

```
npm install loglog
```

__Basic Usage:__

```javascript
var logger = require('loglog');

// =>
// hi
logger.info('hi');

// =>
// My name is Bob and I am a Cat. Cool. {
//   user_id: 23,
//   name: 'Bob',
//   type: 'Cat',
//   another_prop: 1,
//   another_prop2: 2
//   ... <-- Default transport truncates your JSON
// }

logger.info( 'My name is %s and I am a %s.', 'Bob', 'Cat', 'Cool.', {
  user_id: 23
, name: 'Bob'
, type: 'Cat'
, another_prop: 1
, another_prop2: 2
, another_prop3: 3
, another_prop4: 4
});

logger = logger.create('App');

// =>
// [App] Starting...
logger.info('Starting...');
```

## Docs

Loglog is all about hierarchy. You can always inherit from a logger by calling [.create](#create) on the logging instance. In fact, the loglog module actually exports a base instance of itself, so you can start using it right away with defaults (with no component specified). That means the loglog module API is identical to logger instance API. Yay!

### Methods

#### ```create( [component, [options]] )```

Creates a new instance of loglog inheriting from the existing instance. The new instance will have a reference to the parent instance via the [parent property](#parent).

__Params:__

```
component - The name of the logging component
options   - Options for this loglog instance
```

__Options:__

```javascript
{
  // Parent logger instance
  parent Loglog
  // List of parent components
, parents String[]
  // Data to be included in each log entry
, data Object
  // List of properties that child loggers receive in `data`
, childrenReceive String[]
}
```

The following properties are inherited:

* [parents](parents) (via appends parent.component to parent.parents)
* [options.data](options.data)
* [component](component) (if the component isn't specified)
* [transport](transport)

__Example:__

```javascript
// Create an express middleware logger that inherits from
// from a Requests logger that inherits from the Application
// level logger. All entries from the Middleware Logger should
// include info about the request (req id, method, etc.)
var appLogger = require('loglog').create('App');
var app = require('express')();

app.use( function( req, res, next ){
  req.logger = appLogger.create('Requests', {
    data: {
      req: { id: uuid(), method: req.method, route: req.route /* ... */ }
    }
  });

  next();
});

// ...

app.use( function( req, res, next ){
  var logger = req.logger.create('My Middleware');

  // [App.Requests.My Middleware] Some Info {
  //    req: {
  //      id: '...',
  //      method: 'GET',
  //      route: '/users/:id'
  //    },
  //    a: true
  //  }
  logger.info( 'Some Info', { a: true } );

  next();
});
```

#### ```info( ... )```

Passes all non-object parameters to `util.format` and returns the result as `entry.message` to the [transport](transports). Any objects will get mixed into `entry.data`. Sets `entry.level` to `info`. Comes with default `timestamp`, `uuid`, `component`, and `parents` properties.

__Example:__

```javascript
// Hi, I am a doge and I am 3 years old. Goodybye {
  a: true
}
logger.info('Hi, I am a %s and I %s years old.', 'doge', 3, 'Goodbye', { a: true });
```

#### ```warn( ... )```

Same as [info](#info) but `entry.level` set to `warn`.

#### ```error( ... )```

Same as [info](#info) but `entry.level` set to `error`.

### Properties

#### ```component```

The component name for this logger, (like `App` or `Requests`)

#### ```parent```

The parent instance of the logger. (All loggers inherit from the base `loglog` instance).

#### ```parents```

List of parent components (String Array).

#### ```options```

Options object passed to the logger [create](#create).

#### ```inheritableOptions```

List of [options](#options) keys that will be inherited during [create](#create).