const Worker = require('../worker')

const { makeResponse, makeErrorResponse, validateRequest } = require('./utils')

const RpcProvider = require('./rpc-provider')
const RpcClient = require('./rpc-client')

module.exports = class RpcWorker extends Worker {
  constructor (service, provider, address) {
    super(address)

    if (!(provider.prototype instanceof RpcProvider)) {
      return new Error('Provider must extend from RpcProvider')
    }

    this.service = service
    this.provider = provider

    this.systemServices = RpcClient.create(address, { type: 'system' })
    this.initialized = false
  }

  async process (buffer) {
    if (!this.initialized) {
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(null, new Error('Service not yet ready'), -1) // -32600: Parse error
      ), 'utf-8')]
    }

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
    if (typeof Reflect.get(this.provider.prototype, method) !== 'function') {
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

    const context = Reflect.get(request, 'x-context') || {}
    context.type = context.type || 'user'

    const instance = Reflect.construct(this.provider, [{
      context,
      services: RpcClient.create(this.address, context),
      systemServices: this.systemServices
    }])

    try {
      await instance[RpcProvider.before]()
      const result = await Reflect.apply(Reflect.get(instance, method), instance, params)
      await instance[RpcProvider.after]()

      return [Buffer.from(JSON.stringify(
        makeResponse(request.id, result)
      ), 'utf-8')]
    } catch (err) {
      console.error(err)
      return [Buffer.from(JSON.stringify(
        makeErrorResponse(request.id, err)
      ), 'utf-8')]
    }
  }

  async start () {
    return await super.start(async () => {
      const context = { type: 'system' }
      const instance = Reflect.construct(this.provider, [{
        context,
        services: RpcClient.create(this.address, context),
        systemServices: this.systemServices
      }])

      console.log('Running init hook... Service will not be up until this is completed.')
      await instance[RpcProvider.init]()
      this.initialized = true
      console.log('RpcProvider initialized!')
    })
  }
}
