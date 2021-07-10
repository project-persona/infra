const { Request } = require('zeromq')

const { Header } = require('./types')

const { BROKER_ADDR } = require('./config')

module.exports = class Client {
  constructor (address = BROKER_ADDR) {
    this.address = address
  }

  async request (service, ...req) {
    // XXX: we rely on zmq router to distinguish different requests by the same client.
    const socket = new Request({ receiveTimeout: 2000 }) // TODO: extract constants to config?
    socket.connect(this.address)

    console.log(`Requesting service '${service}' with ${req.reduce((acc, cur) => acc + cur.length, 0)} bytes payload`)
    await socket.send([Header.Client, service, ...req])

    try {
      const [/* blank */, /* header */, ...res] = await socket.receive()
      console.log(`Received from '${service}' with ${res.reduce((acc, cur) => acc + cur.length, 0)} bytes payload`)
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
