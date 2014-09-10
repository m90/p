(function(root, factory){
	if (typeof define === 'function' && define.amd){
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.Promise = factory(root.Promise);
	}
})(this, function(previousPromise){

	function isUndefined(el){
		return typeof el === 'undefined';
	}

	function isFunction(el){
		return Object.prototype.toString.call(el) === '[object Function]';
	}

	function isObject(el){
		return Object.prototype.toString.call(el) === '[object Object]';
	}

	function compact(arr){
		var res = [];
		for (var i = 0; i < arr.length; i++){
			if (!!arr[i]){
				res.push(arr[i]);
			}
		}
		return res;
	}

	function tryResolution(builderFn, onFulfilled, onRejected){
		var done = false;
		try{
			builderFn(function(val){
				if (done) return;
				done = true;
				onFulfilled(val);
			}, function(reason){
				if (done) return;
				done = true;
				onRejected(reason);
			});
		} catch(err){
			if (done) return;
			done = true;
			onRejected(err);
		}
	}

	var State = {
		PENDING : 0
		, FULFILLED : 1
		, REJECTED : 2
	};

	var next = (function(){
		if (this.process && isFunction(this.process.nextTick)){
			return this.process.nextTick;
		} else if (this.setImmediate){
			return this.setImmediate;
		} else {
			return function(thunk){
				setTimeout(thunk, 0);
			};
		}
	})();

	function Promise(builderFn){

		if (!isObject(this)){
			return new Promise(builderFn);
		}

		var
		self = this
		, value = isFunction(builderFn) ? null : builderFn
		, state = isFunction(builderFn) || isUndefined(builderFn) ? State.PENDING : State.FULFILLED
		, reason = null
		, stash = [];

		function handle(dfd){
			if (state === State.PENDING){
				stash.push(dfd);
			} else {
				next(function(){
					var callback = state === State.FULFILLED ? dfd.onFulfilled : dfd.onRejected;
					if (!isFunction(callback)){
						if (state === State.FULFILLED){
							dfd.resolve(value);
						} else {
							dfd.reject(reason);
						}
					} else {
						var result;
						try{
							result = callback(state === State.FULFILLED ? value : reason);
						} catch(err){
							dfd.reject(err);
							return;
						}
						dfd.resolve(result);
					}
				});
			}
		}

		function resolve(v){
			if (v === self){
				reject(new TypeError('Cannot resolve with self'));
			}
			if (state === State.REJECTED) return;
			try{
				if (isObject(v) || isFunction(v)){
					var then = v.then;
					if (isFunction(then)){
						tryResolution(then.bind(v), resolve, reject);
						return;
					}
				}
				state = State.FULFILLED;
				value = v;
				handleStash();
			} catch (err){
				reject(err);
			}
		}

		function reject(r){
			if (state === State.FULFILLED) return;
			state = State.REJECTED;
			reason = r;
			handleStash();
		}

		function handleStash(){
			while (stash.length){
				handle(stash.shift());
			}
		}

		this.then = function(onFulfilled, onRejected){
			return new Promise(function(resolve, reject){
				handle({
					onFulfilled : onFulfilled
					, onRejected : onRejected
					, resolve : resolve
					, reject : reject
				});
			});
		};

		if (isFunction(builderFn)){
			// function was passed, try resolution
			tryResolution(builderFn, resolve, reject);
		} else if (isUndefined(builderFn)){
			// nothing was passed, we'll generate a "Deferred"
			this.resolve = function(){
				resolve.apply(this, [].slice.call(arguments));
				return this;
			};
			this.reject = function(){
				reject.apply(this, [].slice.call(arguments));
				return this;
			};
		} else {
			// a value was passed, we'll instantly resolve with that value
			resolve(value);
		}

	}

	Promise.all = function(args){
		return new Promise(function(resolve, reject){
			var result = [];
			function digest(i, val){
				if (isObject(val) && isFunction(val.then)){
					val.then(function(newVal){
						digest(i, newVal);
					}, reject);
				} else {
					result[i] = val;
					if (compact(result).length === args.length){
						resolve(result);
					}
				}
			}
			for (var i = 0; i < args.length; i++){
				digest(i, args[i]);
			}
		});
	};

	Promise.noConflict = function(){
		this.Promise = previousPromise;
		return Promise;
	}.bind(this);

	return Promise;

});
