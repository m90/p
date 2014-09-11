var Promise = require('./p.js');

exports.deferred = function () {
	var dfd = new Promise();
	return {
		promise: dfd.promise(),
		resolve: dfd.resolve,
		reject: dfd.reject
	};
};