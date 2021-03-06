const { Dealer } = require('zeromq')

const { Header, Message } = require('./types')

const { BROKER_ADDR, HEARTBEAT_INTERVAL } = require('./config')

module.exports = class Worker {
  constructor (address = BROKER_ADDR) {
    this.address = address
    this.socket = new Dealer()
    this.service = ''

    this.timeoutId = 0
  }

  async start (beforeListening = () => undefined) {
    console.log(`Connecting to broker at: ${this.address}`)
    this.socket.connect(this.address)

    await this.socket.send([null, Header.Worker, Message.Ready, this.service])
    console.log('Worker ready')

    this.resetHeartbeat()

    await beforeListening()

    for await (const [/* unused */, /* header */, /* type */, client, /* unused */, ...req] of this.socket) {
      this.handleRequest(client, ...req).catch(console.error)
    }
  }

  async stop () {
    if (!this.socket.closed) {
      await this.socket.send([
        null,
        Header.Worker,
        Message.Disconnect,
        this.service
      ])
      this.socket.close()
    }
  }

  /**
   *
   * @param client {Buffer}
   * @param req
   */
  async handleRequest (client, ...req) {
    console.log(`Handling request from ${client.toString('hex')}`)
    const rep = await this.process(...req)
    console.log(`Request processed. Sending result back to ${client.toString('hex')}`)
    await this.dispatchReply(client, ...rep)
  }

  async dispatchReply (client, ...rep) {
    await this.socket.send([
      null,
      Header.Worker,
      Message.Reply,
      client,
      null,
      ...rep
    ])

    this.resetHeartbeat()
  }

  async dispatchHeartbeat () {
    await this.socket.send([
      null,
      Header.Worker,
      Message.Heartbeat
    ])

    this.resetHeartbeat()
  }

  resetHeartbeat () {
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(() => this.dispatchHeartbeat(), HEARTBEAT_INTERVAL)
  }

  /**
   *
   * @param req {Buffer}
   * @returns {Promise<Buffer[]>}
   */
  async process (...req) {
    return req
  }
}
