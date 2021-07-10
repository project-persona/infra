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
    this.workers = []

    this.i = 0
  }

  /**
   *
   * @param client {Buffer}
   * @param req {Buffer}
   */
  dispatchRequest (client, ...req) {
    if (this.workers.length === 0) {
      return // let it time out
    }

    const worker = this.workers[this.i++ % this.workers.length]
    console.log(`Dispatching '${this.name}' ${Buffer.from(client).toString('hex')} req -> ${Buffer.from(worker).toString('hex')}`)
    this.socket.send([
      worker,
      null,
      Header.Worker,
      Message.Request,
      client,
      null,
      ...req
    ]).catch(console.error)
  }

  /**
   *
   * @param worker {Buffer}
   * @param client {Buffer}
   * @param rep {Buffer}
   * @returns {Promise<void>}
   */
  async dispatchReply (worker, client, ...rep) {
    console.log(`Dispatching '${this.name}' ${client.toString('hex')} <- rep ${worker.toString('hex')}`)
    await this.socket.send([client, null, Header.Client, this.name, ...rep])
  }

  /**
   *
   * @param worker {Buffer}
   */
  register (worker) {
    console.log(`Registered worker ${worker.toString('hex')} for '${this.name}'`)
    this.workers.push(worker)
  }
}
