const { Worker } = require('../../index')

const { makeResponse, makeErrorResponse, validateRequest } = require('./utils')

const RpcProvider = require('./rpc-provider')

module.exports = class JsonRpcWorker extends Worker {
  constructor (service, provider, address) {
    super(address)

    if (!(provider.prototype instanceof RpcProvider)) {
      return new Error('Provider must extend from RpcProvider')
    }

    this.service = service
    this.provider = provider
  }

  async process (buffer) {
    let request
    try {
      request = JSON.parse(buffer.toString('utf-8'))
    } catch (err) {
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(null, err, -32600) // -32600: Parse error
      ), 'utf-8')]
    }

    try {
      validateRequest(request)
    } catch (err) {
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(request.id || null, err, 32700) // -32700: Invalid request
      ), 'utf-8')]
    }

    // The destination (ie. service) is actually communicated and routed by 7/MDP
    // but for the sake of consistency, let's keep the same messaging format
    const service = request.method.substring(0, request.method.indexOf('/'))
    if (service !== this.service) {
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(
          request.id,
          new Error(`Worker provides service "${this.service}" cannot serve "${service}"`),
          -32601 // -32601: Method not found
        )), 'utf-8')]
    }

    const method = request.method.replace(service + '/', '')
    if (typeof this.provider.prototype[method] !== 'function') {
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(
          request.id,
          new Error(`Service "${this.service}" does not have method "${method}"`),
          -32601 // -32601: Method not found
        )), 'utf-8')]
    }

    let params = []
    if (request.params instanceof Array) {
      params = request.params
    } else if (typeof request.params === 'object') {
      params.push(request.params)
    }

    // TODO: construct a context object and bind to the provider instance

    const instance = Reflect.construct(this.provider, [])
    try {
      return [Buffer.from(JSON.stringify(
        makeResponse(request.id, await Reflect.apply(instance[method], instance, params))
      ), 'utf-8')]
    } catch (err) {
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(request.id, err)
      ), 'utf-8')]
    }
  }
}
