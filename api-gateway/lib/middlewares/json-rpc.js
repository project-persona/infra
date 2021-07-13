const { Client } = require('../../../service-broker')
const { makeErrorResponse, validateRequest } = require('../../../service-broker/lib/rpc/utils')

module.exports = ({ brokerAddress }) => {
  return async (ctx, next) => {
    if (ctx.request.method !== 'POST') {
      throw new Error('Only HTTP POST is acceptable to a JSON RPC 2.0 gateway')
    }

    const request = ctx.request.body

    try {
      validateRequest(request)
    } catch (err) {
      ctx.body = makeErrorResponse(request.id || null, err, 32700)
      return
    }

    const service = request.method.substring(0, request.method.indexOf('/'))

    request['x-context'] = request['x-context'] || {}
    if (ctx.request.headers.authorization) {
      request['x-context'].authorization = ctx.request.headers.authorization
    }

    ctx.body = (await new Client(brokerAddress).request(service, JSON.stringify(request)))[0].toString('utf-8')
    ctx.set('content-type', 'application/json')
  }
}
