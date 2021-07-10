const { Dealer } = require('zeromq')

const { Header, Message } = require('./types')

const { BROKER_ADDR } = require('./config')

module.exports = class Worker {
  constructor (address = BROKER_ADDR) {
    this.address = address
    this.socket = new Dealer()
    this.service = ''

    this.socket.connect(address)
  }

  async start () {
    await this.socket.send([null, Header.Worker, Message.Ready, this.service])

    for await (const [/* unused */, /* header */, /* type */, client, /* unused */, ...req] of this.socket) {
      const rep = await this.process(...req)
      try {
        await this.socket.send([
          null,
          Header.Worker,
          Message.Reply,
          client,
          null,
          ...rep
        ])
      } catch (err) {
        console.error(`Unable to send reply for ${this.address}`)
      }
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
   * @param req {Buffer}
   * @returns {Promise<Buffer[]>}
   */
  async process (...req) {
    return req
  }
}
