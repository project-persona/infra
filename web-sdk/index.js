const Client = require('./lib/client')

const components = {
  Client
}

// compatible for commonjs convention
if (typeof module !== 'undefined' && module.exports) {
  module.exports = components
}

// mount directly to window
if (typeof window !== 'undefined') {
  window.PersonaSdk = components
}
