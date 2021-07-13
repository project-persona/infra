const firebase = require('firebase')
const { v4: uuid } = require('uuid')

const { convertRpcErrorToNative } = require('../../service-broker/lib/rpc/utils')

const INSTANTIATION_TOKEN = Symbol('INSTANTIATION_TOKEN')

module.exports = class Client {
  constructor (fireApp, gateway, token) {
    this.fireApp = fireApp
    this.gateway = gateway

    if (token !== INSTANTIATION_TOKEN) {
      throw new Error('Create a client via RpcClient.create() static method')
    }
  }

  static create (fireApp = firebase.app, gateway) {
    const instance = new Client(fireApp, gateway, INSTANTIATION_TOKEN)

    return new Proxy(() => undefined, {
      get (target, service, receiver) {
        return new Proxy(() => undefined, {
          get (target, method, receiver) {
            return async (...params) => {
              const payload = {
                jsonrpc: '2.0',
                id: uuid(),
                method: `${service}/${method}`,
                params
              }

              const headers = {
                'content-type': 'application/json'
              }

              if (instance.fireApp.auth().currentUser) {
                // attach JWT token if logged in
                headers.authorization = 'Bearer ' + await instance.fireApp.auth().currentUser.getIdToken()
              }

              const response = await (await window.fetch(instance.gateway, {
                method: 'POST',
                headers,
                cache: 'no-cache',
                body: JSON.stringify(payload)
              })).json()

              if (response.error) {
                throw convertRpcErrorToNative(response.error)
              }

              return response.result
            }
          }
        })
      }
    })
  }
}
