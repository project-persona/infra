const bodyParser = require('koa-bodyparser')

module.exports = (options = {}) => {
  return bodyParser({
    ...options
  })
}
