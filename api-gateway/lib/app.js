const util = require('util')

const Koa = require('koa')

module.exports = class App extends Koa {
  onerror (err) {
    // disable koa default error logging
    const isNativeError = Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error
    if (!isNativeError) {
      console.error(new TypeError(util.format('non-native error thrown: %j', err)))
    }
  }
}
