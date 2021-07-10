module.exports = class RpcProvider {
  constructor ({ context = { type: 'user' }, services, systemServices }) {
    this.context = context
    this.services = services
    this.systemServices = systemServices
  }
}
