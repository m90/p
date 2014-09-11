# p
> yet another A+ Promise (small enough to include in your own library)

Install via npm:
```sh
$ npm install ppromise --save
```

In addition to the [specified A+ behavior](https://github.com/promises-aplus/promises-spec):
```js
var readJSON = new Promise(function(resolve, reject){
    fs.readFile('something.json', {encoding : 'utf-8'}, function(err, result){
        if (err){
            reject(err);
        } else {
            resolve(JSON.parse(result));
        }
    });
});

readJSON.then(function(data){
    console.log(data.awesome);
}, function(err){
    console.error(err);
})
```
`p` also implements `Promise.all`:
```js
Promise.all([promiseA, promiseB, promiseC]).then(function(results){
    var promiseAResult = results[0];
    var promiseBResult = results[1];
    var promiseCResult = results[2];
});
```
and the creation of `Deferred`s when passing no arguments to the constructor:
```js
var dfd = new Promise();
var promise = dfd.promise(); // this will only contain the `then`
fs.readFile('something.json', {encoding : 'utf-8'}, function(err, result){
    if (err){
        dfd.reject(err);
    } else {
        dfd.resolve(JSON.parse(result));
    }
});
dfd.then(function(data){
    console.log(data.awesome);
}, function(err){
    console.error(err);
})
```

The library works as AMD or CommonJS module, or as a plain script tag (exporting to `window.Promise`). If you'd like to get back the original `window.Promise` (i.e. native implementations) you can use `Promise.noConflict`:
```js
var pPromise = Promise.noConflict();
console.log(Promise) // => function(){ [native code] } (or undefined)
```

##License
MIT © [Frederik Ring](http://www.frederikring.com)