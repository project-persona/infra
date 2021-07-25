// eslint-disable-next-line no-unused-vars
const { Router } = require('zeromq')

const { Header, Message } = require('./types')

const { HEARTBEAT_INTERVAL, MAX_SKIPPED_HEARTBEAT } = require('./config')

/**
 *
 * @param worker {Buffer}
 * @param deregister
 */
const timeoutWorker = (worker, deregister) => setTimeout(() => {
  console.log(`Worker ${worker.toString('hex')} skipped ${MAX_SKIPPED_HEARTBEAT} heartbeats in a row`)
  deregister(worker)
}, HEARTBEAT_INTERVAL * MAX_SKIPPED_HEARTBEAT)

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
    this.timeoutIds = new Map()

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

    const worker = this.workers[this.i++ % this.workers.length] // round robin for now
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
    this.processHeartbeat(worker)

    console.log(`Dispatching '${this.name}' ${client.toString('hex')} <- rep ${worker.toString('hex')}`)
    await this.socket.send([client, null, Header.Client, this.name, ...rep])
  }

  /**
   *
   * @param worker {Buffer}
   */
  processHeartbeat (worker) {
    clearTimeout(this.timeoutIds.get(worker.toString('hex')))
    this.timeoutIds.set(worker.toString('hex'), timeoutWorker(worker, this.deregister.bind(this)))
  }

  /**
   *
   * @param worker {Buffer}
   */
  register (worker) {
    console.log(`Registered worker ${worker.toString('hex')} for '${this.name}'`)
    this.workers.push(worker)

    this.timeoutIds.set(worker.toString('hex'), timeoutWorker(worker, this.deregister.bind(this)))
  }

  /**
   *
   * @param worker {Buffer}
   */
  deregister (worker) {
    console.log(`Deregistered worker ${worker.toString('hex')} for '${this.name}'`)

    clearTimeout(this.timeoutIds.get(worker.toString('hex')))
    this.timeoutIds.delete(worker.toString('hex'))

    // noinspection JSCheckFunctionSignatures
    this.workers = this.workers.filter(w => w.toString('hex') !== worker.toString('hex'))
  }
}
