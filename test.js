var promisesAplusTests = require('promises-aplus-tests');
var adapter = require('./test-adapter');

promisesAplusTests(adapter, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
});