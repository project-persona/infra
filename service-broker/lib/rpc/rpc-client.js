const { v4: uuid } = require('uuid')

const Client = require('../client')

const INSTANTIATION_TOKEN = Symbol('INSTANTIATION_TOKEN')

// TODO: insert contextual messages if necessary
module.exports = class RpcClient extends Client {
  constructor (address, token) {
    super(address)

    if (token !== INSTANTIATION_TOKEN) {
      throw new Error('Create a client via RpcClient.create() static method')
    }
  }

  static create (address) {
    const instance = new RpcClient(address, INSTANTIATION_TOKEN)

    return new Proxy(() => undefined, {
      get (target, service, receiver) {
        return new Proxy(() => undefined, {
          get (target, method, receiver) {
            return async (...params) => {
              const json = (await instance.request(service, Buffer.from(JSON.stringify({
                jsonrpc: '2.0',
                id: uuid(),
                method: `${service}/${method}`,
                params
              }), 'utf-8')))[0]

              const response = JSON.parse(json.toString('utf-8'))

              if (response.error) {
                const error = new Error(response.error.message)
                error.code = response.error.code

                response.error.data = response.error.data || {}
                error.stack = response.error.data.stack || error.stack
                error.name = response.error.data.name || 'RpcError'

                throw error
              }

              return response.result
            }
          }
        })
      }
    })
  }
}