const { makeErrorResponse } = require('../../../service-broker/lib/rpc/utils')

module.exports = (options = {}) => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      if (error.stack.indexOf('koa-bodyparser') > -1 && error.name === 'SyntaxError') {
        // patch for koa-bodyparser
        error.code = -32600
      }

      ctx.body = JSON.stringify(makeErrorResponse(ctx.id, error))
      ctx.set('content-type', 'application/json')
    }
  }
}
