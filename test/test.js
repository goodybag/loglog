var loglog  = require('../');
var loggerA = loglog.create('Component A');

loglog.info('Hey!');
loggerA.info('Ho!');
loggerA.warn('Ho!');
loggerA.error('Ho!');

loggerA.info('Hello, %s', 'Bob', {
  a: true
, b: 1
});

var loggerB = loggerA.create('Component B');

loggerB.info('Hello, %s. You are %s years old!', 'Bill', 42, 'Something else?', {
  a: false
, b: 2
});