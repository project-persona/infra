// eslint-disable-next-line no-unused-vars
const { Router } = require('zeromq')

const { Header, Message } = require('./types')

module.exports = class Service {
  /**
   *
   * @param socket {Router}
   * @param name {string}
   */
  constructor (socket, name) {
    this.socket = socket
    this.name = name
    this.workers = new Map()
    this.requests = []
  }

  /**
   *
   * @param client {Buffer}
   * @param req {Buffer}
   */
  dispatchRequest (client, ...req) {
    this.requests.push([client, req])
    this.dispatchPending().catch(console.error)
  }

  /**
   *
   * @param worker {Buffer}
   * @param client {Buffer}
   * @param rep {Buffer}
   * @returns {Promise<void>}
   */
  async dispatchReply (worker, client, ...rep) {
    this.workers.set(worker.toString('hex'), worker)

    console.log(`Dispatching '${this.name}' ${client.toString('hex')} <- rep ${worker.toString('hex')}`)

    await this.socket.send([client, null, Header.Client, this.name, ...rep])

    this.dispatchPending().catch(console.error)
  }

  async dispatchPending () {
    while (this.workers.size && this.requests.length) {
      const [key, worker] = this.workers.entries().next().value
      this.workers.delete(key)
      const [client, req] = this.requests.shift()

      console.log(`Dispatching '${this.name}' ${Buffer.from(client).toString('hex')} req -> ${Buffer.from(worker).toString('hex')}`)

      await this.socket.send([
        worker,
        null,
        Header.Worker,
        Message.Request,
        client,
        null,
        ...req
      ])
    }
  }

  /**
   *
   * @param worker {Buffer}
   */
  register (worker) {
    console.log(`Registered worker ${worker.toString('hex')} for '${this.name}'`)
    this.workers.set(worker.toString('hex'), worker)
    this.dispatchPending().catch(console.error)
  }
}
