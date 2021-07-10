const compress = require('koa-compress')

const { Z_SYNC_FLUSH } = require('zlib').constants

module.exports = (options = {}) => {
  options.threshold = options.threshold || 2048
  options.gzip = options.gzip || {}
  options.gzip.flush = options.gzip.flush || Z_SYNC_FLUSH
  options.deflate = options.deflate || {}
  options.deflate.flush = options.deflate.flush || Z_SYNC_FLUSH
  options.br = {}

  return compress(options)
}
