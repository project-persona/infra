const { Router } = require('zeromq')

const { Header, Message } = require('./types')
const Service = require('./service')

const { BROKER_ADDR } = require('./config')

module.exports = class Broker {
  constructor (address = BROKER_ADDR) {
    this.address = address
    this.socket = new Router({ sendHighWaterMark: 1, sendTimeout: 1 }) // TODO: extract constants to config?
    this.services = new Map()
    this.workers = new Map()
  }

  async start () {
    console.log(`Starting broker on ${this.address}`)
    await this.socket.bind(this.address)

    for await (const [sender, /* unused */, header, ...rest] of this.socket) {
      switch (header.toString()) {
        case Header.Client:
          // noinspection JSCheckFunctionSignatures
          this.handleClient(sender, ...rest)
          break

        case Header.Worker:
          // noinspection JSCheckFunctionSignatures
          this.handleWorker(sender, ...rest)
          break

        default:
          console.error(new Error(`Invalid message header: ${header}`))
      }
    }
  }

  /**
   *
   * @param client {Buffer}
   * @param service {Buffer}
   * @param req {Buffer}
   */
  handleClient (client, service, ...req) {
    if (service) {
      this.dispatchRequest(client, service, ...req)
    }
  }

  /**
   *
   * @param worker {Buffer}
   * @param type {Buffer}
   * @param rest {Buffer}
   */
  handleWorker (worker, type, ...rest) {
    switch (type && type.toString()) {
      case Message.Ready:
        // [service] = rest
        this.register(worker, rest[0])
        break

      case Message.Reply:
        // [client, blank, ...rep] = rest
        this.dispatchReply(worker, rest[0], rest.slice(2))
        break

      case Message.Heartbeat:
        this.processHeartbeat(worker)
        break

      case Message.Disconnect:
        this.deregister(worker)
        break

      default:
        console.error(new Error(`Invalid message type: ${type.toString('hex')}`))
    }
  }

  register (worker, service) {
    this.setWorkerService(worker, service)
    this.getService(service).register(worker)
  }

  dispatchRequest (client, service, ...req) {
    this.getService(service).dispatchRequest(client, ...req)
  }

  dispatchReply (worker, client, ...rep) {
    const service = this.getWorkerService(worker)
    this.getService(service).dispatchReply(worker, client, ...rep).catch(console.error)
  }

  processHeartbeat (worker) {
    const service = this.getWorkerService(worker)
    if (service) {
      this.getService(service).processHeartbeat(worker)
    }
  }

  deregister (worker) {
    const service = this.getWorkerService(worker)
    this.getService(service).deregister(worker)
  }

  getService (name) {
    const key = name.toString()
    if (this.services.has(key)) {
      return this.services.get(key)
    }

    const service = new Service(this.socket, key)
    this.services.set(key, service)
    return service
  }

  /**
   *
   * @param worker {Buffer}
   * @returns {Service}
   */
  getWorkerService (worker) {
    return this.workers.get(worker.toString('hex'))
  }

  /**
   *
   * @param worker {Buffer}
   * @param service {Service}
   */
  setWorkerService (worker, service) {
    this.workers.set(worker.toString('hex'), service)
  }
}
