const Client = require('./lib/client')

const exports = {
  Client
}

// compatible for commonjs convention
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exports
}

// mount directly to window
if (typeof window !== 'undefined') {
  window.PersonaSdk = exports
}
